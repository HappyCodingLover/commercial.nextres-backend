import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import { LoanNumber } from 'decorators'
import { Response } from 'express'
import { JwtAuthGuard } from 'modules/auth/jwt-auth.guard'
import { LoanHistoryService } from 'modules/loan/loan-history.service'
import { LoanSubmissionService } from 'modules/loan/loan-submission.service'

import { LoanSubmissionDto } from './loan-submission.dto'

@Controller('loan')
@UseGuards(JwtAuthGuard)
export class LoanSubmissionController {
  constructor(private loanSubmissionService: LoanSubmissionService, private loanHistoryService: LoanHistoryService) {}

  @Get('submission')
  async getSubmission(@LoanNumber() loanNumber: number) {
    return this.loanSubmissionService.get(loanNumber)
  }

  @Post('updateSubmission')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateSubmission(@Request() req, @Body() data: LoanSubmissionDto, @LoanNumber() loanNumber: number) {
    const { email } = req.user
    const res = this.loanSubmissionService.setValue(loanNumber, data, email)
    return res
  }

  @Get('downloadSubmissionDocuments/:loanNumber/:type')
  async downloadDocuments(
    @Param('loanNumber') loanNumber: number,
    @Param('type') type: string,
    @Query('keys') keys: string = '',
    @Res() res: Response,
  ) {
    return this.loanSubmissionService.downloadDocuments(loanNumber, type, keys.split(','), res)
  }

  @Get('history')
  async getHistory(@LoanNumber() loanNumber: number) {
    const res = this.loanHistoryService.get(loanNumber)
    return res
  }
}
