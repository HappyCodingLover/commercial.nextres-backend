import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

export enum BorrowerSeperator {
  BORROWER = 'borrower',
  CO_BORROWER = 'coBorrower',
}

@Entity()
export class Borrower {
  @PrimaryGeneratedColumn()
  id: number

  @Index()
  @Column({ nullable: false })
  loanNumber: number

  // Borrower Seperator
  @Column({ type: 'enum', enum: BorrowerSeperator, default: BorrowerSeperator.BORROWER, nullable: false })
  borrowerSeperator: BorrowerSeperator

  @Column({ default: false })
  hasEntityTitle: boolean

  @Column({ default: '' })
  entityTitle: string

  @Column({ default: '' })
  borrowerType: string

  @Column({ default: '' })
  firstName: string

  @Column({ default: '' })
  middleName: string

  @Column({ default: '' })
  lastName: string

  @Column({ default: '' })
  email: string

  @Column({ default: '' })
  ssn: string

  @Column({ default: '' })
  phone: string

  @Column({ default: '' })
  dob: string

  @Column({ default: '' })
  presentAddress: string

  @Column({ default: '' })
  mailingAddress: string

  @Column({ default: '' })
  ownership: string

  @Column({ default: '' })
  ownedRentedYears: string

  @Column({ default: '' })
  formerAddress: string

  @Column({ default: '' })
  formerOwnership: string

  @Column({ default: '' })
  formerOwnedRentedYears: string

  @Column({ default: '' })
  maritalStatus: string

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt: number

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
  updatedAt: number
}
