import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity()
export class LoanSubmission {
  @PrimaryGeneratedColumn()
  id: number

  @Index()
  @Column({
    nullable: false,
  })
  loanNumber: number

  @Column({
    nullable: false,
  })
  templateNumber: number

  @Column({ default: [], type: 'jsonb' })
  conditions: Array<any>

  @Column({ default: [], type: 'jsonb' })
  conditionOrder: Array<number>

  @Column({ default: [], type: 'jsonb' })
  documents: Array<any>

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt: number

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
  updatedAt: number
}
