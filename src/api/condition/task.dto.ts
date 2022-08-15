import { Transform } from 'class-transformer'
import { IsArray, IsDefined, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'
import { Level } from 'constants/types'
import { AccountType } from 'entities'
import { TaskPriority, TaskSecurity } from 'entities/task.entity'

export class TaskDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @Transform((value) => value.value.trim())
  description: string

  @IsDefined()
  @IsNotEmpty()
  @IsEnum(AccountType)
  assignedTo: AccountType

  @IsDefined()
  @IsNotEmpty()
  @Transform((value) => parseInt(value.value))
  @IsNumber()
  dueDays: number

  @IsDefined()
  @IsNotEmpty()
  @IsEnum(Level)
  security: TaskSecurity

  @IsDefined()
  @IsNotEmpty()
  @IsEnum(Level)
  priority: TaskPriority

  @IsOptional()
  @IsString()
  @Transform((value) => value.value.trim())
  notes: string

  @IsDefined()
  @IsArray()
  completeEmail: Array<string>

  @IsDefined()
  @IsArray()
  createEmail: Array<string>
}
