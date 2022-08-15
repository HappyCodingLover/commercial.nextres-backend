import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { AppEnvironment } from 'app.environment'
import { ExtractJwt, Strategy } from 'passport-jwt'

import { UsersService } from '../users/users.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private appEnvironment: AppEnvironment, private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        ExtractJwt.fromUrlQueryParameter('token'),
      ]),
      ignoreExpiration: false,
      secretOrKey: appEnvironment.jwtSecretKey,
    })
  }

  async validate(payload: any) {
    const user = await this.usersService.getUserPermissions(payload.email)
    if (!user.role) {
      throw new UnauthorizedException()
    }
    return user
  }
}
