import { Transform } from 'class-transformer'
import { IsArray, IsDefined, IsNotEmpty, IsString } from 'class-validator'

export class TemplateDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @Transform((value) => value.value.trim())
  name: string

  @IsDefined()
  @IsNotEmpty()
  @IsArray()
  conditions: Array<number>
}
