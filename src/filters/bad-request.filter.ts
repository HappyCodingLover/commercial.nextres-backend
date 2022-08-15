import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ValidationError } from 'class-validator'
import { Response } from 'express'
import * as _ from 'lodash'

@Catch(BadRequestException)
export class BadRequestExceptionFilter implements ExceptionFilter {
  constructor(public reflector: Reflector) {}

  catch(exception: BadRequestException, host: ArgumentsHost) {
    const arrayError = []
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    let statusCode = exception.getStatus()
    const r = <any>exception.getResponse()

    if (_.isArray(r.message) && r.message[0] instanceof ValidationError) {
      statusCode = HttpStatus.BAD_REQUEST
      const validationErrors = <ValidationError[]>r.message
      this._validationFilter(validationErrors, arrayError)
    }

    r.success = false

    if (arrayError.length > 0) {
      r.message = arrayError[0]
    }
    r.fullError = arrayError
    response.status(statusCode).json(r)
  }

  private _validationFilter(validationErrors: ValidationError[], arrayError) {
    for (const validationError of validationErrors) {
      for (const [, constraint] of Object.entries(validationError.constraints)) {
        if (constraint) {
          arrayError.push('validation.' + _.snakeCase(constraint))
        }
      }
      if (!_.isEmpty(validationError.children)) {
        this._validationFilter(validationError.children, arrayError)
      }
    }
  }
}
