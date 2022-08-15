import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import { User } from './user.entity'

export enum UserActivityType {
  LOGIN = 'login',
  FORGET_PASSWORD = 'forget_password',
  RESET_PASSWORD = 'reset_password',
  REGISTER_USER = 'register_user',
  CREATE_USER = 'create_user',
  UPDATE_USER = 'update_user',
  UPDATE_LOAN_SUBMISSION_CLEAR = 'update_loan_submission_clear',
}

@Entity()
export class UserActivity {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn()
  user: User

  @Column({ default: 0 })
  loanNumber: number

  @Column()
  action: string

  @Column({ type: 'enum', enum: UserActivityType, nullable: false })
  type: UserActivityType

  @Column({ default: {}, type: 'json' })
  detail: Record<string, any>

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt: Date
}
