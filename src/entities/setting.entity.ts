import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

export enum SettingKey {
  CONDITION_NO = 'CONDITION_NO',
  CONDITION_TEMPLATE_NO = 'CONDITION_TEMPLATE_NO',
  TASK_NO = 'TASK_NO',
  LOAN_NO = 'LOAN_NO',
}

@Entity()
export class Setting {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    unique: true,
  })
  key: string

  @Column()
  value: string

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt: number

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
  updatedAt: number
}
