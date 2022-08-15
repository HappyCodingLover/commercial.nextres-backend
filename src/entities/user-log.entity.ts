import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm'

import { User } from './user.entity'

@Entity()
export class UserLog {
  @PrimaryGeneratedColumn()
  id: number

  @OneToOne(() => User, (user) => user.id)
  @JoinColumn()
  user: User

  @Column({ default: [], type: 'json' })
  data: Array<{
    time: Date
    email: string
    operates: Record<string, any>
  }>
}
