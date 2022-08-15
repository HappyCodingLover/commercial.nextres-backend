import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity()
export class LoanProcess {
  @PrimaryGeneratedColumn()
  id: number

  @Index()
  @Column({
    unique: true,
    nullable: false,
  })
  loanNumber: number

  @Column({ nullable: true })
  type: string

  @Column({ nullable: true })
  program: string

  @Column({ nullable: true, type: 'decimal' })
  rate: number

  @Column({ nullable: true, type: 'decimal' })
  price: number

  @Column({ nullable: true })
  sheetDate: string

  @Column({ nullable: true })
  lockDays: number

  @Column({ nullable: true })
  lockedDate: string

  @Column({ nullable: false })
  rateLocked: boolean

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt: number

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
  updatedAt: number
}
