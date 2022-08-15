import { Injectable, OnModuleInit } from '@nestjs/common'
import { SettingService } from 'modules/base/setting.service'

@Injectable()
export class AppService implements OnModuleInit {
  constructor(private readonly settingService: SettingService) {}

  async onModuleInit() {}
}
