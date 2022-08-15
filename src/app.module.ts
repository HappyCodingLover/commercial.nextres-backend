import { Global, MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { EnvironmentModule } from '@nestjs-steroids/environment'
import { ApiModule } from 'api/api.module'
import { LoggerMiddleware } from 'middlewares/logger.middleware'
import { BaseModule } from 'modules/base/base.module'
import { ConditionModule } from 'modules/condition/condition.module'
import { LoanModule } from 'modules/loan/loan.module'
import { VendorsModule } from 'modules/vendors/vendors.module'
import { AppService } from 'services/app.service'
import { SharedModule } from 'shared/shared.module'

import { AppEnvironment } from './app.environment'
import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'

@Global()
@Module({
  imports: [
    EnvironmentModule.forRoot({
      isGlobal: true,
      loadEnvFile: true,
      useClass: AppEnvironment,
    }),
    TypeOrmModule.forRootAsync({
      inject: [AppEnvironment],
      useFactory: (appEnvorinment: AppEnvironment) => {
        return {
          type: appEnvorinment.dbType,
          host: appEnvorinment.pgHost,
          port: appEnvorinment.pgPort,
          username: appEnvorinment.pgUser,
          password: appEnvorinment.pgPassword,
          database: appEnvorinment.pgDatabase,
          // entities: ['**/*.entity{.ts,.js}'],
          // entities: [User, Role, Permission],
          entities: ['dist/**/*.entity{.ts,.js}'],
          synchronize: true,

          migrationsTableName: 'migration',

          migrations: ['src/migration/*.ts'],

          cli: {
            migrationsDir: 'src/migration',
          },
        }
      },
    }),
    AuthModule,
    BaseModule,
    UsersModule,
    ApiModule,
    LoanModule,
    SharedModule,
    VendorsModule,
    ConditionModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL })
  }
}
