import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common'

import { RollbarService } from '../shared/services/rollbar.service'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(public rollbarService: RollbarService) {}
  catch(exception: InternalServerErrorException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const request = ctx.getRequest()

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR

    /**
     * @description Exception json response
     * @param message
     */
    const responseMessage = (type, message) => {
      response.status(status).json({
        message,
        success: false,
        statusCode: status,
      })
    }

    this.rollbarService.sendLog(exception, request).then(() => {
      if (status === 500) {
        console.error(exception)
        responseMessage('Error', 'error_internal_server')
      }

      if (exception.message) {
        responseMessage('Error', exception.message)
      } else {
        responseMessage(exception.name, exception.message)
      }
    })
  }
}
