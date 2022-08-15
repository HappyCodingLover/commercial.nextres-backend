import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { BorrowerSetValueDto } from 'api/loan/loan-application.dto'
import { Borrower, BorrowerLog, BorrowerSeperator } from 'entities'
import { Repository } from 'typeorm'

@Injectable()
export class LoanApplicationLogService {
  constructor(
    @InjectRepository(BorrowerLog)
    private borrowerLogRepository: Repository<BorrowerLog>,
    @InjectRepository(Borrower)
    private borrowerRepository: Repository<Borrower>,
  ) {}

  async getBorrowerLog(loanNumber: number, borrowerSeperator: BorrowerSeperator, fieldName: string) {
    const borrowerLog = await this.borrowerLogRepository.findOne({
      where: {
        loanNumber,
        borrowerSeperator,
      },
    })
    if (!borrowerLog) return []

    const data = borrowerLog.data
      .filter((log) => log.operates.key === fieldName)
      .map((log) => ({
        value: log.operates.value,
        email: log.email,
        time: log.time,
      }))

    return data
  }

  checkDiffs(orgData: Record<string, any> | null, newData: Record<string, any>) {
    if (orgData === null) return
    Object.keys(newData).forEach((key) => {
      if (orgData[key] == newData[key]) delete newData[key]
    })
  }

  async createBorrower(loanNumber: number, borrowerSeperator: BorrowerSeperator) {
    const item = await this.borrowerLogRepository.create({
      loanNumber,
      borrowerSeperator,
    })
    await this.borrowerLogRepository.save(item)
  }

  async onBorrowerUpdate(loanNumber: number, data: BorrowerSetValueDto, operatorEmail: string) {
    data = Object.assign({}, data)
    const { borrowerSeperator } = data
    const [borrowerLog, borrower] = await Promise.all([
      this.borrowerLogRepository.findOneBy({
        loanNumber,
        borrowerSeperator,
      }),
      this.borrowerRepository.findOneBy({
        loanNumber,
        borrowerSeperator,
      }),
    ])

    this.checkDiffs(borrower, data)

    Object.keys(data).forEach((key) =>
      borrowerLog.data.push({
        email: operatorEmail,
        time: new Date(),
        operates: {
          key,
          value: data[key],
        },
      }),
    )

    await this.borrowerLogRepository.update(
      { loanNumber, borrowerSeperator },
      {
        data: borrowerLog.data,
      },
    )
  }
}
