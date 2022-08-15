import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { LoanRatesheetDto } from '../../api/loan/loan-ratesheet.dto'
import { LoanRatesheet } from '../../entities'

@Injectable()
export class LoanRatesheetService {
  constructor(
    @InjectRepository(LoanRatesheet)
    private loanRatesheetRepository: Repository<LoanRatesheet>,
  ) {}

  async saveLoanRatesheet(data: LoanRatesheetDto, loanNumber: number) {
    return await this.loanRatesheetRepository.insert({
      data: data.data,
      ratesheetID: data.ratesheetID,
      loanNumber: loanNumber,
    })
  }

  async getLatestLoanRatesheet(loanNumber: number) {
    const loanRatesheets = await this.loanRatesheetRepository.find({
      where: { loanNumber: loanNumber },
      order: {
        date: 'DESC',
      },
    })
    if (loanRatesheets.length > 0) {
      return {
        success: true,
        data: loanRatesheets[0],
      }
    } else {
      return {
        success: false,
      }
    }
  }
}
