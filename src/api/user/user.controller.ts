import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Request,
  UnauthorizedException,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import { Permission } from 'decorators'
import { AccountType, UserOrderBy, UserStatus } from 'entities'
import { JwtAuthGuard } from 'modules/auth/jwt-auth.guard'
import { UserActivityService } from 'modules/users/user-activity.service'
import { UserLogService } from 'modules/users/user-log.service'
import { UsersService } from 'modules/users/users.service'
import { SessionService } from 'services/session.service'

import { CreateUserDto } from './create-user.dto'

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    private userService: UsersService,
    private userLogService: UserLogService,
    private sessionService: SessionService,
    private userActivityService: UserActivityService,
  ) {}

  @Get()
  async list(
    @Query('query') query: string = '',
    @Query('status') status: UserStatus = UserStatus.Active,
    @Query('accountType') accountType: AccountType = null,
    @Query('orderBy') orderBy: UserOrderBy = 'companyName',
    @Query('orderDir') orderDir: 1 | -1 = 1,
    @Query('skip') skip: number = 0,
    @Query('count') count: number = 10,
  ) {
    return this.userService.find(
      query,
      status,
      accountType,
      orderBy,
      orderDir,
      skip,
      count,
      this.sessionService.currentUser,
    )
  }

  @Get('permissions')
  async getUserPermissions(@Request() req) {
    const { email } = req.user
    return this.userService.getUserPermissions(email)
  }

  @Get('/userTree')
  async userTree() {
    return this.userService.userTree()
  }

  @Get('/roles')
  async roles(@Query('accountType') accountType: AccountType, @Query('userId') userId: number) {
    return this.userService.roles(accountType, userId, this.sessionService.currentUser)
  }

  @Get('/props/:userId')
  async props(@Param('userId') userId: number) {
    return this.userService.props(userId)
  }

  @Get('/children/:userId')
  async children(@Param('userId') userId: number) {
    return this.userService.children(userId)
  }

  @Get('/logs/:userId/:fieldName')
  async logs(@Param('userId') userId: number, @Param('fieldName') fieldName: string) {
    return this.userLogService.get(userId, fieldName)
  }

  @Put('/children/:userId')
  async updateChildren(
    @Request() req,
    @Param('userId') userId: number,
    @Body('values') values: Record<string, string>,
  ) {
    const { email } = req.user
    return this.userService.updateChildren(userId, values, email)
  }

  @Post('/submit')
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Request() req, @Body() userData: CreateUserDto) {
    const { email } = req.user
    return this.userService.create(userData, email)
  }

  @Put('/submit/:id')
  @UsePipes(new ValidationPipe({ transform: true }))
  update(@Request() req, @Body() userData: CreateUserDto, @Param('id') userId: number) {
    const { email } = req.user
    return this.userService.update(userId, userData, email)
  }

  @Put('/updateStatus/:id')
  updateStatus(@Request() req, @Param('id') userId: number, @Body('status') status: boolean) {
    const { email } = req.user
    return this.userService.updateIsActive(userId, status, email)
  }

  @Delete('/delete/:id')
  delete(@Param('id') userId: number) {
    return this.userService.delete(userId)
  }

  @Put('/updatePwd/:id')
  async updatePwd(@Request() req, @Param('id') userId: number, @Body('password') password: string) {
    const { id, email } = req.user
    if (userId != id) {
      const operator = await this.userService.findOneByEmail(email)
      if (operator.accountType != AccountType.ADMIN) throw new UnauthorizedException("You can't update password")
    }
    return this.userService.updatePassword(userId, password, email)
  }

  @Put('/profile')
  @UsePipes(new ValidationPipe({ transform: true }))
  updateProfile(@Request() req, @Body() userData: CreateUserDto) {
    const { id, email } = req.user
    return this.userService.update(id, userData, email)
  }

  @Get('activity')
  getActivity(
    @Permission('MANAGE_USER_ACTIVITY') user,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('email') email: string,
  ) {
    return this.userActivityService.getActivity(startDate, endDate, email)
  }

  @Get('activity/:userId')
  getActivities(
    @Permission('MANAGE_USER_ACTIVITY') user,
    @Param('userId') userId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('count', ParseIntPipe) count: number,
    @Query('skip', ParseIntPipe) skip: number,
  ) {
    return this.userActivityService.getActivities(userId, startDate, endDate, count, skip)
  }
}
