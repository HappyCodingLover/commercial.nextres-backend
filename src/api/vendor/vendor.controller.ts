import { Controller, Get, UseGuards } from '@nestjs/common'
import { AppEnvironment } from 'app.environment'
import { JwtAuthGuard } from 'modules/auth/jwt-auth.guard'

@Controller('vendor')
@UseGuards(JwtAuthGuard)
export class VendorController {
  constructor(private readonly appEnvironment: AppEnvironment) {}

  @Get()
  creditReport() {
    return {
      name: this.appEnvironment.USCIS_USER,
      password: this.appEnvironment.USCIS_PASSWORD,
    }
  }
}
