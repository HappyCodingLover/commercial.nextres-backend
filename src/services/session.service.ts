import { Inject, Injectable, Scope } from '@nestjs/common'
import { REQUEST } from '@nestjs/core'
import { CurrentUser } from 'entities'
import { Request } from 'express'

/**
 * TODO: Problem with this Scope.REQUEST every dependant service
 * will be created on every request.
 */
@Injectable({ scope: Scope.REQUEST })
export class SessionService {
  constructor(@Inject(REQUEST) private readonly req: Request) {}

  get currentUser() {
    return this.req.user as CurrentUser
  }
}
