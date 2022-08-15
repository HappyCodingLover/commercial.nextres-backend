import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Condition, ConditionTemplate, Task } from 'entities'
import { BaseModule } from 'modules/base/base.module'

import { ConditionService } from './condition.service'
import { TaskService } from './task.service'
import { TemplateService } from './template.service'

@Module({
  imports: [TypeOrmModule.forFeature([Condition, ConditionTemplate, Task]), BaseModule],
  providers: [ConditionService, TemplateService, TaskService],
  exports: [ConditionService, TemplateService, TaskService],
})
export class ConditionModule {}
