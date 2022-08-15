import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import { LoanNumber } from 'decorators'
import { JwtAuthGuard } from 'modules/auth/jwt-auth.guard'
import { LoanService } from 'modules/loan/loan.service'
import { LoanLogService } from 'modules/loan/loan-log.service'

import { LoanProcessService } from '../../modules/loan/loan-process.service'
import { LoanRatesheetService } from '../../modules/loan/loan-ratesheet.service'
import { LoanDetailsDto } from './loan-details.dto'
import { LoanProcessDto } from './loan-process.dto'
import { LoanRatesheetDto } from './loan-ratesheet.dto'

@Controller('loan')
@UseGuards(JwtAuthGuard)
export class LoanController {
  constructor(
    private loanService: LoanService,
    private loanProcessService: LoanProcessService,
    private loanRatesheetService: LoanRatesheetService,
    private readonly loanLogService: LoanLogService,
  ) {}

  @Get('pipeline')
  async list(@Query('query') query: string = '') {
    return this.loanService.find(query)
  }

  @Get('overview')
  async overview(@LoanNumber() loanNumber: number) {
    return this.loanService.overview(loanNumber)
  }

  @Post('priceLoan')
  @UsePipes(new ValidationPipe({ transform: true }))
  async priceLoan(@Body() loanFields: LoanDetailsDto) {
    const res = this.loanService.finresiPriceLoan(loanFields)
    return res
  }

  @Post('getPriceLimit')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getPriceLimit(@Body() loanFields: LoanDetailsDto) {
    const res = this.loanService.finresiGetCommercialLimit(loanFields)
    return res
  }

  @Post('savePipeline')
  @UsePipes(new ValidationPipe({ transform: true }))
  async saveToPipeLine(@Request() req, @Body() loanFields: LoanDetailsDto) {
    const { email } = req.user
    return this.loanService.saveToPipeline(loanFields, email)
  }

  @Put('updateLoanFields')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateLoanFields(@Request() req, @LoanNumber() loanNumber: number, @Body() loanFields: LoanDetailsDto) {
    const { email } = req.user
    return this.loanService.updateLoanFields(loanNumber, loanFields, email)
  }

  @Post('saveLoanProcess')
  async saveLoanProcess(@Body() data: LoanProcessDto, @LoanNumber() loanNumber: number) {
    return this.loanProcessService.saveLoanProcess(data, loanNumber)
  }

  @Get('getLoanProcess')
  async getLoanProcess(@LoanNumber() loanNumber: number) {
    return this.loanProcessService.getLoanProcess(loanNumber)
  }

  @Post('saveLoanRatesheet')
  async saveLoanRatesheet(@Body() data: LoanRatesheetDto, @LoanNumber() loanNumber: number) {
    return this.loanRatesheetService.saveLoanRatesheet(data, loanNumber)
  }

  @Get('getLatestLoanRatesheet')
  async getLatestLoanRatesheet(@LoanNumber() loanNumber: number) {
    return this.loanRatesheetService.getLatestLoanRatesheet(loanNumber)
  }

  @Get('log/:key')
  async getLogs(@Param('key') key: string, @LoanNumber() loanNumber: number) {
    return this.loanLogService.get(loanNumber, key)
  }
}
