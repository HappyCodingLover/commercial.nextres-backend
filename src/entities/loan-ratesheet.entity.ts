import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class LoanRatesheet {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    nullable: false,
  })
  loanNumber: number

  @Column({
    nullable: false,
  })
  ratesheetID: number

  @Column({ type: 'json', default: {} })
  data: object

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  date: number
}
