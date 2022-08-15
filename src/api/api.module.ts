import { Global, Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { MulterModule } from '@nestjs/platform-express'
import { AppEnvironment } from 'app.environment'
import { AccessControlModule } from 'modules/accessControl/accessControl.module'
import { AuthModule } from 'modules/auth/auth.module'
import { BaseModule } from 'modules/base/base.module'
import { ConditionModule } from 'modules/condition/condition.module'
import { DocumentsModule } from 'modules/documents/documents.module'
import { LoanModule } from 'modules/loan/loan.module'
import { UsersModule } from 'modules/users/users.module'

import { AccessControlController } from './accessControl/accessControl.controller'
import { AuthController } from './auth/auth.controller'
import { BaseController } from './base/base.controller'
import { ConditionController } from './condition/condition.controller'
import { DocumentsController } from './documents/documents.controller'
import { LoanController } from './loan/loan.controller'
import { LoanApplicationController } from './loan/loan-application.controller'
import { LoanSubmissionController } from './loan/loan-submission.controller'
import { UserController } from './user/user.controller'
import { VendorController } from './vendor/vendor.controller'

@Global()
@Module({
  imports: [
    AuthModule,
    UsersModule,
    LoanModule,
    AccessControlModule,
    BaseModule,
    DocumentsModule,
    ConditionModule,
    JwtModule.registerAsync({
      inject: [AppEnvironment],
      useFactory: (appEnvironment: AppEnvironment) => {
        return {
          secret: appEnvironment.jwtSecretKey,
          signOptions: { expiresIn: '3d' },
        }
      },
    }),
    MulterModule.registerAsync({
      useFactory: () => ({
        dest: './upload',
      }),
    }),
  ],
  controllers: [
    BaseController,
    AuthController,
    UserController,
    AccessControlController,
    DocumentsController,
    VendorController,
    ConditionController,
    LoanController,
    LoanApplicationController,
    LoanSubmissionController,
  ],
  providers: [],
})
export class ApiModule {}
