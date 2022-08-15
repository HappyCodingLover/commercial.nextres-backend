import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import { Role } from './role.entity'

export enum AccountType {
  ADMIN = 'admin',
  UW_MANAGER = 'uw_manager',
  UNDERWRITER = 'underwriter',
  APPRAISER = 'appraiser',
  LOCK_DESK = 'lock_desk',
  LOAN_SETUP = 'loan_setup',
  DISCLOSURE_SPEC = 'disclosure_spec',
  CLOSER = 'closer',
  POST_CLOSER = 'post_closer',
  NATIONAL_SALE = 'national_sale',
  OPERATION_SUPERVISOR = 'operation_supervisor',
  ACCOUNT_MANAGER = 'account_manager',
  ACCOUNT_EXECUTIVE = 'account_executive',
  BROKER = 'broker',
  CORRESPONDENT = 'correspondent',
  BRANCH = 'branch',
  LOAN_OFFICER = 'loan_officer',
  LOAN_PROCESSOR = 'loan_processor',
}

export const AccountTypeText = {
  admin: 'Admin',
  uw_manager: 'UW Manager',
  underwriter: 'UnderWriter',
  appraiser: 'Appraiser',
  loan_setup: 'Loan Setup',
  disclosure_spec: 'Disclosure Specialist',
  lock_desk: 'Lock Desk',
  national_sale: 'National Sales',
  operation_supervisor: 'Operation Supervisor',
  closer: 'Closer',
  post_closer: 'Post Closer',
  account_manager: 'Account Manager',
  account_executive: 'Account Executive',
  broker: 'Broker',
  correspondent: 'Correspondent',
  branch: 'Branch',
  loan_officer: 'Loan Officer',
  loan_processor: 'Loan Processor',
}

export enum UserStatus {
  ALL = 'all',
  Active = 'active',
  Inactive = 'inactive',
}

export interface CurrentUser {
  id?: number
  email?: string
  role?: Role
  accountType?: AccountType
}

export type UserOrderBy = 'companyName' | 'name' | 'email' | 'phone' | 'companyNmls' | 'accountType'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ default: '', nullable: false })
  name: string

  @Index()
  @Column({
    unique: true,
  })
  email: string

  @Column({ nullable: false })
  password: string

  @Column({ default: true })
  isActive: boolean

  @Column({ default: '', nullable: false })
  street: string

  @Column({ default: '', nullable: false })
  city: string

  @Column({ default: '', nullable: false })
  state: string

  @Column({ default: '', nullable: false })
  zip: string

  @Column({ default: '', nullable: false })
  phone: string

  @Column({ default: '' })
  phoneExt: string

  // Account Type
  @Column({ type: 'enum', enum: AccountType, default: AccountType.BROKER, nullable: false })
  accountType: AccountType

  // Account Executive Associated With
  @Column({ default: 0 })
  accountExecutive: number

  // Broker Associated With
  @Column({ default: 0 })
  broker: number

  // Branch Associated With
  @Column({ default: 0 })
  branch: number

  @Column({ default: '' })
  companyName: string

  @Column({ default: '' })
  companyNmls: string

  @Column({ default: '' })
  branchNmls: string

  @Column({ default: '' })
  companyLicense: string

  @Column({ default: '' })
  loanOfficer: string

  @Column({ default: '' })
  minCompensation: string

  @Column({ default: '' })
  maxCompensation: string

  // Broker/Branch Compensation
  @Column({ default: '' })
  brokerCompensation: string

  // Loan Officer State license ID
  @Column({ default: '' })
  loanOfficerStateLicense: string

  // Business Purpose Eligible?
  @Column({ default: true })
  businessPurpose: boolean

  // Condo Review Eligible?
  @Column({ default: false })
  condoReview: boolean

  @Column({ default: false })
  showGenerateDocuments: boolean

  @ManyToOne(() => Role, (role) => role.id)
  @JoinColumn()
  role: Role

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt: number

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
  updatedAt: number
}
