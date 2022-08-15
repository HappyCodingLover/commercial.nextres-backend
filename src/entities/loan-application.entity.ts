import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity()
export class LoanApplication {
  @PrimaryGeneratedColumn()
  id: number

  @Index()
  @Column({ unique: true, nullable: false })
  loanNumber: number

  @Column({ default: {}, type: 'jsonb' })
  data: Record<string, any>

  @Column({ default: {}, type: 'jsonb' })
  status: Record<string, any>

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt: number

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
  updatedAt: number
}
