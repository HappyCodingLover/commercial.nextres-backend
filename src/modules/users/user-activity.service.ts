import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User, UserActivity, UserActivityType } from 'entities'
import { Repository } from 'typeorm'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'

@Injectable()
export class UserActivityService {
  constructor(
    @InjectRepository(UserActivity)
    private userActivityRepository: Repository<UserActivity>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOneByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({
      where: { email },
    })
  }

  async getActivity(startDate: string, endDate: string, email: string) {
    let queryBuilder = this.userActivityRepository
      .createQueryBuilder('UserActivity')
      .select('count("UserActivity"."userId")', 'count')
      .addSelect(`"User"."accountType"`, 'accountType')
      .addSelect(`"User"."email"`, 'email')
    queryBuilder = queryBuilder.leftJoinAndSelect('User', 'User', `"UserActivity"."userId" = "User"."id"`)
    if (email) queryBuilder = queryBuilder.where(`("User"."email" LIKE '%${email}%')`)
    if (startDate)
      queryBuilder = queryBuilder.andWhere(`DATE("UserActivity"."createdAt") >= '${new Date(startDate).toISOString()}'`)
    if (endDate)
      queryBuilder = queryBuilder.andWhere(`DATE("UserActivity"."createdAt") <= '${new Date(endDate).toISOString()}'`)

    queryBuilder = queryBuilder.addGroupBy(`"User"."id"`)
    queryBuilder = queryBuilder.addOrderBy('count', 'DESC')

    const users = (await queryBuilder.execute()) as Array<any>

    return users.map((user) => ({
      id: user.User_id,
      email: user.email,
      accountType: user.accountType,
      count: user.count,
    }))
  }

  async getActivities(userId: number, startDate: string, endDate: string, count: number, skip: number) {
    let queryBuilder = this.userActivityRepository.createQueryBuilder().select('count(id)')
    queryBuilder = queryBuilder.where(`"userId" = ${userId}`)
    if (startDate) queryBuilder = queryBuilder.andWhere(`DATE("createdAt") >= '${new Date(startDate).toISOString()}'`)
    if (endDate) queryBuilder = queryBuilder.andWhere(`DATE("createdAt") <= '${new Date(endDate).toISOString()}'`)

    const totalData = await queryBuilder.execute()
    const totalCount = totalData[0].count

    queryBuilder = queryBuilder.select('*').addOrderBy(`"createdAt"`, 'DESC').skip(skip).take(Math.min(count, 50))

    const activities = (await queryBuilder.execute()) as Array<UserActivity>
    return {
      success: true,
      total: totalCount,
      data: activities,
    }
  }

  onLogin(userId: number, ipAddress: string) {
    return this.userActivityRepository.insert({
      user: { id: userId },
      action: `Login - ${ipAddress}`,
      type: UserActivityType.LOGIN,
      detail: {},
    })
  }

  async onForgotPassword(email: string, ipAddress: string) {
    const user = await this.findOneByEmail(email)
    return this.userActivityRepository.insert({
      user: { id: user.id },
      action: `Forgot Password - ${ipAddress}`,
      type: UserActivityType.FORGET_PASSWORD,
      detail: {},
    })
  }

  onResetPassword(userId: number, ipAddress: string) {
    return this.userActivityRepository.insert({
      user: { id: userId },
      action: `Reset Password - ${ipAddress}`,
      type: UserActivityType.RESET_PASSWORD,
      detail: {},
    })
  }

  async onRegisterUser(email: string, ipAddress: string, detail: QueryDeepPartialEntity<User>) {
    const user = await this.findOneByEmail(email)
    return this.userActivityRepository.insert({
      user: { id: user.id },
      action: `Register User - ${ipAddress}`,
      type: UserActivityType.REGISTER_USER,
      detail,
    })
  }

  async onCreateUser(email: string, detail: QueryDeepPartialEntity<User>) {
    const user = await this.findOneByEmail(email)
    return this.userActivityRepository.insert({
      user: { id: user.id },
      action: `Create User`,
      type: UserActivityType.CREATE_USER,
      detail,
    })
  }

  async onUpdateUser(id: number, detail: QueryDeepPartialEntity<User>) {
    return this.userActivityRepository.insert({
      user: { id },
      action: `Update User`,
      type: UserActivityType.UPDATE_USER,
      detail,
    })
  }

  async onUpdateLoanSubmissionClear(loanNumber: number, detail: Record<string, any>) {
    return this.userActivityRepository.insert({
      user: null,
      loanNumber,
      action: `Update Loan Submission Clear`,
      type: UserActivityType.UPDATE_LOAN_SUBMISSION_CLEAR,
      detail,
    })
  }
}
