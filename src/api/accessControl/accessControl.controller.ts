import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { Permission } from 'decorators/permission.decorator'
import { AccessControlService } from 'modules/accessControl/accessControl.service'
import { JwtAuthGuard } from 'modules/auth/jwt-auth.guard'

@Controller('ac')
@UseGuards(JwtAuthGuard)
export class AccessControlController {
  constructor(private accessControlService: AccessControlService) {}

  @Get('permissions')
  getAllPermissions() {
    return this.accessControlService.getAllPermissions()
  }

  @Get('permissions/by_role')
  getAllPermissionsByRole() {
    return this.accessControlService.getAllPermissionsByRole()
  }

  @Get('details')
  getRolePermissionDetails(@Permission('MANAGE_PERMISSIONS') user) {
    return this.accessControlService.getRolePermissionDetails()
  }

  @Post('permissions')
  createNewPermission(@Body('permissionName') permissionName: string) {
    return this.accessControlService.createNewPermission(permissionName)
  }

  @Patch('permissions/:permissionId')
  updatePermissionById(@Param('permissionId') permissionId: number, @Body('permissionName') permissionName: string) {
    return this.accessControlService.updatePermission(permissionId, permissionName)
  }

  @Delete('permissions')
  deletePermissionById(@Body('permissionId') permissionId: number) {
    return this.accessControlService.deletePermission(permissionId)
  }

  @Post('role')
  createNewRole(@Body('roleName') roleName: string) {
    return this.accessControlService.createNewRole(roleName)
  }

  @Patch('role/:roleId')
  updateRoleById(@Param('roleId') roleId: number, @Body('roleName') roleName: string) {
    return this.accessControlService.updateRole(roleId, roleName)
  }

  @Delete('role')
  deleteRole(@Body('roleId') roleId: number) {
    return this.accessControlService.deleteRole(roleId)
  }

  @Post('role/permissions')
  addPermissionsToRole(@Body('roleId') roleId: number, @Body('permissionIds') permissionIds: number[]) {
    return this.accessControlService.addPermissionsToRole(roleId, permissionIds)
  }

  @Delete('role/permissions')
  removePermissionsFromRole(@Body('roleId') roleId: number, @Body('permissionIds') permissionIds: number[]) {
    return this.accessControlService.removePermissionsFromRole(roleId, permissionIds)
  }
}
