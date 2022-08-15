import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity()
export class Condition {
  @PrimaryGeneratedColumn()
  id: number

  @Index()
  @Column({
    unique: true,
    nullable: false,
  })
  no: number

  @Column({ unique: true, nullable: false })
  name: string

  @Column({ nullable: false })
  category: string

  @Column({ nullable: false })
  class: string

  @Column({ nullable: false })
  type: string

  @Column({ nullable: false })
  responsibility: string

  @Column({ default: false })
  intext: boolean

  @Column({ nullable: false })
  description: string

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt: number

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
  updatedAt: number
}
