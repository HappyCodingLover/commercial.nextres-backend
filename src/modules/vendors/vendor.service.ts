import { Injectable } from '@nestjs/common'
import { AppEnvironment } from 'app.environment'

@Injectable()
export class VendorService {
  constructor(private appEnvironment: AppEnvironment) {}
}
