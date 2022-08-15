import { Module } from '@nestjs/common'

import { DocumentsService } from './documents.service'

@Module({
  imports: [],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
