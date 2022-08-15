import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Loan, LoanLog } from 'entities'
import { Repository } from 'typeorm'

@Injectable()
export class LoanLogService {
  constructor(
    @InjectRepository(Loan)
    private loanRepository: Repository<Loan>,
    @InjectRepository(LoanLog)
    private logRepository: Repository<LoanLog>,
  ) {}

  async create(loanNumber: number) {
    const item = await this.logRepository.create({
      loanNumber,
      data: [],
    })
    await this.logRepository.save(item)
  }

  async onCreate(loanNumber: number, data: Record<string, any>, operatorEmail: string) {
    await this.create(loanNumber)
    const loanLog = await this.logRepository.findOneBy({
      loanNumber,
    })
    Object.keys(data).forEach((key) =>
      loanLog.data.push({
        email: operatorEmail,
        time: new Date(),
        operates: {
          key,
          value: data[key],
        },
      }),
    )
    await this.logRepository.update(
      { loanNumber },
      {
        data: loanLog.data,
      },
    )
  }

  async onUpdate(loanNumber: number, data: Record<string, any>, operatorEmail: string) {
    data = Object.assign({}, data)
    const loan = await this.loanRepository.findOneBy({
      no: loanNumber,
    })
    if (!loan) return

    let loanLog = await this.logRepository.findOneBy({
      loanNumber,
    })

    this.checkDiffs(loan, data)
    if (!loanLog) {
      await this.create(loanNumber)
      loanLog = await this.logRepository.findOneBy({
        loanNumber,
      })
    }
    Object.keys(data).forEach((key) =>
      loanLog.data.push({
        email: operatorEmail,
        time: new Date(),
        operates: {
          key,
          value: data[key],
        },
      }),
    )
    await this.logRepository.update(
      { loanNumber },
      {
        data: loanLog.data,
      },
    )
  }

  async get(loanNumber: number, key: string) {
    const loan = await this.loanRepository.findBy({ no: loanNumber })
    if (!loan) throw new NotFoundException('Unknown Loan Application')
    const loanLog = await this.logRepository.findOne({
      where: {
        loanNumber,
      },
    })
    if (!loanLog) return []

    const data = loanLog.data
      .filter((log) => log.operates.key === key)
      .map((log) => ({
        value: log.operates.value,
        email: log.email,
        time: log.time,
      }))

    return data
  }

  delete(loanNumber: number) {
    return this.logRepository.delete({
      loanNumber,
    })
  }

  checkDiffs(orgData: Record<string, any>, newData: Record<string, any>) {
    Object.keys(newData).forEach((key) => {
      if (orgData[key] == newData[key]) delete newData[key]
    })
  }
}
