import { ConflictException, Injectable, OnModuleInit } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { TaskDto } from 'api/condition/task.dto'
import { SettingKey, Task } from 'entities'
import { SettingService } from 'modules/base/setting.service'
import { Repository } from 'typeorm'

@Injectable()
export class TaskService implements OnModuleInit {
  currentNo = 1000

  constructor(
    @InjectRepository(Task)
    private repository: Repository<Task>,
    private readonly settingService: SettingService,
  ) {}

  async onModuleInit() {
    let value = null
    if (!(value = await this.settingService.get(SettingKey.TASK_NO)))
      await this.settingService.set(SettingKey.TASK_NO, this.currentNo)
    else this.currentNo = parseInt(value)
  }

  async nextNo() {
    this.currentNo += 1
    await this.settingService.set(SettingKey.TASK_NO, this.currentNo)
    return this.currentNo
  }

  async find() {
    const data = await this.repository.find({ order: { no: 'ASC' } })
    return {
      data,
      success: true,
    }
  }

  async create(data: TaskDto) {
    const item = await this.repository.findOneBy({ description: data.description })
    if (item) throw new ConflictException('The description is already exists.')

    return await this.repository.insert({
      ...data,
      no: await this.nextNo(),
    })
  }

  async update(id: number, data: TaskDto) {
    const oldItem = await this.repository.findOneBy({ id })
    if (oldItem.description != data.description) {
      const item = await this.repository.findOneBy({ description: data.description })
      if (item) throw new ConflictException('The description is already exists.')
    }
    return await this.repository.update({ id }, data)
  }

  async delete(id: number) {
    return await this.repository.delete({ id })
  }
}
