import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Version,
} from '@nestjs/common'
import { CreateUserDto } from 'api/user/create-user.dto'
import { IpAddress } from 'decorators'
import { AccountType } from 'entities'
import { AuthService } from 'modules/auth/auth.service'
import { JwtAuthGuard } from 'modules/auth/jwt-auth.guard'
import { UserActivityService } from 'modules/users/user-activity.service'
import { UsersService } from 'modules/users/users.service'

import { SigninUserDto } from './signin-user.dto'

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
    private readonly userActivityService: UserActivityService,
  ) {}

  @Post('login')
  @UsePipes(new ValidationPipe({ transform: true }))
  async login(@IpAddress() ipAddress, @Body() signinUserDto: SigninUserDto) {
    const loginResult = await this.authService.login(signinUserDto)
    await this.userActivityService.onLogin(loginResult.user.id, ipAddress)
    return loginResult
  }

  @Put('register')
  @UsePipes(new ValidationPipe({ transform: true }))
  async register(@IpAddress() ipAddress, @Body() userData: CreateUserDto) {
    userData.accountType = AccountType.BROKER
    userData.isActive = false
    const result = await this.userService.create(userData, userData.email)
    await this.userActivityService.onRegisterUser(userData.email, ipAddress, userData)
    return result
  }

  @Version('v1')
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user
  }

  @Post('forgetPassword')
  async forgetPassword(@IpAddress() ipAddress, @Body('email') email: string) {
    if (!email) throw new NotFoundException('No email found')
    await this.userActivityService.onForgotPassword(email, ipAddress)
    return this.authService.sendForgetPasswordEmail(email)
  }

  @Get('checkPassport/:selector/:token')
  async checkPassport(@Param('selector') selector: string, @Param('token') token: string) {
    const passport = await this.authService.checkPassport(selector, token)
    if (!passport) throw new NotFoundException('Invalid Passport')
    return {}
  }

  @Post('resetPassword/:selector/:token')
  async resetPassword(
    @IpAddress() ipAddress,
    @Param('selector') selector: string,
    @Param('token') token: string,
    @Body('password') password: string,
  ) {
    const passport = await this.authService.checkPassport(selector, token)
    if (!passport) throw new NotFoundException('Invalid Passport')
    await this.authService.updatePassword(passport, password)
    await this.userActivityService.onResetPassword(passport.user.id, ipAddress)
    return {}
  }

  @Get('getAccountExecutives')
  async roles() {
    return this.userService.roles(AccountType.ACCOUNT_EXECUTIVE, 0, { accountType: AccountType.ADMIN })
  }
}
