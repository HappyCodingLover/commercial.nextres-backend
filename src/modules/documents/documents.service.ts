import { Injectable } from '@nestjs/common'
import { S3Service } from 'shared/services'

@Injectable()
export class DocumentsService {
  constructor(private readonly s3Service: S3Service) {}

  download(key: string) {
    return this.s3Service.getDownloadUrl(key)
  }

  upload(files: Array<Express.Multer.File>, path: string) {
    return Promise.all(files.map((file) => this.s3Service.upload(path, file)))
  }
}
