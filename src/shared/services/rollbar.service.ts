import { Injectable } from '@nestjs/common'
import { AppEnvironment } from 'app.environment'
import * as rollbar from 'rollbar'

@Injectable()
export class RollbarService {
  private readonly _rl
  constructor(private appEnvironment: AppEnvironment) {
    this._rl = new rollbar({
      accessToken: this.appEnvironment.tokenRollBar,
      captureUncaught: true,
      captureUnhandledRejections: true,
    })
  }

  async sendLog(error, request) {
    return this._rl.error(error, request)
  }
}
