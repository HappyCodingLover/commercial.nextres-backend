import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User, UserLog } from 'entities'
import { FindOptionsWhere, In, Repository } from 'typeorm'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'

import { UserActivityService } from './user-activity.service'
const cloneDeep = require('clone-deep')

@Injectable()
export class UserLogService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserLog)
    private userLogRepository: Repository<UserLog>,
    private userActivityService: UserActivityService,
  ) {}

  create(user: User, partialEntity: QueryDeepPartialEntity<User>, operatorEmail: string) {
    return this.userLogRepository.insert({
      user,
      data: [
        {
          email: operatorEmail,
          time: new Date(),
          operates: partialEntity,
        },
      ],
    })
  }

  async onCreate(user: User, operatorEmail: string) {
    if (!user) return
    const isFound = await this.userLogRepository.findOneBy({
      user,
    })
    if (!isFound) await this.create(user, user, operatorEmail)
  }

  async onUpdate(
    criteria: number | FindOptionsWhere<User>,
    partialEntity: QueryDeepPartialEntity<User>,
    operatorEmail: string,
    applyForActivity: boolean = true,
  ) {
    let users: User[] = []
    if (typeof criteria == 'object')
      users = await this.userRepository.find({
        where: criteria,
        relations: ['role'],
      })
    else
      users = [
        await this.userRepository.findOne({
          where: { id: criteria },
          relations: ['role'],
        }),
      ]
    const operatorUser = await this.userRepository.findOne({
      where: { email: operatorEmail },
    })
    if (!operatorUser) return

    await Promise.all(
      users.map(async (user) => {
        const userLog = await this.userLogRepository.findOne({
          where: {
            user: {
              id: user.id,
            },
          },
        })
        const updateEntity = cloneDeep(partialEntity)
        if (!userLog) return this.create(user, partialEntity, operatorEmail)

        this.checkDiffs(user, updateEntity)
        if (Object.keys(updateEntity).length == 0) return

        userLog.data.push({
          email: operatorEmail,
          time: new Date(),
          operates: updateEntity,
        })
        await this.userLogRepository.update(userLog.id, {
          data: userLog.data,
        })

        if (applyForActivity)
          await this.userActivityService.onUpdateUser(operatorUser.id, {
            ...updateEntity,
            id: userLog.id,
          })
      }),
    )
  }

  checkDiffs(user: User, partialEntity: QueryDeepPartialEntity<User>) {
    Object.keys(partialEntity).forEach((key) => {
      if (key == 'role' && user.role.id == (partialEntity.role as any).id) delete partialEntity[key]
      else if (user[key] == partialEntity[key]) delete partialEntity[key]
    })
  }

  async get(userId: number, fieldName: string) {
    const user = await this.userRepository.findBy({ id: userId })
    if (!user) throw new NotFoundException('Unknown user')
    const userLog = await this.userLogRepository.findOne({
      where: {
        user: {
          id: userId,
        },
      },
    })
    if (!userLog) return []

    const data = userLog.data
      .map((log) => {
        const { operates } = log
        const value = operates[fieldName]
        if (value === undefined) return null
        return {
          value,
          email: log.email,
          time: log.time,
        }
      })
      .filter((log) => log !== null)

    const typeList = ['accountExecutive', 'broker', 'branch']
    if (typeList.indexOf(fieldName) != -1) {
      let ids = []
      data.forEach(({ value }) => {
        if (!ids.includes(value)) ids.push(value)
      })
      ids = ids.filter((v) => v !== null)

      const users = await this.userRepository.find({
        where: {
          id: In(ids),
        },
      })

      const userNames: Record<number, string> = {}
      users.forEach(({ id, name }) => (userNames[id] = name))

      data.forEach((v) => {
        if (fieldName == 'branch' && v.value == 0) v.value = 'Main Office'
        else v.value = userNames[v.value]
      })
    }

    return data
  }

  delete(userId: number) {
    return this.userLogRepository.delete({
      user: {
        id: userId,
      },
    })
  }
}
