import { Global, Module } from '@nestjs/common'

import { EmailService, MulterService, RollbarService, S3Service } from './services'

@Global()
@Module({
  providers: [RollbarService, MulterService, EmailService, S3Service],
  imports: [],
  exports: [RollbarService, MulterService, EmailService, S3Service],
})
export class SharedModule {}
