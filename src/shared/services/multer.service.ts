import { Injectable } from '@nestjs/common'
import multer from 'multer'

@Injectable()
export class MulterService {
  private readonly uploadLocation: string

  constructor() {
    this.uploadLocation = 'documents/temp'
  }

  get multerOptions(): multer.Multer {
    const docsStorage = multer.diskStorage({
      destination: this.uploadLocation,
      filename: (req, file, cb) => {
        cb(null, new Date().getTime() + file.originalname)
      },
    })
    return multer({
      storage: docsStorage,
      limits: {
        fileSize: 50000000, // ask about limits, now 50mb
      },
      fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(pdf)$/)) {
          return cb(new Error('Please upload a pdf'))
        }
        cb(undefined, true)
      },
    })
  }
}
