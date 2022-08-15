import { IsDefined, IsEmail, IsNotEmpty } from 'class-validator'

export class SigninUserDto {
  @IsDefined()
  @IsEmail()
  email: string

  @IsDefined()
  @IsNotEmpty()
  password: string
}
