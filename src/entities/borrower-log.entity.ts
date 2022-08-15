import { BorrowerSeperator } from 'entities'
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class BorrowerLog {
  @PrimaryGeneratedColumn()
  id: number

  @Index()
  @Column({ nullable: false })
  loanNumber: number

  // Borrower Seperator
  @Column({ type: 'enum', enum: BorrowerSeperator, default: BorrowerSeperator.BORROWER, nullable: false })
  borrowerSeperator: BorrowerSeperator

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
