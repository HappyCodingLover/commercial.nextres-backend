import { Body, Controller, Get, Param, Put, Request, UseGuards } from '@nestjs/common'
import { LoanNumber } from 'decorators'
import { BorrowerSeperator } from 'entities'
import { JwtAuthGuard } from 'modules/auth/jwt-auth.guard'
import { LoanApplicationService } from 'modules/loan/loan-application.service'
import { LoanApplicationLogService } from 'modules/loan/loan-application-log.service'

import { BorrowerSetValueDto } from './loan-application.dto'

@Controller('loan')
@UseGuards(JwtAuthGuard)
export class LoanApplicationController {
  constructor(
    private loanApplicationLogService: LoanApplicationLogService,
    private loanApplicationService: LoanApplicationService,
  ) {}

  @Put('borrowerInfo')
  async setBorrowerInfo(@Request() req, @Body() data: BorrowerSetValueDto, @LoanNumber() loanNumber: number) {
    const { email } = req.user
    return this.loanApplicationService.setBorrowerInfo(loanNumber, data, email)
  }

  @Get('/borrowerLogs/:borrowerSeperator/:fieldName')
  async logs(
    @Param('borrowerSeperator') borrowerSeperator: BorrowerSeperator,
    @Param('fieldName') fieldName: string,
    @LoanNumber() loanNumber: number,
  ) {
    return this.loanApplicationLogService.getBorrowerLog(loanNumber, borrowerSeperator, fieldName)
  }
}
