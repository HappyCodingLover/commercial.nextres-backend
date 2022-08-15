import { IsDefined, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateContactUsDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  name: string

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  phone: string

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  message: string
}
