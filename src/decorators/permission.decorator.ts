import { createParamDecorator, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common'

import { PermissionsConstants } from '../constants'

export const Permission = createParamDecorator(
  (permissionLevel: keyof typeof PermissionsConstants, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    const isAllowed = !!request.user.role.permissions.find(
      (permission) => permission.permissionName === permissionLevel,
    )
    if (!isAllowed) throw new HttpException('Access Forbidden!', HttpStatus.FORBIDDEN)
    return request.user
  },
)
