import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Setting, SettingKey } from 'entities'
import { Repository } from 'typeorm'

@Injectable()
export class SettingService {
  constructor(
    @InjectRepository(Setting)
    private settingRepository: Repository<Setting>,
  ) {}

  async set(key: SettingKey, value: string | number) {
    value = String(value)
    const item = await this.settingRepository.findOneBy({ key })
    if (item) await this.settingRepository.update({ id: item.id }, { value })
    else await this.settingRepository.insert({ key, value })
  }

  async get(key: SettingKey) {
    const item = await this.settingRepository.findOneBy({ key })
    if (!item) return null
    return item.value
  }
}
