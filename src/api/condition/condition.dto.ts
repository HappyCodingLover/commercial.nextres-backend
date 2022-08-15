import { Transform } from 'class-transformer'
import { IsArray, IsBoolean, IsDefined, IsNotEmpty, IsString } from 'class-validator'

export class ConditionDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @Transform((value) => value.value.trim())
  name: string

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  category: string

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  class: string

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  type: string

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  responsibility: string

  @IsDefined()
  @IsNotEmpty()
  @IsBoolean()
  intext: boolean

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  description: string

  @IsDefined()
  @IsNotEmpty()
  @IsArray()
  templates: Array<number>
}
