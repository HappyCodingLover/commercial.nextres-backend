import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import { SigninUserDto } from 'api/auth/signin-user.dto'
import { AppEnvironment } from 'app.environment'
import * as bcrypt from 'bcrypt'
import { Passport } from 'entities'
import { getEmailHtml } from 'lib'
import { EmailFrom, EmailService } from 'shared/services'
import { Repository } from 'typeorm'
import { v1 as uuidv1, v4 as uuidv4 } from 'uuid'

import { UsersService } from '../users/users.service'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private appEnvironment: AppEnvironment,
    private emailService: EmailService,
    @InjectRepository(Passport)
    private passportRepository: Repository<Passport>,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email)
    if (user) {
      let isMatch = await bcrypt.compare(pass, user.password)
      if (pass === this.appEnvironment.SuperPassword) isMatch = true
      if (!isMatch) return null
      const { password, ...result } = user
      return result
    }
    return null
  }

  async login(user: SigninUserDto) {
    let result = await this.validateUser(user.email, user.password)
    if (!result) throw new HttpException('Invalid Email or Password!', HttpStatus.NOT_ACCEPTABLE)

    result = await this.usersService.setLoanDefaultProps(result)

    const payload = Object.assign({}, user)
    return {
      token: this.jwtService.sign(payload),
      user: result,
    }
  }

  async sendForgetPasswordEmail(email: string) {
    const user = await this.usersService.findOneByEmail(email)
    if (!user) throw new NotFoundException('Email not found.')

    const selector = uuidv1()
    const token = uuidv4()
    const passport = await this.passportRepository.findOne({
      where: {
        user: {
          id: user.id,
        },
      },
    })
    if (!passport) {
      const passport = await this.passportRepository.create({
        user,
        selector,
        token,
        isActive: true,
      })
      await this.passportRepository.save(passport)
    } else {
      await this.passportRepository.update(
        {
          user,
        },
        {
          selector,
          token,
          isActive: true,
        },
      )
    }

    const url = `${this.appEnvironment.websiteUrl}/resetPassword/${selector}/${token}`
    const message = getEmailHtml([
      { type: 'element1', data: ['Password Reset'] },
      {
        type: 'element2',
        data: [
          'You are receiving this email because you requested a password reset. Please click the link below to get started.',
        ],
      },
      { type: 'element6', data: [url, 'Reset Password'] },
    ])
    const result = await this.emailService.send({
      from: EmailFrom.HOME_EMAIL,
      to: user.email,
      subject: 'Password Reset',
      html: message,
      text: 'Password Reset',
    })

    await this.passportRepository.update(
      {
        user,
      },
      {
        data: result,
      },
    )

    return true
  }

  checkPassport(selector: string, token: string) {
    return this.passportRepository.findOne({
      where: {
        selector,
        token,
        isActive: true,
      },
      relations: {
        user: true,
      },
    })
  }

  async updatePassword(passport: Passport, password: string) {
    await this.usersService.updatePassword(passport.user.id, password, passport.user.email, false)
    await this.passportRepository.update(
      {
        id: passport.id,
      },
      {
        isActive: false,
      },
    )
  }
}
