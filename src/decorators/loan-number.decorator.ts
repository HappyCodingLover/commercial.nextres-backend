import { createParamDecorator, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common'

export const LoanNumber = createParamDecorator((data, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  const loanNumber = request.headers['loan-number'] as string
  if (loanNumber === undefined) throw new HttpException('Loan number is required', HttpStatus.FORBIDDEN)

  return parseInt(loanNumber)
})
