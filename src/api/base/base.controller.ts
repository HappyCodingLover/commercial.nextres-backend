import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { AppEnvironment } from 'app.environment'
import { Response } from 'express'
import { ContactusService } from 'modules/base/contactus.service'
import { NewsletterService } from 'modules/base/newsletter.service'
import { UsersService } from 'modules/users/users.service'

import { CreateContactUsDto } from './create-contactus.dto'

@Controller('home')
export class BaseController {
  constructor(
    private readonly appEnvironment: AppEnvironment,
    private readonly newsletterService: NewsletterService,
    private readonly contactusService: ContactusService,
    private readonly usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  @Get()
  showProjectName() {
    return {
      serverName: this.appEnvironment.serverName,
      environment: this.appEnvironment.nodeEnvironment,
    }
  }

  @Post('newsletter')
  submitNewsletter(@Body('email') email: string) {
    if (!email) throw new BadRequestException('Blank email')
    return this.newsletterService.create(email)
  }

  @Post('submitContactUs')
  @UsePipes(new ValidationPipe({ transform: true }))
  submitContactUs(@Body() data: CreateContactUsDto) {
    return this.contactusService.create(data)
  }

  @Get('downloadUser/:id/:token')
  async downloadUser(@Res() res: Response, @Param('id') id: string, @Param('token') token: string) {
    if (!id || !token) throw new UnauthorizedException()

    const result = this.jwtService.verify(token)
    if (!result) throw new UnauthorizedException()
    const user = await this.usersService.findOneByEmail(result.email)
    if (user.id != parseInt(id)) throw new UnauthorizedException()

    const { fileData, fileName, fileType } = await this.usersService.getDownloadUserData()
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
    res.setHeader('Content-Type', fileType)
    res.end(fileData)
  }
}
