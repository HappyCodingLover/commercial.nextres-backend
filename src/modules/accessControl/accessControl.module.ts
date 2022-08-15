import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Permission } from 'entities/permission.entity'
import { Role } from 'entities/role.entity'

import { AccessControlService } from './accessControl.service'

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission])],
  providers: [AccessControlService],
  exports: [AccessControlService],
})
export class AccessControlModule {}
