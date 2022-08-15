import { Transform } from 'class-transformer'
import { removeCommaN } from 'utils/convert'

export class LoanDetailsDto {
  productType?: string

  transactionType?: string

  proposedOccupancy?: string

  currentCoeDate?: string
  loanTerm?: number
  borrowerType?: string

  @Transform(({ value }) => removeCommaN(value))
  proposedLoanAmount?: number

  @Transform(({ value }) => removeCommaN(value))
  propertyPurchasePrice?: number

  @Transform(({ value }) => removeCommaN(value))
  asIsValue?: number

  @Transform(({ value }) => removeCommaN(value))
  afterRepairValue?: number

  @Transform(({ value }) => removeCommaN(value))
  rehabBudget?: number

  @Transform(({ value }) => removeCommaN(value))
  constructionReserve?: number

  @Transform(({ value }) => removeCommaN(value))
  cashOutAmount?: number

  experience?: string

  @Transform(({ value }) => removeCommaN(value))
  proposedMonthlyTaxes?: number

  @Transform(({ value }) => removeCommaN(value))
  proposedMonthlyInsurance?: number

  @Transform(({ value }) => removeCommaN(value))
  proposedMonthlyRent?: number

  @Transform(({ value }) => removeCommaN(value))
  proposedMonthlyHoaDues?: number

  propertyType?: string
  condoType?: string
  prepaymentPenalty?: string
  residency?: string
  amortizationType?: string
  escrowType?: string
  countryOfCreditScore?: string
  selfEmployed?: boolean
  firstTimeHomeBuyer?: boolean
  firstTimeHomeInvestor?: boolean
  ruralProperty?: boolean
  bankruptcy?: string
  foreclosure?: string
  deedInLieu?: string
  shortSale?: string
  mortgageLates?: string

  @Transform(({ value }) => removeCommaN(value))
  secondLien?: number

  monthsReserve?: number
  estimatedDscr?: number
  numberOfUnits?: number

  @Transform(({ value }) => removeCommaN(value))
  cashInHand?: number

  guarantorFirstName?: string
  guarantorLastName?: string
  borrowerFirstName?: string
  borrowerMiddleName?: string
  borrowerLastName?: string
  estimatedCreditScore?: number
  subjectPropertyAddress?: string
  propertyCounty?: string

  @Transform(({ value }) => removeCommaN(value))
  apartmentUnit?: number

  @Transform(({ value }) => removeCommaN(value))
  yearAcquired?: number

  @Transform(({ value }) => removeCommaN(value))
  amountExistingLiens?: number
}
