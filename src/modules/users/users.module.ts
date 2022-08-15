import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User, UserActivity, UserLog } from 'entities'
import { AccessControlModule } from 'modules/accessControl/accessControl.module'
import { SessionService } from 'services'

import { UserActivityService } from './user-activity.service'
import { UserLogService } from './user-log.service'
import { UsersService } from './users.service'

@Module({
  imports: [TypeOrmModule.forFeature([User, UserLog, UserActivity]), AccessControlModule],
  providers: [UsersService, UserLogService, SessionService, UserActivityService],
  exports: [UsersService, UserLogService, SessionService, UserActivityService],
})
export class UsersModule {}
