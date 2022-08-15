import { ValidationPipe, VersioningType } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import * as requestIp from 'request-ip'

import { AppEnvironment } from './app.environment'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const appEnvironment = app.get(AppEnvironment)
  app.useGlobalPipes(new ValidationPipe())
  app.enableCors({
    origin: '*', // appEnvironment.websiteOrigin,
    credentials: false,
  })
  app.enableVersioning({
    type: VersioningType.URI,
  })

  app.use(requestIp.mw())
  await app.listen(appEnvironment.port)
}
bootstrap()
