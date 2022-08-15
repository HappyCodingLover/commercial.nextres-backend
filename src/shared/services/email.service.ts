import { Injectable } from '@nestjs/common'
import * as SmMail from '@sendgrid/mail'
import { AppEnvironment } from 'app.environment'

export enum EmailFrom {
  HOME_EMAIL = 'noreply@nextres.com',
  CORP_EMAIL = 'corporate@nextres.com',
  LoanSetup_Email = 'loansetup@nextres.com',
  Underwriter_Email = 'underwriting@nextres.com',
  DISCLOSURE_EMAIL = 'disclosures@nextres.com',
  CLOSE_EMAIL = 'closing@nextres.com',
  PARTNER_EMAIL = 'inquiries@nextres.com',
  LOCK_EMAIL = 'locks@nextres.com',
  DRAW_EMAIL = 'draws@nextres.com',
  INFO_EMAIL = 'info@nextres.com',
}

export interface SendEmailParams {
  from: EmailFrom
  to: string
  subject: string
  text: string
  html?: string
}

/**
 * TODO: Problem with this Scope.REQUEST every dependant service
 * will be created on every request.
 */
@Injectable()
export class EmailService {
  constructor(private readonly appEnvironment: AppEnvironment) {
    SmMail.setApiKey(appEnvironment.sendGridApiKey)
  }

  send(params: SendEmailParams) {
    return SmMail.send(params)
  }
}
