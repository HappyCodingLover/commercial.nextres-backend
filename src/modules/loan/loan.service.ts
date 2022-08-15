import { HttpService } from '@nestjs/axios'
import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { LoanDetailsDto } from 'api/loan/loan-details.dto'
import { AppEnvironment } from 'app.environment'
import { Borrower, Loan, LoanProcess, SettingKey } from 'entities'
import { SettingService } from 'modules/base/setting.service'
import { Repository } from 'typeorm'
import { removeCommaN } from 'utils/convert'

import { LoanLogService } from './loan-log.service'

@Injectable()
export class LoanService implements OnModuleInit {
  public finresiInstance
  currentNo = 30000

  public loanFieldValueKeyMapping = {
    LoanPurpose: {
      Purchase: 'Purchase',
      Refinance: 'NoCashOutRefinance',
    },
    Occupancy: {
      'Owner Occupied': 'Primary',
      'Non Owner Occupied': 'Investment',
    },
    ArmotizationType: {
      'Fully Amortized': 0,
      '10 Year Interested Only': 1,
    },
    EscrowType: {
      'Not Waived': 'notWaived',
      'Waive Both': 'waiveBoth',
    },
    PropertyType: {
      SFR: 'SingleFamily',
      Condo: 'Condominium',
      'MF (5-30 units)': 'FivePlusUnits',
      '2-4 Units': 'TwoFourUnits',
      PUD: 'Pud',
      '5-9 Units': 'FivePlusUnits',
      '10+ Units': 'FivePlusUnits',
      'Mixed-Use': 'MixedUse',
    },
    yn: {
      '0': false,
      '1': true,
    },
    plus: {
      None: 'None',
      'Not Settled (<12)': 'NotSettled',
      'Settled (<12)': 'Settled',
      '1+ years': 'OnePlus',
      '2+ years': 'TwoPlus',
      '3+ years': 'ThreePlus',
      '4+ years': 'FourPlus',
      '5+ years': 'FivePlus',
      '6+ years': 'SixPlus',
      '7+ years': 'SevenPlus',
    },
    mor: {
      '0X30X12': 'NoOccurrences',
      '= 1X30X12': 'OneOccurrences30',
      '> 1X30X12': 'OneMoreOccurrences30',
      '>= 1X60X12': 'OneOrMoreOccurrences60',
    },
    citizen: {
      'US Citizen': 'UsCitizen',
      'Permanent Resident': 'PermanentResidentAlien',
      'Non Permanent Resident': 'NonPermanentResidentAlien',
      'Foreign National': 'ForeignNational',
    },
    CondoType: {
      Warrantable: 'Warrantable',
      'Non-Warrantable': 'NonWarrantable',
      Condotel: 'Condotel',
    },
    prepaymentPenalty: {
      '0 years': 0,
      '1 years': 12,
      '2 years': 24,
      '3 years': 36,
      '4 years': 48,
      '5 years': 60,
    },
  }

  constructor(
    @InjectRepository(Loan)
    private loanRepository: Repository<Loan>,
    @InjectRepository(LoanProcess)
    private loanProcessRepository: Repository<LoanProcess>,
    @InjectRepository(Borrower)
    private borrowerRepository: Repository<Borrower>,
    private readonly settingService: SettingService,
    private appEnvironment: AppEnvironment,
    private readonly httpService: HttpService,
    private readonly loanLogService: LoanLogService,
  ) {}

  async onModuleInit() {
    let value = null
    if (!(value = await this.settingService.get(SettingKey.LOAN_NO)))
      await this.settingService.set(SettingKey.LOAN_NO, this.currentNo)
    else this.currentNo = parseInt(value)
  }

  async finresiPriceLoan(reqBody: LoanDetailsDto) {
    const limitValues = this.calculateLimit(reqBody)
    const propertyAddress = reqBody.subjectPropertyAddress
    console.log(propertyAddress, 'property Address')
    const addresses = propertyAddress.split(',')
    const state = addresses[addresses.length - 2].replace(/[0-9\.]+/g, '').trim()
    const finresiReqBody = {
      data: {
        ProductType: reqBody.productType,
        TransactionType: reqBody.transactionType,
        Experience: reqBody.experience,
        Citizenship: this.loanFieldValueKeyMapping.citizen[reqBody.residency],
        IncomeDocumentation: 'DebtServiceCoverageRatio',
        AmortizationType: this.loanFieldValueKeyMapping.ArmotizationType[reqBody.amortizationType]
          ? this.loanFieldValueKeyMapping.ArmotizationType[reqBody.amortizationType]
          : 0,
        CashInHand: '',
        CashOutAmount: '',
        CreditEvent: {
          Bankruptcy: this.loanFieldValueKeyMapping.plus[reqBody.bankruptcy],
          Foreclosure: this.loanFieldValueKeyMapping.plus[reqBody.foreclosure],
          ShortSale: this.loanFieldValueKeyMapping.plus[reqBody.shortSale],
          DeedInLieu: this.loanFieldValueKeyMapping.plus[reqBody.deedInLieu],
        },
        DSCR: reqBody.estimatedDscr,
        EscrowType: this.loanFieldValueKeyMapping.EscrowType[reqBody.escrowType],
        Fico: reqBody.estimatedCreditScore,
        IsFirstTimeHomebuyer: reqBody.firstTimeHomeBuyer,
        IsFirstTimeInvestor: reqBody.firstTimeHomeInvestor,
        IsRuralProperty: reqBody.ruralProperty,
        IsSelfEmployed: reqBody.selfEmployed,
        LoanAmount: reqBody.proposedLoanAmount,
        LoanPurpose: this.loanFieldValueKeyMapping.LoanPurpose[reqBody.transactionType],
        MonthsReserved: reqBody.monthsReserve,
        NumberOfUnits: reqBody.numberOfUnits,
        Occupancy: this.loanFieldValueKeyMapping.Occupancy[reqBody.proposedOccupancy],
        PrePaymentPenaltyTermsInMonths: this.loanFieldValueKeyMapping.prepaymentPenalty[reqBody.prepaymentPenalty],
        PropertyType:
          reqBody.propertyType === 'Condo'
            ? this.loanFieldValueKeyMapping.CondoType[reqBody.condoType]
            : this.loanFieldValueKeyMapping.PropertyType[reqBody.propertyType],
        SecondLien: reqBody.secondLien,
        IsCommercial: false,
        LTV: limitValues.LTV,
        AIV_LTV: limitValues.LTV,
        ARV_LTV: limitValues.ARV_LTV,
        LTC: limitValues.LTC,
        LTP: limitValues.LTP,
        State: state,
      },
    }
    const headersRequest = {
      'Content-Type': 'application/json',
      secretkey: this.appEnvironment.finresi_secret_key,
    }

    if (reqBody.productType === 'Commercial DSCR' || reqBody.productType === 'Residential DSCR') {
      finresiReqBody.data.LTV = limitValues.LTV
      const fres = await this.httpService.axiosRef.post(
        `${this.appEnvironment.finresi_url}/api/v1/ratesheet/price-loan`,
        finresiReqBody,
        {
          headers: headersRequest,
        },
      )
      return fres.data
    } else {
      finresiReqBody.data.IsCommercial = true
      const fres = await this.httpService.axiosRef.post(
        `${this.appEnvironment.finresi_url}/api/v1/ratesheet/price-loan`,
        finresiReqBody,
        {
          headers: headersRequest,
        },
      )
      return fres.data
    }
  }

  calculateLimit(data: LoanDetailsDto) {
    let LTV = 0
    let LTP = 0
    let LTC = 0
    let ARV_LTV = 0
    const { productType, transactionType } = data

    const propertyPurchasePrice = removeCommaN(data.propertyPurchasePrice)
    const asIsValue = removeCommaN(data.asIsValue)
    const constructionReserve = removeCommaN(data.constructionReserve)
    const proposedLoanAmount = removeCommaN(data.proposedLoanAmount)
    const afterRepairValue = removeCommaN(data.afterRepairValue)
    const rehabBudget = removeCommaN(data.rehabBudget)

    // AIV-LTV = 100 * (Proposed LoanAmount - Construction Reserve) / As Is Value
    //         = 100 * (Proposed LoanAmount - Construction Reserve) / Min(Property PurchasePrice, As Is Value) (Residential DSCR Purchase)
    // ARV-LTV = 100 * (Proposed LoanAmount) /  After Repair Value
    // LTC     = 100 * (Proposed LoanAmount) /  (As Is Value + Rehab Budget)
    // LTP     = 100 * (Proposed LoanAmount - Construction Reserve) / Property PurchasePrice
    LTV = (100 * (proposedLoanAmount - constructionReserve)) / asIsValue
    if (productType === 'Residential DSCR' && transactionType === 'Purchase') {
      let minValue = 0
      if (asIsValue === 0) minValue = propertyPurchasePrice
      else if (propertyPurchasePrice === 0) minValue = asIsValue
      else minValue = Math.min(propertyPurchasePrice, asIsValue)
      LTV = (100 * (proposedLoanAmount - constructionReserve)) / minValue
    }
    ARV_LTV = (100 * proposedLoanAmount) / afterRepairValue
    LTC = (100 * proposedLoanAmount) / (asIsValue + rehabBudget)
    LTP = (100 * (proposedLoanAmount - constructionReserve)) / propertyPurchasePrice
    return {
      LTV: LTV.toFixed(3),
      ARV_LTV: ARV_LTV.toFixed(3),
      LTC: LTC.toFixed(3),
      LTP: LTP.toFixed(3),
    }
  }

  async finresiGetCommercialLimit(reqBody: LoanDetailsDto) {
    const limitValues = this.calculateLimit(reqBody)

    const finresiReqBody = {
      data: {
        ProductType: reqBody.productType,
        TransactionType: reqBody.transactionType,
        Experience: reqBody.experience,
        Fico: reqBody.estimatedCreditScore,
        LoanAmount: reqBody.proposedLoanAmount,
        AIV_LTV: limitValues.LTV,
        ARV_LTV: limitValues.ARV_LTV,
        LTC: limitValues.LTC,
        LTP: limitValues.LTP,
      },
    }

    const headersRequest = {
      'Content-Type': 'application/json',
      secretkey: this.appEnvironment.finresi_secret_key,
    }
    if (reqBody.productType !== 'Commercial DSCR' && reqBody.productType !== 'Residential DSCR') {
      const fres = await this.httpService.axiosRef.post(
        `${this.appEnvironment.finresi_url}/api/v1/ratesheet/get-commercial-limit`,
        finresiReqBody,
        {
          headers: headersRequest,
        },
      )
      return fres.data
    } else return false
  }

  async saveToPipeline(reqBody: LoanDetailsDto, operatorEmail: string) {
    const no = await this.nextLoanNo()
    await this.loanLogService.onCreate(no, reqBody, operatorEmail)
    await this.loanRepository.insert({
      ...reqBody,
      no: no,
    })
    return {
      success: true,
      loan_number: no,
    }
  }

  async updateLoanFields(loanNo: number, reqBody: LoanDetailsDto, operatorEmail: string) {
    await this.loanLogService.onUpdate(loanNo, reqBody, operatorEmail)
    return await this.loanRepository.update({ no: loanNo }, reqBody)
  }

  async nextLoanNo() {
    this.currentNo += 1
    await this.settingService.set(SettingKey.LOAN_NO, this.currentNo)
    return this.currentNo
  }

  async find(query: string) {
    const loans = await this.loanRepository.find({})
    return {
      success: true,
      data: loans,
    }
  }

  async overview(loanNumber: number) {
    const [loan, loanProcess, borrowers] = await Promise.all([
      this.loanRepository.findOneBy({ no: loanNumber }),
      this.loanProcessRepository.findOneBy({ loanNumber }),
      this.borrowerRepository.find({
        where: {
          loanNumber,
        },
      }),
    ])
    let borrower = {
      borrower: {},
      coBorrower: {},
    }
    borrowers.map((item) => {
      if (item.borrowerSeperator === 'borrower') borrower.borrower = item
      if (item.borrowerSeperator === 'coBorrower') borrower.coBorrower = item
    })
    if (loan) {
      return {
        loan: loan,
        pricing: {
          rate: loanProcess?.rate,
          locked: loanProcess?.rateLocked,
        },
        borrower,
      }
    } else {
      throw new NotFoundException(`Loan Number: "${loanNumber}" does not exist!`)
    }
  }
}
