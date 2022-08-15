import { Level } from 'constants/types'
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

import { AccountType } from './user.entity'

export type TaskSecurity = Level
export type TaskPriority = Level

@Entity()
export class Task {
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
  description: string

  @Column({ type: 'enum', enum: AccountType, default: AccountType.BROKER, nullable: false })
  assignedTo: AccountType

  @Column()
  dueDays: number

  @Column({
    type: 'enum',
    enum: Level,
    default: Level.HIGH,
    nullable: false,
  })
  security: TaskSecurity

  @Column({
    type: 'enum',
    enum: Level,
    default: Level.HIGH,
    nullable: false,
  })
  priority: TaskPriority

  @Column({ default: '' })
  notes: string

  @Column({ type: 'jsonb', default: [] })
  completeEmail: Array<string>

  @Column({ type: 'jsonb', default: [] })
  createEmail: Array<string>

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt: number

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
  updatedAt: number
}
