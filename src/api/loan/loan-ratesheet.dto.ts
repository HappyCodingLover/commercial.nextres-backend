import { IsNotEmpty } from 'class-validator'

export class LoanRatesheetDto {
  @IsNotEmpty()
  data: object

  @IsNotEmpty()
  ratesheetID: number
}
