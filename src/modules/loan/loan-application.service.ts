import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { BorrowerSetValueDto } from 'api/loan/loan-application.dto'
import { Borrower } from 'entities'
import { Repository } from 'typeorm'

import { LoanApplicationLogService } from './loan-application-log.service'

@Injectable()
export class LoanApplicationService {
  constructor(
    @InjectRepository(Borrower)
    private readonly borrowerRepository: Repository<Borrower>,
    private readonly loanApplicationLogService: LoanApplicationLogService,
  ) {}

  async setBorrowerInfo(loanNumber: number, data: BorrowerSetValueDto, operatorEmail: string) {
    const isFound = await this.borrowerRepository.findOneBy({
      loanNumber,
      borrowerSeperator: data.borrowerSeperator,
    })
    if (!isFound) {
      const item = await this.borrowerRepository.create({
        loanNumber,
        borrowerSeperator: data.borrowerSeperator,
      })
      await this.borrowerRepository.save(item)
      await this.loanApplicationLogService.createBorrower(loanNumber, data.borrowerSeperator)
    }
    await this.loanApplicationLogService.onBorrowerUpdate(loanNumber, data, operatorEmail)
    return await this.borrowerRepository.update(
      {
        loanNumber,
        borrowerSeperator: data.borrowerSeperator,
      },
      data,
    )
  }
}
