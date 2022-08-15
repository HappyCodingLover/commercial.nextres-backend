import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { CreateUserDto } from 'api/user/create-user.dto'
import { AppEnvironment } from 'app.environment'
import * as bcrypt from 'bcrypt'
import { AccountType, AccountTypeText, CurrentUser, User, UserOrderBy, UserStatus } from 'entities'
import { AccessControlService } from 'modules/accessControl/accessControl.service'
import * as moment from 'moment'
import xlsx from 'node-xlsx'
import { DeepPartial, FindOptionsWhere, Repository } from 'typeorm'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'

import { UserActivityService } from './user-activity.service'
import { UserLogService } from './user-log.service'

@Injectable()
export class UsersService {
  permissionRequireTypes = [
    AccountType.ACCOUNT_EXECUTIVE,
    AccountType.BROKER,
    AccountType.CORRESPONDENT,
    AccountType.BRANCH,
  ]

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private userLogService: UserLogService,
    private appEnvironment: AppEnvironment,
    private accessControlService: AccessControlService,
    private userActivityService: UserActivityService,
  ) {}

  async find(
    query: string,
    status: UserStatus,
    accountType: AccountType,
    orderBy: UserOrderBy,
    orderDir: 1 | -1,
    skip: number,
    count: number,
    currentUser: CurrentUser,
  ) {
    let queryBuilder = this.usersRepository.createQueryBuilder().select('count(id)')
    if (query)
      queryBuilder = queryBuilder.where(
        `("User"."companyName" LIKE '%${query}%' OR "User"."name" LIKE '%${query}%' OR "User"."email" LIKE '%${query}%')`,
      )
    if (status != UserStatus.ALL) queryBuilder = queryBuilder.andWhere('"User"."isActive" = :isActive')
    if (accountType) queryBuilder = queryBuilder.andWhere('"User"."accountType" = :accountType')

    // Check permission and get proper accounts
    if (this.permissionRequireTypes.indexOf(currentUser.accountType) != -1) {
      const user = await this.usersRepository.findOneBy({ id: currentUser.id })
      switch (user.accountType) {
        case AccountType.ACCOUNT_EXECUTIVE:
          queryBuilder = queryBuilder.andWhere(`"User"."accountExecutive" = ${user.id}`)
          break
        case AccountType.BROKER:
        case AccountType.CORRESPONDENT:
          queryBuilder = queryBuilder.andWhere(`"User"."broker" = ${user.id}`)
          break
        case AccountType.BRANCH:
          queryBuilder = queryBuilder.andWhere(`"User"."branch" = ${user.id}`)
          break
      }
    }

    const totalData = await queryBuilder
      .setParameters({
        query,
        isActive: status == UserStatus.Active,
        accountType,
      })
      .execute()
    const totalCount = totalData[0].count

    const users = (await queryBuilder
      .select('*')
      .groupBy('"User"."id"')
      .addGroupBy(`"User"."${orderBy}"`)
      .orderBy(`"User"."${orderBy}"`, orderDir == 1 ? 'ASC' : 'DESC')
      .skip(skip)
      .take(Math.min(count, 50))
      .execute()) as Array<User>

    users.forEach((user) => delete user.password)

    // Set default fields for Loan Processor and Loan Officer from parents
    const loanUsers = users.filter(
      ({ accountType }) => [AccountType.LOAN_PROCESSOR, AccountType.LOAN_OFFICER].indexOf(accountType) != -1,
    )
    const branchIds = loanUsers.map((user) => (user.branch == 0 ? user.broker : user.branch))
    const branchUsers = await this.usersRepository.findByIds(branchIds)
    loanUsers.forEach((user) => {
      const branchId = user.branch == 0 ? user.broker : user.branch
      const branchUser = branchUsers.find((user) => user.id == branchId)
      const keys = ['street', 'city', 'state', 'zip', 'companyName', 'companyNmls']
      keys.forEach((key) => (user[key] = branchUser[key]))
    })

    const executiveUsers = await this.usersRepository.findBy({ accountType: AccountType.ACCOUNT_EXECUTIVE })
    const executives = {}
    executiveUsers.forEach(({ id, name }) => (executives[id] = name))

    users.forEach((user) => {
      const { accountExecutive } = user
      if (accountExecutive == 0) return
      ;(user as any).executive = executives[accountExecutive]
    })

    return {
      success: true,
      total: totalCount,
      data: users,
    }
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({
      where: { email },
    })
  }

  async getUserPermissions(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({
      select: ['id', 'email', 'role', 'accountType'],
      where: { email },
      relations: ['role', 'role.permissions'],
    })
  }

  async setUserRole(userId, roleId) {
    try {
      const foundUser = await this.usersRepository.findOneBy({
        id: userId,
      })
      foundUser.role = roleId
      const updatedUser = await this.usersRepository.save(foundUser)
      return {
        userId: updatedUser.id,
      }
    } catch (e) {
      throw new NotFoundException(e.detail)
    }
  }

  async deleteUserRole(userId: number) {
    try {
      const foundUser = await this.usersRepository.findOneBy({
        id: userId,
      })
      foundUser.role = null
      const updatedUser = await this.usersRepository.save(foundUser)
      return {
        userId: updatedUser.id,
      }
    } catch (e) {
      throw new NotFoundException(e.detail)
    }
  }

  async roles(accountType: AccountType, userId: number, currentUser: CurrentUser) {
    let conditions: Record<string, any> | Array<any> = {}
    switch (accountType) {
      case AccountType.ACCOUNT_EXECUTIVE:
        conditions.accountType = AccountType.ACCOUNT_EXECUTIVE
        break
      case AccountType.BROKER:
      case AccountType.CORRESPONDENT:
        conditions = [
          { accountType: AccountType.BROKER, accountExecutive: userId },
          { accountType: AccountType.CORRESPONDENT, accountExecutive: userId },
        ]
        break
      case AccountType.BRANCH:
        conditions.accountType = AccountType.BRANCH
        conditions.broker = userId
        break
    }
    let users = await this.usersRepository.find({
      where: conditions,
      select: ['id', 'companyName', 'name', 'accountType', 'accountExecutive', 'broker', 'branch'],
    })

    // Check permission and get proper accounts
    if (this.permissionRequireTypes.indexOf(currentUser.accountType) != -1) {
      const cUser = await this.usersRepository.findOneBy({ id: currentUser.id })
      users = users.filter((user) => {
        if (cUser.accountType == user.accountType) return cUser.id == user.id
        switch (cUser.accountType) {
          case AccountType.ACCOUNT_EXECUTIVE:
            return user.accountExecutive == cUser.id
          case AccountType.BROKER:
          case AccountType.CORRESPONDENT:
            return user.broker == cUser.id || user.id == cUser.accountExecutive
          case AccountType.BRANCH:
            return user.branch == cUser.id || user.id == cUser.accountExecutive || user.id == cUser.broker
        }
        return false
      })
    }
    const roles = {}
    users.forEach(
      ({ id, companyName, name, accountType }) =>
        (roles[id] = `${companyName} - ${name} (${AccountTypeText[accountType]})`),
    )
    return roles
  }

  props(userId: number) {
    return this.usersRepository.findOne({
      select: ['id', 'street', 'city', 'state', 'zip', 'companyName', 'companyNmls'],
      where: { id: userId },
    })
  }

  async children(userId: number) {
    const user = await this.usersRepository.findOneBy({ id: userId })
    if (!user) throw new NotFoundException('Unknown user')

    const { id, accountType } = user
    const conditions: Record<string, number> = {}
    switch (accountType) {
      case AccountType.ACCOUNT_EXECUTIVE:
        conditions.accountExecutive = id
        break
      case AccountType.BROKER:
      case AccountType.CORRESPONDENT:
        conditions.broker = id
        break
      case AccountType.BRANCH:
        conditions.branch = id
        break
      default:
        throw new BadRequestException('No need to get children')
    }
    const users = await this.usersRepository.findBy(conditions)
    users.forEach((user) => delete user.password)
    return users
  }

  async updateChildren(userId: number, values: Record<string, string>, operatorEmail: string) {
    const user = await this.usersRepository.findOneBy({ id: userId })
    if (!user) throw new NotFoundException('Unknown user')

    const { accountType } = user
    const allowedAccountTypes = [
      AccountType.ACCOUNT_EXECUTIVE,
      AccountType.BROKER,
      AccountType.CORRESPONDENT,
      AccountType.BRANCH,
    ]
    if (allowedAccountTypes.indexOf(accountType) == -1) throw new NotFoundException('No need to update children')

    const conditions: Record<string, number> = {}
    switch (accountType) {
      case AccountType.ACCOUNT_EXECUTIVE:
        conditions['accountExecutive'] = user.id
        break
      case AccountType.CORRESPONDENT:
      case AccountType.BROKER:
        conditions[AccountType.BROKER] = user.id
        break
      case AccountType.BRANCH:
        conditions[AccountType.BRANCH] = user.id
        break
    }
    const updateValues: Record<string, string> = {}
    const updateKeys = ['accountExecutive', 'broker', 'branch']
    updateKeys.forEach((key) => {
      if (values[key] === undefined) return
      updateValues[key] = values[key]
    })
    if (Object.keys(updateValues).length == 0) throw new NotFoundException('No need to update children')

    return this._update(conditions, updateValues, operatorEmail)
  }

  async create(data: CreateUserDto, operatorEmail: string): Promise<any> {
    const role = await this.accessControlService.getRoleFromName(data.accountType.toUpperCase())
    if (!role) throw new NotFoundException('Unknown Account type')

    try {
      const createdUser = await this._create(
        {
          ...data,
          role,
          password: bcrypt.hashSync(this.appEnvironment.defaultUserPassword, 10),
        },
        operatorEmail,
      )
      return {
        userId: createdUser.id,
      }
    } catch (e) {
      throw new ConflictException(e.detail)
    }
  }

  async _create(entity: DeepPartial<User>, operatorEmail: string) {
    const newUser = await this.usersRepository.create(entity)
    const createdUser = await this.usersRepository.save(newUser)

    await this.userLogService.onCreate(createdUser, operatorEmail)
    await this.userActivityService.onCreateUser(operatorEmail, entity)
    return createdUser
  }

  async update(userId: number, data: CreateUserDto, operatorEmail: string): Promise<any> {
    const user = await this.usersRepository.findOneBy({ id: userId })
    if (!user) throw new NotFoundException('Unknown user')

    // Update user role tree
    const { accountType } = user
    const role = await this.accessControlService.getRoleFromName(data.accountType.toUpperCase())
    if (!role) throw new NotFoundException('Unknown Account type')

    if (user.accountExecutive != data.accountExecutive || user.broker != data.broker || user.branch != data.branch) {
      const allowedAccountTypes = [AccountType.BROKER, AccountType.CORRESPONDENT, AccountType.BRANCH]
      if (allowedAccountTypes.indexOf(accountType) != -1) {
        const conditions: Record<string, number> = {}
        if (accountType == AccountType.CORRESPONDENT) conditions[AccountType.BROKER] = user.id
        else conditions[accountType] = user.id

        const updates: Record<string, number> = {
          accountExecutive: data.accountExecutive,
        }
        if (accountType == AccountType.BRANCH) updates.broker = data.broker
        await this._update(conditions, updates, operatorEmail)
      }
    }

    return this._update(
      userId,
      {
        ...data,
        role,
      },
      operatorEmail,
    )
  }

  async _update(
    criteria: number | FindOptionsWhere<User>,
    partialEntity: QueryDeepPartialEntity<User>,
    operatorEmail: string,
    applyForActivity: boolean = true,
  ) {
    await this.userLogService.onUpdate(criteria, partialEntity, operatorEmail, applyForActivity)
    const result = await this.usersRepository.update(criteria, partialEntity)
    return result
  }

  async updateIsActive(userId: number, isActive: boolean, operatorEmail: string): Promise<any> {
    const user = await this.usersRepository.findOneBy({ id: userId })
    if (!user) return
    return this._update(userId, { isActive }, operatorEmail)
  }

  async delete(userId: number) {
    await this.userLogService.delete(userId)
    return this.usersRepository.delete(userId)
  }

  async updatePassword(userId: number, password: string, operatorEmail: string, applyForActivity: boolean = true) {
    const user = await this.usersRepository.findOneBy({ id: userId })
    if (!user) return
    return this._update(
      userId,
      {
        password: bcrypt.hashSync(password, 10),
      },
      operatorEmail,
      applyForActivity,
    )
  }

  async userTree() {
    const users = await this.usersRepository.find({
      where: { isActive: true },
      select: ['id', 'accountExecutive', 'broker', 'branch', 'name', 'accountType'],
    })

    let tree = []
    let countMap = {}
    let userTypeMap = {}
    let executiveMap = {}
    let total = 0

    users.map((item: any) => {
      countMap[item.id] = 0
      total += 1
    })

    users.map((item) => {
      const { id, accountType } = item
      let val: any = {}
      val.id = id
      val.type = AccountTypeText[accountType]
      if (userTypeMap[val.type] === undefined) userTypeMap[val.type] = 1
      else userTypeMap[val.type] += 1
      val.name = item.name
      val.parent = 0

      if (accountType == 'account_executive') {
        val.droppable = true
        executiveMap[id] = val.type + ' - ' + val.name
      }
      if (accountType == 'broker') {
        val.executive = item.accountExecutive
        val.parent = item.accountExecutive
        val.droppable = true
        countMap[item.accountExecutive] += 1
      }
      if (accountType == 'correspondent') {
        val.executive = item.accountExecutive
        val.parent = item.accountExecutive
        val.droppable = true
        countMap[item.accountExecutive] += 1
      }
      if (accountType == 'branch') {
        val.executive = item.accountExecutive
        val.parent = item.broker
        val.droppable = true
        countMap[item.broker] += 1
      }
      if (accountType == 'loan_officer') {
        let value = item.broker
        if (item.branch != 0) value = item.branch
        val.parent = value
        val.droppable = false
        countMap[value] += 1
      }
      if (accountType == 'loan_processor') {
        let value = item.broker
        if (item.branch != 0) value = item.branch
        val.parent = value
        val.droppable = false
        countMap[value] += 1
      }
      tree.push(val)
    })

    tree = tree.sort(function (a, b) {
      var aa = a.type.toLowerCase(),
        bb = b.type.toLowerCase()
      if (aa < bb)
        //sort string ascending
        return -1
      if (aa > bb) return 1
      return 0 //default return value (no sorting)
    })

    let tree2 = {
      name: 'Account System',
      toggled: true,
      nodeId: '1',
      root: true,
      children: [],
    }

    let chMap = {}
    let nodeId = 1
    tree.map((item) => {
      const { id, parent } = item
      let n = `${item.type} - ${item.name}`
      if (countMap[id] !== 0) n += ` (${countMap[id]})`
      if (parent == 0) {
        tree2.children.push({
          name: n,
          id: id,
          nodeId: nodeId++,
        })
      } else {
        if (chMap[parent] == undefined) chMap[parent] = []
        chMap[parent].push(item)
      }
    })

    // broker
    tree2.children.map((item) => {
      const { id } = item
      let val = item
      try {
        if (chMap[id] != undefined) {
          val.children = []
          chMap[id].map((it) => {
            let n = `${it.type} - ${it.name}`
            if (countMap[it.id] !== 0) n += ` (${countMap[it.id]})`
            val.children.push({
              executive: it.executive,
              name: n,
              id: it.id,
              nodeId: nodeId++,
            })
          })
        }
      } catch {}
    })

    // broker's branch officer, processor
    tree2.children.map((item) => {
      try {
        item.children.map((item1) => {
          const { id } = item1
          let val = item1
          try {
            if (chMap[id] != undefined) {
              val.children = []
              chMap[id].map((it) => {
                let n = `${it.type} - ${it.name}`
                if (countMap[it.id] !== 0) n += ` (${countMap[it.id]})`
                if (it.type === 'Branch') {
                  if (it.executive != item1.executive) {
                    n += `   @@@ ${executiveMap[it.executive]} @@@`
                  }
                }
                val.children.push({
                  name: n,
                  id: it.id,
                  // toggled: true,
                  nodeId: nodeId++,
                })
              })
            }
          } catch {}
        })
      } catch {}
    })

    // branch's officer processor
    tree2.children.map((item) => {
      try {
        item.children.map((item1) => {
          try {
            item1.children.map((item2) => {
              const { id } = item2
              let val = item2
              try {
                if (chMap[id] != undefined) {
                  val.children = []
                  chMap[id].map((it) => {
                    let n = `${it.type} - ${it.name}`
                    if (countMap[it.id] !== 0) n += ` (${countMap[it.id]})`
                    val.children.push({
                      name: n,
                      id: it.id,
                      // toggled: true,
                      nodeId: nodeId++,
                    })
                  })
                }
              } catch {}
            })
          } catch {}
        })
      } catch {}
    })

    return {
      data: tree2,
      count: userTypeMap,
      total: total,
    }
  }

  async setLoanDefaultProps(user) {
    if ([AccountType.LOAN_PROCESSOR, AccountType.LOAN_OFFICER].indexOf(user.accountType) == -1) return user

    const branchId = user.branch == 0 ? user.broker : user.branch

    const branchUser = await this.usersRepository.findOneBy({ id: branchId })
    const keys = ['street', 'city', 'state', 'zip', 'companyName', 'companyNmls']
    keys.forEach((key) => (user[key] = branchUser[key]))

    return user
  }

  async getDownloadUserData() {
    const objs = {
      accountType: 'Account Type',
      name: 'Name',
      businessPurpose: 'Business Purpose Eligible?',
      email: 'Email',
      phone: 'Phone',
      phoneExt: 'Phone Ext',
      street: 'Street',
      city: 'City',
      state: 'State',
      zip: 'Zip',
      companyName: 'Company Name',
      companyNmls: 'Company NMLS',
      branchNmls: 'Branch NMLS',
      companyLicense: 'Company License',
      loanOfficer: 'Officer NMLS',
      loanOfficerStateLicense: 'Officer License',
      minCompensation: 'Min Compensation',
      maxCompensation: 'Max Compensation',
      brokerCompensation: 'Broker/Branch Compensation',
      accountExecutive: 'Account Executive',
      broker: 'Broker',
      branch: 'Branch',
      isActive: 'Status',
    }

    const header = []
    Object.keys(objs).map((key) => header.push(objs[key]))

    const users = await this.usersRepository.findBy({
      isActive: true,
    })
    const mapEmail = {}
    users.map((item) => (mapEmail[item.id] = item.email))

    const data = []
    for (let i = 0; i < users.length; i += 1) {
      const it = users[i]
      const val = []
      Object.keys(objs).map((key) => {
        let it1 = it[key]
        if (key === 'accountType') {
          it1 = AccountTypeText[it1]
        }
        if (['accountExecutive', 'broker', 'branch'].indexOf(key) !== -1) {
          it1 = mapEmail[it1]
          if (it1 === undefined) it1 = ''
        }
        val.push(it1)
      })
      data.push(val)
    }
    const Data = [header, ...data]
    const fileData = xlsx.build([{ name: 'Users', data: Data, options: {} }])

    return {
      fileName: `Nextres-Users-${moment().format('MM/DD/YYYY')}.xlsx`,
      fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      fileData,
    }
  }
}
