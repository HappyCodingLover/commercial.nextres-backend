import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common'
import { JwtAuthGuard } from 'modules/auth/jwt-auth.guard'
import { ConditionService } from 'modules/condition/condition.service'
import { TaskService } from 'modules/condition/task.service'
import { TemplateService } from 'modules/condition/template.service'

import { ConditionDto } from './condition.dto'
import { TaskDto } from './task.dto'
import { TemplateDto } from './template.dto'

@Controller()
@UseGuards(JwtAuthGuard)
export class ConditionController {
  constructor(
    private readonly conditionService: ConditionService,
    private readonly templateService: TemplateService,
    private readonly taskService: TaskService,
  ) {}

  @Get('condition')
  conditions() {
    return this.conditionService.find()
  }

  @Get('condition/newNo')
  async generateNewConditionNo() {
    const conditionNo = await this.conditionService.nextConditionNo()
    return {
      conditionNo,
    }
  }

  @Post('conditions/byNumbers')
  getConditionsByNumbers(@Body('conditionNos') conditionNos: Array<number>) {
    return this.conditionService.getConditions(conditionNos)
  }

  @Get('conditions/:templateNo')
  getConditionsByTemplate(@Param('templateNo') templateNo: number) {
    return this.templateService.getConditions(templateNo)
  }

  @Post('condition')
  @UsePipes(new ValidationPipe({ transform: true }))
  createCondition(@Body() condition: ConditionDto) {
    return this.conditionService.create(condition)
  }

  @Put('/condition/:id')
  @UsePipes(new ValidationPipe({ transform: true }))
  updateCondition(@Param('id') id: number, @Body() condition: ConditionDto) {
    return this.conditionService.update(id, condition)
  }

  @Put('/condition/:id/intext')
  updateConditionIntExt(@Param('id') id: number, @Body('value') value: boolean) {
    return this.conditionService.updateIntExt(id, value)
  }

  @Delete('/condition/:id')
  deleteCondition(@Param('id') id: number) {
    return this.conditionService.delete(id)
  }

  @Get('template')
  templates() {
    return this.templateService.find()
  }

  @Post('template')
  @UsePipes(new ValidationPipe({ transform: true }))
  createTemplate(@Body() data: TemplateDto) {
    return this.templateService.create(data)
  }

  @Put('/template/:id')
  @UsePipes(new ValidationPipe({ transform: true }))
  updateTemplate(@Param('id') id: number, @Body() data: TemplateDto) {
    return this.templateService.update(id, data)
  }

  @Delete('/template/:id')
  deleteTemplate(@Param('id') id: number) {
    return this.templateService.delete(id)
  }

  @Get('task')
  task() {
    return this.taskService.find()
  }

  @Post('task')
  @UsePipes(new ValidationPipe({ transform: true }))
  createTask(@Body() data: TaskDto) {
    return this.taskService.create(data)
  }

  @Put('/task/:id')
  @UsePipes(new ValidationPipe({ transform: true }))
  updateTask(@Param('id') id: number, @Body() data: TaskDto) {
    return this.taskService.update(id, data)
  }

  @Delete('/task/:id')
  deleteTask(@Param('id') id: number) {
    return this.taskService.delete(id)
  }
}
