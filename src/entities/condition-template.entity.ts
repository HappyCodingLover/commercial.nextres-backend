import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity()
export class ConditionTemplate {
  @PrimaryGeneratedColumn()
  id: number

  @Index()
  @Column({
    unique: true,
  })
  no: number

  @Column({
    unique: true,
    nullable: false,
  })
  name: string

  @Column({ type: 'jsonb', default: [] })
  conditions: Array<number>

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt: number

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
  updatedAt: number
}
