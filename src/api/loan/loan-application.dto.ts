import { IsDefined, IsEnum, IsNotEmpty } from 'class-validator'
import { BorrowerSeperator } from 'entities'

export class BorrowerSetValueDto {
  @IsDefined()
  @IsNotEmpty()
  @IsEnum(BorrowerSeperator)
  borrowerSeperator: BorrowerSeperator

  hasEntityTitle?: boolean
  entityTitle?: string
  borrowerType?: string
  firstName?: string
  middleName?: string
  lastName?: string
  email?: string
  ssn?: string
  phone?: string
  dob?: string
  presentAddress?: string
  mailingAddress?: string
  ownership?: string
  ownedRentedYears?: string
  formerAddress?: string
  formerOwnership?: string
  formerOwnedRentedYears?: string
  maritalStatus?: string
}
