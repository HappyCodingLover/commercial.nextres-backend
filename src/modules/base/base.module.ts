import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Contactus, Newsletter, Setting } from 'entities'

import { ContactusService } from './contactus.service'
import { NewsletterService } from './newsletter.service'
import { SettingService } from './setting.service'

@Module({
  imports: [TypeOrmModule.forFeature([Newsletter, Contactus, Setting])],
  providers: [NewsletterService, ContactusService, SettingService],
  exports: [NewsletterService, ContactusService, SettingService],
})
export class BaseModule {}
