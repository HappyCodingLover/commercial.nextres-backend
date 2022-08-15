import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { LoanProcessDto } from '../../api/loan/loan-process.dto'
import { LoanProcess } from '../../entities'

@Injectable()
export class LoanProcessService {
  constructor(
    @InjectRepository(LoanProcess)
    private loanProcessRepository: Repository<LoanProcess>,
  ) {}

  async saveLoanProcess(data: LoanProcessDto, loanNumber: number) {
    const exist = await this.loanProcessRepository.findOneBy({ loanNumber: loanNumber })
    if (exist) {
      return await this.loanProcessRepository.update({ loanNumber: loanNumber }, { ...data })
    } else {
      return await this.loanProcessRepository.insert({
        ...data,
        loanNumber: loanNumber,
      })
    }
  }

  async getLoanProcess(loanNumber: number) {
    const loanProcess = await this.loanProcessRepository.findOneBy({ loanNumber })
    if (loanProcess) {
      return {
        success: true,
        data: loanProcess,
      }
    } else {
      return {
        success: false,
      }
    }
  }
}
