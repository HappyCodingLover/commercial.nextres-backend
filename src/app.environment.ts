import { Env } from '@nestjs-steroids/environment'
import { Transform } from 'class-transformer'
import { IsEnum, IsNumber, Max, Min } from 'class-validator'

export enum NodeEnvironment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class AppEnvironment {
  /**
   * Env decorator mark environment variable that we want to assign
   * (Tip) Without name env Env decorator makes auto UPPER_SNAKE_CASE conversion (e.g. isTest -> IS_TEST)
   */
  @Env('PORT')
  /**
   * Transform is useful for all sorts of transformations or parsing complex values
   * For example: @Transform(value => value.toLowerCase() === 'true')
   */
  @Transform(({ value }) => Number.parseInt(value, 10))
  /**
   * Also, you could use class-validator operators for validation of the correctness of environment variables
   */
  @IsNumber()
  @Min(0)
  @Max(65535)
  readonly port = 3333

  @Env('NODE_ENV')
  @IsEnum(NodeEnvironment)
  readonly nodeEnvironment = NodeEnvironment.Development

  @Env('SERVER_NAME')
  readonly serverName

  isDevelopment() {
    return this.serverName !== 'Main-Production'
  }

  readonly dbType = 'postgres'

  @Env('JWT_SECRET_KEY')
  readonly jwtSecretKey = ''

  @Env('POSTGRES_HOST')
  readonly pgHost = ''

  @Env('POSTGRES_PORT')
  @Transform(({ value }) => Number.parseInt(value, 10))
  @IsNumber()
  @Min(0)
  @Max(65535)
  readonly pgPort = 0

  @Env('POSTGRES_USER')
  readonly pgUser = ''

  @Env('POSTGRES_PASSWORD')
  readonly pgPassword = ''

  @Env('POSTGRES_DATABASE')
  readonly pgDatabase = ''

  @Env('ROLLBAR_TOKEN')
  readonly tokenRollBar = ''

  @Env('DEFAULT_USER_PASSWORD')
  readonly defaultUserPassword = ''

  @Env('WEBSITE_ORIGIN')
  readonly websiteOrigin = ''

  @Env('SUPER_PASSWORD')
  readonly SuperPassword = ''

  @Env('SEND_GRID')
  readonly sendGridApiKey = ''

  @Env('WEBSITE_URL')
  readonly websiteUrl = ''

  @Env('FINRESI_SERVER')
  readonly finresi_url = ''

  @Env('FINRESI_SECRET_KEY')
  readonly finresi_secret_key = ''
  
  @Env('S3Region')
  readonly S3Region = ''

  @Env('S3AccessKeyId')
  readonly S3AccessKeyId = ''

  @Env('S3SecretAccessKey')
  readonly S3SecretAccessKey = ''

  @Env('S3Bucket')
  readonly S3Bucket = ''

  @Env('USCIS_USER')
  readonly USCIS_USER = ''

  @Env('USCIS_PASSWORD')
  readonly USCIS_PASSWORD = ''
}
