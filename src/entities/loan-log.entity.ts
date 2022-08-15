import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class LoanLog {
  @PrimaryGeneratedColumn()
  id: number

  @Index()
  @Column({ unique: true, nullable: false })
  loanNumber: number

  @Column({ default: [], type: 'jsonb' })
  data: Array<{
    time: Date
    email: string
    operates: {
      key: string
      value: string | number | boolean
    }
  }>
}
