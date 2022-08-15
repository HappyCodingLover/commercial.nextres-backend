import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Loan, LoanHistory } from 'entities'
import { Repository } from 'typeorm'

@Injectable()
export class LoanHistoryService {
  constructor(
    @InjectRepository(Loan)
    private loanRepository: Repository<Loan>,
    @InjectRepository(LoanHistory)
    private historyRepository: Repository<LoanHistory>,
  ) {}

  create(loanNumber: number, action: string, email: string) {
    return this.historyRepository.insert({
      loanNumber,
      action,
      email,
    })
  }

  get(loanNumber: number) {
    return this.historyRepository.find({ where: { loanNumber } })
  }
}
