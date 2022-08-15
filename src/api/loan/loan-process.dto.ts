import { IsNotEmpty } from 'class-validator'

export class LoanProcessDto {
  @IsNotEmpty()
  type: string

  @IsNotEmpty()
  program: string

  rate: number

  price: number

  sheetDate: string

  lockDays: number

  lockedDate: string

  rateLocked: boolean
}
