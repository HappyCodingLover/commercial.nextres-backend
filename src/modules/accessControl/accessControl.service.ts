import { ConflictException, Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Permission } from 'entities/permission.entity'
import { Role } from 'entities/role.entity'
import { Repository } from 'typeorm'

@Injectable()
export class AccessControlService {
  constructor(
    @InjectRepository(Role) private roleRepository: Repository<Role>,
    @InjectRepository(Permission) private permissionRepository: Repository<Permission>,
  ) {}

  async getAllPermissions() {
    return this.permissionRepository.find({})
  }

  async getAllPermissionsByRole() {
    return this.roleRepository.find({
      relations: ['permissions'],
    })
  }

  async getRolePermissionDetails() {
    const details = {
      roles: await this.roleRepository.find({}),
      permissions: await this.getAllPermissions(),
      roles_permissions: await this.getAllPermissionsByRole(),
    }
    return details
  }

  async createNewPermission(permissionName: string) {
    try {
      const createdPermission = await this.permissionRepository.create({
        permissionName,
      })
      await this.permissionRepository.save(createdPermission)
    } catch (e) {
      throw new NotAcceptableException(e.detail)
    }
  }

  async updatePermission(permissionId: number, newPermissionName: string) {
    try {
      const foundPermission = await this.permissionRepository.findOneBy({
        id: permissionId,
      })

      foundPermission.permissionName = newPermissionName
      const updatedPermission = await this.permissionRepository.save(foundPermission)
      return {
        updatedPermissionId: updatedPermission.id,
      }
    } catch (e) {
      throw new NotFoundException(e.default)
    }
  }

  async deletePermission(permissionId: number) {
    try {
      const deletedPermission = await this.permissionRepository.findOneBy({
        id: permissionId,
      })
      return this.permissionRepository.remove(deletedPermission)
    } catch (e) {
      throw new NotFoundException(e.detail)
    }
  }

  async createNewRole(roleName: string) {
    try {
      const newRole = await this.roleRepository.create({
        roleName: roleName.toUpperCase(),
      })

      const createdRole = await this.roleRepository.save(newRole)
      return {
        roleId: createdRole.id,
      }
    } catch (e) {
      throw new ConflictException(e.detail)
    }
  }

  async updateRole(roleId: number, newRoleName: string) {
    try {
      const foundRole = await this.roleRepository.findOneBy({
        id: roleId,
      })

      foundRole.roleName = newRoleName
      const updatedRole = await this.roleRepository.save(foundRole)
      return {
        updatedRoleId: updatedRole.id,
      }
    } catch (e) {
      throw new NotFoundException(e.default)
    }
  }

  async deleteRole(roleId: number) {
    try {
      const deletedRole = await this.roleRepository.findOneBy({
        id: roleId,
      })
      return this.roleRepository.remove(deletedRole)
    } catch (e) {
      throw new NotFoundException(e.detail)
    }
  }

  async addPermissionsToRole(roleId: number, permissionIds: number[]) {
    const foundRole = await this.roleRepository.findOne({
      where: {
        id: roleId,
      },
      relations: ['permissions'],
    })
    const existingPermissions = foundRole?.permissions.map((x) => x.id)
    foundRole.permissions = await this.permissionRepository.findByIds([...existingPermissions, ...permissionIds])

    return this.roleRepository.save(foundRole)
  }

  async removePermissionsFromRole(roleId: number, permissionIds: number[]) {
    const foundRole = await this.roleRepository.findOne({
      where: {
        id: roleId,
      },
      relations: ['permissions'],
    })

    foundRole.permissions = foundRole.permissions.filter((permission) => {
      return !permissionIds.includes(permission.id)
    })

    return this.roleRepository.save(foundRole)
  }

  async getRoleFromName(roleName: string) {
    const foundRole = await this.roleRepository.findOne({
      where: {
        roleName,
      },
    })
    return foundRole
  }
}
