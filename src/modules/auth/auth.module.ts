import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppEnvironment } from 'app.environment'
import { Passport } from 'entities'

import { UsersModule } from '../users/users.module'
import { AuthService } from './auth.service'
import { JwtStrategy } from './jwt.strategy'

@Module({
  imports: [
    UsersModule,
    PassportModule,
    TypeOrmModule.forFeature([Passport]),
    JwtModule.registerAsync({
      inject: [AppEnvironment],
      useFactory: (appEnvironment: AppEnvironment) => {
        return {
          secret: appEnvironment.jwtSecretKey,
          signOptions: { expiresIn: '3d' },
        }
      },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
