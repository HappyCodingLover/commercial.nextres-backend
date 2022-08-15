import { Body, Controller, Post, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common'
import { AnyFilesInterceptor } from '@nestjs/platform-express'
import { JwtAuthGuard } from 'modules/auth/jwt-auth.guard'
import { DocumentsService } from 'modules/documents/documents.service'

@Controller('documents')
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Post('download')
  async download(@Body('key') key: string) {
    return this.documentsService.download(key)
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(AnyFilesInterceptor())
  uploadFile(@UploadedFiles() files: Array<Express.Multer.File>, @Body() body) {
    return this.documentsService.upload(files, body.path)
  }
}
