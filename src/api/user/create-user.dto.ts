import { Transform } from 'class-transformer'
import { IsBoolean, IsDefined, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'
import { AccountType } from 'entities'

export class CreateUserDto {
  @IsDefined()
  @IsNotEmpty()
  @IsEnum(AccountType)
  accountType: AccountType

  @IsOptional()
  @IsNumber()
  @Transform((value) => parseInt(value.value))
  accountExecutive: number = 0

  @IsOptional()
  @IsNumber()
  @Transform((value) => parseInt(value.value))
  broker: number = 0

  @IsOptional()
  @IsNumber()
  @Transform((value) => parseInt(value.value))
  branch: number = 0

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  name: string

  @IsDefined()
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  email: string

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  phone: string

  @IsOptional()
  @IsString()
  phoneExt: string

  @IsOptional()
  @IsString()
  street: string

  @IsOptional()
  @IsString()
  city: string

  @IsOptional()
  @IsString()
  state: string

  @IsOptional()
  @IsString()
  zip: string

  @IsOptional()
  @IsString()
  companyName: string

  @IsOptional()
  @IsString()
  companyNmls: string

  @IsOptional()
  @IsString()
  branchNmls: string

  @IsOptional()
  @IsString()
  companyLicense: string

  @IsOptional()
  @IsString()
  loanOfficerNmls: string

  @IsOptional()
  @IsString()
  minCompensation: string

  @IsOptional()
  @IsString()
  maxCompensation: string

  @IsOptional()
  @IsString()
  brokerCompensation: string

  @IsOptional()
  @IsString()
  loadOfficerLicense: string

  @IsOptional()
  @IsBoolean()
  businessPurpose: boolean

  @IsOptional()
  @IsBoolean()
  condoReview: boolean

  @IsOptional()
  @IsDefined()
  @IsNotEmpty()
  @IsBoolean()
  showGenerateDocuments: boolean

  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
