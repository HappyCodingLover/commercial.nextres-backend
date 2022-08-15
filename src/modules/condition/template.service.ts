import { ConflictException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { TemplateDto } from 'api/condition/template.dto'
import { Condition, ConditionTemplate, SettingKey } from 'entities'
import { SettingService } from 'modules/base/setting.service'
import { In, Repository } from 'typeorm'

@Injectable()
export class TemplateService implements OnModuleInit {
  conditionTemplateNo = 3000

  constructor(
    @InjectRepository(ConditionTemplate)
    private conditionTemplatesRepository: Repository<ConditionTemplate>,
    @InjectRepository(Condition)
    private conditionRepository: Repository<Condition>,
    private readonly settingService: SettingService,
  ) {}

  async onModuleInit() {
    let value = null
    if (!(value = await this.settingService.get(SettingKey.CONDITION_TEMPLATE_NO)))
      await this.settingService.set(SettingKey.CONDITION_TEMPLATE_NO, this.conditionTemplateNo)
    else this.conditionTemplateNo = parseInt(value)
  }

  async nextTemplateNo() {
    this.conditionTemplateNo += 1
    await this.settingService.set(SettingKey.CONDITION_TEMPLATE_NO, this.conditionTemplateNo)
    return this.conditionTemplateNo
  }

  async create(template: TemplateDto) {
    const item = await this.conditionTemplatesRepository.findOneBy({ name: template.name })
    if (item) throw new ConflictException('The name is already exists.')

    return await this.conditionTemplatesRepository.insert({
      ...template,
      no: await this.nextTemplateNo(),
    })
  }

  async update(id: number, template: TemplateDto) {
    const oldCondition = await this.conditionTemplatesRepository.findOneBy({ id })
    if (oldCondition.name != template.name) {
      const item = await this.conditionTemplatesRepository.findOneBy({ name: template.name })
      if (item) throw new ConflictException('The name is already exists.')
    }
    return await this.conditionTemplatesRepository.update({ id }, template)
  }

  async delete(id: number) {
    return await this.conditionTemplatesRepository.delete({ id })
  }

  async find() {
    const data = await this.conditionTemplatesRepository.find({ order: { no: 'ASC' } })
    return {
      data,
      success: true,
    }
  }

  async getConditions(templateNo: number) {
    const template = await this.conditionTemplatesRepository.findOneBy({ no: templateNo })
    if (!template) throw new NotFoundException('Unknown template')

    return this.conditionRepository.find({
      where: {
        no: In(template.conditions),
      },
      order: { no: 'ASC' },
    })
  }
}
