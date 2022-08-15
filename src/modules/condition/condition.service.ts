import { ConflictException, Injectable, OnModuleInit } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ConditionDto } from 'api/condition/condition.dto'
import { Condition, ConditionTemplate, SettingKey } from 'entities'
import { SettingService } from 'modules/base/setting.service'
import { In, Repository } from 'typeorm'

@Injectable()
export class ConditionService implements OnModuleInit {
  conditionNo = 1000

  constructor(
    @InjectRepository(Condition)
    private conditionRepository: Repository<Condition>,
    @InjectRepository(ConditionTemplate)
    private conditionTemplatesRepository: Repository<ConditionTemplate>,
    private readonly settingService: SettingService,
  ) {}

  async onModuleInit() {
    let value = null
    if (!(value = await this.settingService.get(SettingKey.CONDITION_NO)))
      await this.settingService.set(SettingKey.CONDITION_NO, this.conditionNo)
    else this.conditionNo = parseInt(value)
  }

  async find() {
    const data = await this.conditionRepository.find({ order: { no: 'ASC' } })
    const templates = await this.conditionTemplatesRepository.find({ order: { no: 'ASC' } })
    return {
      data,
      templates,
      success: true,
    }
  }

  async nextConditionNo() {
    this.conditionNo += 1
    await this.settingService.set(SettingKey.CONDITION_NO, this.conditionNo)
    return this.conditionNo
  }

  async create(condition: ConditionDto) {
    const item = await this.conditionRepository.findOneBy({ name: condition.name })
    if (item) throw new ConflictException('The name is already exists.')

    const conditionNo = await this.nextConditionNo()
    const { templates } = condition
    await Promise.all(
      templates.map(async (templateNo) => {
        const template = await this.conditionTemplatesRepository.findOneBy({ no: templateNo })
        template.conditions.push(conditionNo)
        this.conditionTemplatesRepository.update({ no: templateNo }, { conditions: template.conditions })
      }),
    )
    return await this.conditionRepository.insert({
      ...condition,
      no: conditionNo,
    })
  }

  templatesFromConditionNo(conditionNo: number): Promise<Array<ConditionTemplate>> {
    const queryBuilder = this.conditionTemplatesRepository
      .createQueryBuilder()
      .select('*')
      .where(`("conditions")::jsonb @> '${conditionNo}'`)
    return queryBuilder.execute()
  }

  async update(id: number, condition: ConditionDto) {
    const oldCondition = await this.conditionRepository.findOneBy({ id })
    if (oldCondition.name != condition.name) {
      const item = await this.conditionRepository.findOneBy({ name: condition.name })
      if (item) throw new ConflictException('The name is already exists.')
    }
    const { no: conditionNo } = oldCondition
    const oldTemplates = (await this.templatesFromConditionNo(conditionNo)).map((template) => template.no)
    const { templates } = condition

    await Promise.all(
      templates.map(async (templateNo) => {
        if (oldTemplates.indexOf(templateNo) !== -1) return

        // Add template
        const template = await this.conditionTemplatesRepository.findOneBy({ no: templateNo })
        template.conditions.push(conditionNo)
        await this.conditionTemplatesRepository.update({ no: templateNo }, { conditions: template.conditions })
      }),
    )
    await Promise.all(
      oldTemplates.map(async (templateNo) => {
        if (templates.indexOf(templateNo) !== -1) return

        // Remove template
        const template = await this.conditionTemplatesRepository.findOneBy({ no: templateNo })
        const position = template.conditions.indexOf(conditionNo)
        if (position == -1) return
        template.conditions.splice(position, 1)
        await this.conditionTemplatesRepository.update({ no: templateNo }, { conditions: template.conditions })
      }),
    )

    delete condition.templates
    return await this.conditionRepository.update({ id }, condition)
  }

  updateIntExt(id: number, value: boolean) {
    return this.conditionRepository.update({ id }, { intext: value })
  }

  async delete(id: number) {
    const condition = await this.conditionRepository.findOneBy({ id })
    const { no: conditionNo } = condition
    const templates = await this.templatesFromConditionNo(conditionNo)

    await Promise.all(
      templates.map(async (template) => {
        const position = template.conditions.indexOf(conditionNo)
        if (position == -1) return
        template.conditions.splice(position, 1)
        await this.conditionTemplatesRepository.update({ no: template.no }, { conditions: template.conditions })
      }),
    )

    return await this.conditionRepository.delete({ id })
  }

  async getConditions(conditionNos: Array<number>) {
    return this.conditionRepository.find({
      where: {
        no: In(conditionNos),
      },
      order: { no: 'ASC' },
    })
  }
}
