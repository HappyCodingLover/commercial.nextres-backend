import { ForbiddenException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { LoanSubmissionDto } from 'api/loan/loan-submission.dto'
import { AppEnvironment } from 'app.environment'
import * as aws from 'aws-sdk'
import { LoanSubmission } from 'entities'
import { Response } from 'express'
import { UserActivityService } from 'modules/users/user-activity.service'
import { S3Service } from 'shared/services'
import { Repository } from 'typeorm'

import { LoanHistoryService } from './loan-history.service'

const PDFMerger = require('pdf-merger-js')
const s3Zip = require('s3-zip')

@Injectable()
export class LoanSubmissionService {
  constructor(
    @InjectRepository(LoanSubmission)
    private readonly repository: Repository<LoanSubmission>,
    private readonly loanHistoryService: LoanHistoryService,
    private readonly s3Service: S3Service,
    private readonly appEnvironment: AppEnvironment,
    private readonly userActivityService: UserActivityService,
  ) {}

  async get(loanNumber: number) {
    const item = await this.repository.findOneBy({ loanNumber })
    // if (!item) throw new NotFoundException('Unknown loan number')
    return item
  }

  async setValue(loanNumber: number, loanValueDto: LoanSubmissionDto, operatorEmail: string) {
    let item = await this.repository.findOneBy({ loanNumber })
    const { conditions, documents, templateNumber, conditionOrder } = loanValueDto

    if (!item) {
      await this.repository.insert({
        loanNumber,
        templateNumber,
        conditions: conditions.set,
        documents: documents.set,
        conditionOrder: documents.set,
      })
      return
    }

    // if (templateNumber != item.templateNumber)
    //   await this.loanHistoryService.create(
    //     loanNumber,
    //     `Condition Template Update - ${item.templateNumber}`,
    //     operatorEmail,
    //   )

    item.templateNumber = templateNumber
    if (conditions.set) item.conditions = conditions.set
    else if (conditions.update) {
      conditions.update.forEach((updatedCondition) => {
        const index = item.conditions.findIndex((condition) => condition.no == updatedCondition.no)
        if (index == -1) item.conditions.push(updatedCondition)
        else {
          if (item.conditions[index].cleared != updatedCondition.cleared) {
            this.userActivityService.onUpdateLoanSubmissionClear(loanNumber, updatedCondition)
          }
          item.conditions[index] = updatedCondition
        }
      })
    } else if (conditions.delete) {
      conditions.delete.forEach((deletedCondition) => {
        const index = item.conditions.findIndex((condition) => condition.no == deletedCondition.no)
        if (index == -1) return
        else item.conditions.splice(index, 1)
      })
    }

    if (documents.set) item.documents = documents.set
    else if (documents.update) {
      documents.update.forEach((updatedDoc) => {
        const index = item.documents.findIndex((doc) => doc.key == updatedDoc.key)
        if (index == -1) item.documents.push(updatedDoc)
        else item.documents[index] = updatedDoc
      })
    } else if (documents.delete) {
      documents.delete.forEach((deletedDoc) => {
        const index = item.documents.findIndex((doc) => doc.key == deletedDoc.key)
        if (index == -1) return
        else item.documents.splice(index, 1)
      })
    }

    if (conditionOrder.set) item.conditionOrder = conditionOrder.set

    await this.repository.update(
      {
        loanNumber,
      },
      {
        templateNumber,
        conditions: item.conditions,
        documents: item.documents,
        conditionOrder: item.conditionOrder,
      },
    )
  }

  async downloadDocuments(loanNumber: number, type: string, keys: Array<string>, res: Response) {
    try {
      const item = await this.repository.findOneBy({ loanNumber })
      let documents = []
      if (type === 'all') {
        ;({ documents } = item)
      } else if (type === 'approved') {
        documents = item.documents.filter(({ status }) => status == 'Approved')
      } else if (type === 'selected') {
        documents = item.documents.filter(({ key }) => keys.includes(key))
        if (documents.length == 0) throw new ForbiddenException('Error keys')

        var merger = new PDFMerger()
        let doc_promises = []

        for (let i = 0; i < documents.length; i += 1) {
          try {
            doc_promises.push(this.s3Service.getBase64(documents[i].key, true))
          } catch (error) {}
        }

        doc_promises = await Promise.all(doc_promises)
        for (let i = 0; i < doc_promises.length; i += 1) {
          const buffer = doc_promises[i]
          try {
            if (buffer.success !== 0) await merger.add(buffer)
          } catch {}
        }

        const mergedPdf = await merger.saveAsBuffer()
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Length', mergedPdf.byteLength)
        res.setHeader('Content-Disposition', `attachment; filename=${loanNumber}-Conditions-Selected.Pdf`)
        return res.end(mergedPdf)
      }

      const names = documents.map((item) => ({
        origin: item.key,
        rename: item.name,
      }))

      await this.s3Service.deleteDownload(loanNumber)

      const reResults: Array<any> = await Promise.all(
        names.map((item) => this.s3Service.changeObjectName(loanNumber, item)),
      )

      let Names = []
      for (let i = 0; i < reResults.length; i += 1) {
        const it = reResults[i]
        if (it != 0) {
          const { rename } = it
          Names.push(rename)
        }
      }

      const s3 = await new aws.S3()
      await s3Zip
        .archive(
          { s3, region: this.appEnvironment.S3Region, bucket: this.appEnvironment.S3Bucket },
          `v3/temp/${loanNumber}/download`,
          Names,
        )
        .pipe(res, 'file.zip')
      res.send({})
    } catch (e) {
      console.log(e)
      res.send({})
    }
  }
}
