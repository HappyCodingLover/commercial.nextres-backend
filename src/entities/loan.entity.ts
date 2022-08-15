import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity()
export class Loan {
  @PrimaryGeneratedColumn()
  id: number

  @Index()
  @Column({
    unique: true,
    nullable: false,
  })
  no: number

  @Column({ nullable: false })
  productType: string

  @Column({ nullable: false })
  transactionType: string

  @Column({ nullable: true })
  proposedOccupancy: string

  @Column({ nullable: true })
  currentCoeDate: string

  @Column({ nullable: true })
  loanTerm: number

  @Column({ nullable: true })
  borrowerType: string

  @Column({ nullable: true, type: 'decimal' })
  proposedLoanAmount: number

  @Column({ nullable: true, type: 'decimal' })
  propertyPurchasePrice: number

  @Column({ nullable: true, type: 'decimal' })
  asIsValue: number

  @Column({ nullable: true, type: 'decimal' })
  afterRepairValue: number

  @Column({ nullable: true, type: 'decimal' })
  rehabBudget: number

  @Column({ nullable: true, type: 'decimal' })
  constructionReserve: number

  @Column({ nullable: true, type: 'decimal' })
  cashOutAmount: number

  @Column({ nullable: true })
  experience: string

  @Column({ nullable: true, type: 'decimal' })
  proposedMonthlyTaxes: number

  @Column({ nullable: true, type: 'decimal' })
  proposedMonthlyInsurance: number

  @Column({ nullable: true, type: 'decimal' })
  proposedMonthlyRent: number

  @Column({ nullable: true, type: 'decimal' })
  proposedMonthlyHoaDues: number

  @Column({ nullable: true })
  propertyType: string

  @Column({ nullable: true })
  condoType: string

  @Column({ nullable: true })
  prepaymentPenalty: string

  @Column({ nullable: true })
  residency: string

  @Column({ nullable: true })
  amortizationType: string

  @Column({ nullable: true })
  escrowType: string

  @Column({ nullable: true })
  countryOfCreditScore: string

  @Column({ nullable: true })
  selfEmployed: boolean

  @Column({ nullable: true })
  firstTimeHomeBuyer: boolean

  @Column({ nullable: true })
  firstTimeHomeInvestor: boolean

  @Column({ nullable: true })
  ruralProperty: boolean

  @Column({ nullable: true })
  bankruptcy: string

  @Column({ nullable: true })
  foreclosure: string

  @Column({ nullable: true })
  deedInLieu: string

  @Column({ nullable: true })
  shortSale: string

  @Column({ nullable: true })
  mortgageLates: string

  @Column({ nullable: true, type: 'decimal' })
  secondLien: number

  @Column({ nullable: true })
  monthsReserve: number

  @Column({ nullable: true, type: 'decimal' })
  estimatedDscr: number

  @Column({ nullable: true })
  numberOfUnits: number

  @Column({ nullable: true, type: 'decimal' })
  cashInHand: number

  @Column({ nullable: true })
  guarantorFirstName: string

  @Column({ nullable: true })
  guarantorLastName: string

  @Column({ nullable: true })
  borrowerFirstName: string

  @Column({ nullable: true })
  borrowerMiddleName: string

  @Column({ nullable: true })
  borrowerLastName: string

  @Column({ nullable: true })
  estimatedCreditScore: number

  @Column({ nullable: true })
  subjectPropertyAddress: string

  @Column({ nullable: true })
  propertyCounty: string

  @Column({ nullable: true })
  apartmentUnit: number

  @Column({ nullable: true })
  yearAcquired: number

  @Column({ nullable: true, type: 'decimal' })
  amountExistingLiens: number

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt: number

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
  updatedAt: number
}
