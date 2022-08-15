import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import {
  Borrower,
  BorrowerLog,
  Loan,
  LoanApplication,
  LoanHistory,
  LoanLog,
  LoanProcess,
  LoanRatesheet,
  LoanSubmission,
  Setting,
} from 'entities'
import { SettingService } from 'modules/base/setting.service'
import { DocumentsService } from 'modules/documents/documents.service'
import { UsersModule } from 'modules/users/users.module'
import { SharedModule } from 'shared/shared.module'

import { LoanService } from './loan.service'
import { LoanApplicationService } from './loan-application.service'
import { LoanApplicationLogService } from './loan-application-log.service'
import { LoanHistoryService } from './loan-history.service'
import { LoanLogService } from './loan-log.service'
import { LoanProcessService } from './loan-process.service'
import { LoanRatesheetService } from './loan-ratesheet.service'
import { LoanSubmissionService } from './loan-submission.service'

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      Borrower,
      Loan,
      LoanLog,
      LoanProcess,
      LoanRatesheet,
      Setting,
      LoanApplication,
      BorrowerLog,
      LoanSubmission,
      LoanHistory,
    ]),
    SharedModule,
    UsersModule,
  ],
  providers: [
    LoanService,
    LoanProcessService,
    LoanRatesheetService,
    LoanLogService,
    SettingService,
    LoanApplicationService,
    LoanApplicationLogService,
    LoanHistoryService,
    LoanSubmissionService,
    DocumentsService,
  ],
  exports: [
    LoanService,
    LoanProcessService,
    LoanRatesheetService,
    LoanLogService,
    SettingService,
    LoanApplicationService,
    LoanApplicationLogService,
    LoanHistoryService,
    LoanSubmissionService,
  ],
})
export class LoanModule {}
