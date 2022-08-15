import { Transform } from 'class-transformer'
import { IsDefined, IsNotEmpty, IsObject } from 'class-validator'

export class LoanSubmissionDto {
  @IsDefined()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  templateNumber: number

  @IsDefined()
  @IsNotEmpty()
  @IsObject()
  conditions: Record<string, Array<any>>

  @IsDefined()
  @IsNotEmpty()
  @IsObject()
  documents: Record<string, Array<any>>

  @IsDefined()
  @IsNotEmpty()
  @IsObject()
  conditionOrder: Record<string, Array<number>>
}
