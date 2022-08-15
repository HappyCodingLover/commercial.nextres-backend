import { IsNotEmpty } from 'class-validator'

export class AccessControlDto {
  @IsNotEmpty()
  roleId: number

  @IsNotEmpty()
  roleName: string
}
