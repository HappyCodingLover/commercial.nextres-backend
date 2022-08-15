import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { AppEnvironment } from 'app.environment'
import * as aws from 'aws-sdk'
import * as fs from 'fs'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class S3Service {
  private readonly s3: aws.S3

  constructor(private readonly appEnvironment: AppEnvironment) {
    // Configure AWS to use promise
    aws.config.setPromisesDependency(require('bluebird'))

    aws.config.update({
      region: appEnvironment.S3Region,
      accessKeyId: appEnvironment.S3AccessKeyId,
      secretAccessKey: appEnvironment.S3SecretAccessKey,
      signatureVersion: 'v4',
    })
    this.s3 = new aws.S3()
  }

  upload(path: string, file: Express.Multer.File): Promise<string> {
    const key = `v3/${path}/${uuidv4()}-${file.originalname}`
    const filePath = file.path
    var params: aws.S3.PutObjectRequest = {
      Bucket: this.appEnvironment.S3Bucket,
      Key: key,
      Body: fs.createReadStream(filePath),
      ContentType: file.mimetype,
    }
    return new Promise((resolve, reject) => {
      this.s3.upload(params, (err, data) => {
        if (file.path && fs.existsSync(file.path)) fs.unlinkSync(file.path)
        if (err) reject(err)
        resolve(data.Key)
      })
    })
  }

  async getDownloadUrl(key: string) {
    try {
      var params = {
        Bucket: this.appEnvironment.S3Bucket,
        Key: key,
        Expires: 60 * 9,
        ResponseContentType: '',
      }

      params.ResponseContentType = 'application/pdf'
      if (key.indexOf('.xml') !== -1) params.ResponseContentType = 'text/xml'

      const url = await this.s3.getSignedUrl('getObject', {
        ...params,
      })

      return {
        url: url,
      }
    } catch (error) {
      throw new HttpException('Server Error (S3)', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getBase64(key, buffer = false) {
    return new Promise(async (resolve, reject) => {
      try {
        var params = {
          Bucket: this.appEnvironment.S3Bucket,
          Key: key,
        }

        const s3 = await new aws.S3()

        const object = await s3.getObject(params).promise()
        if (buffer) return resolve(object.Body)
        const base64 = await new Buffer(object.Body as any).toString('base64')
        resolve(base64)
      } catch (error) {
        if (buffer) return resolve({ success: 0 })
        reject(error)
      }
    })
  }

  deleteDownload(loan_id) {
    return new Promise(async (resolve, reject) => {
      try {
        const s3 = await new aws.S3()

        var params: any = {
          Bucket: this.appEnvironment.S3Bucket,
          Prefix: `v3/temp/${loan_id}/download/`,
        }

        s3.listObjects(params, (err, data) => {
          if (err) return reject(0)
          if (data.Contents.length == 0) return resolve(1)

          const deleteParams: any = {
            Bucket: this.appEnvironment.S3Bucket,
            Delete: { Objects: [] },
          }

          data.Contents.forEach((content) => {
            deleteParams.Delete.Objects.push({ Key: content.Key })
          })

          s3.deleteObjects(deleteParams, (err, data) => {
            if (err) return reject(0)
            else return resolve(1)
          })
        })
      } catch {
        reject(0)
      }
    })
  }

  changeObjectName(loan_id, item) {
    return new Promise(async (resolve, reject) => {
      try {
        const s3 = await new aws.S3()
        s3.copyObject({
          Bucket: this.appEnvironment.S3Bucket,
          CopySource: `${this.appEnvironment.S3Bucket}/${item.origin}`,
          Key: `v3/temp/${loan_id}/download/${item.rename}`,
        })
          .promise()
          .then(() => {
            resolve(item)
          })
          .catch((e) => resolve(0))
      } catch {
        resolve(0)
      }
    })
  }
}
