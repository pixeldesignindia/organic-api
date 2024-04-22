import { BaseService } from './base-serv';
import constants from '../utils/constants';
import { IRole, Role } from '../models/role';
import { Console } from 'console';

export class RoleService extends BaseService {
    constructor() {
        super(Role);
    }

    async find(id: string, headers: any = null) {
        let role = await Role.findById({ _id: id });
        if (role.permissions && role.permissions.length > 0) {
            role.permissions = role.permissions.sort((a, b) => a.module.localeCompare(b.module));
        }

        return role;
    }

    async getCustomerRoleId() {
        let role: any = await this.findOne({ name: constants.ROLES.CUSTOMER.NAME});
        if (role) {
            return role._id.toString();
        } else {
            return null;
        }
    }

    async findOne(filter: any) {
        let role = await Role.findOne(filter);
        if (role) {
            if (role.permissions && role.permissions.length > 0) {
                role.permissions = role.permissions.sort((a, b) => a.module.localeCompare(b.module));
            }

            return role;
        } else {
            return null;
        }
    }

    async filter(data: any, headers: any = null) {
        let where: any = {};

        if (data) {
            if (data.is_active) {
                where.is_active = data.is_active;
            } else {
                where.is_active = true;
            }
        } else {
            where.is_active = true;
        }

        let roles: any = await Role.find(where).sort('permissions.module');

        roles.sort((a: any, b: any) => {
            const moduleA = a.permissions[0]?.module.toUpperCase(); // Assuming at least one permission exists
            const moduleB = b.permissions[0]?.module.toUpperCase();
            if (moduleA < moduleB) {
                return -1;
            }
            if (moduleA > moduleB) {
                return 1;
            }

            return 0;
        });

        return roles;
    }

    async store(data: any, headers: any = null) {
        return new Promise(async (resolve, reject) => {
            let role = new Role();

            role.is_active = true;
            role.name = data.name;
            role.unique_id = this.genericUtil.getUniqueId();

            if (data.permissions) {
                for (let permission of data.permissions) {
                    role.permissions.push(permission);
                }
            }

            try {
                console.log(role)
                let createdRole = await Role.create(role);
                resolve(createdRole);
            } catch (err) {
                resolve({
                    error: true,
                    message: err ? err.toString() : '-'
                });
            }
        });
    }

    async update(id: any, data: any, headers: any = null) {
        let role: any = await this.find(id);

        if (role) {
            let roleToUpdate = this.getUpdatedRole(role, data);
            console.log(roleToUpdate);
            return await Role.updateOne({ _id: id }, roleToUpdate);
        } else {
            return Promise.reject({
                error: true,
                message: constants.MESSAGES.ERRORS.NOT_FOUND
            });
        }
    }

    getUpdatedRole(role: IRole, data: any) {
        if (role.hasOwnProperty('name') && data.hasOwnProperty('name')) role.name = data.name;
        if (role.hasOwnProperty('is_active') && data.hasOwnProperty('is_active')) role.is_active = data.is_active;
        if (role.hasOwnProperty('is_deleted') && data.hasOwnProperty('is_deleted')) role.is_deleted = data.is_deleted;

        return role;
    }

    async assign(data: any, headers: any = null) {
        let role: any = await this.find(data._id);

        if (role) {
            let roleToUpdate = this.getUpdatedRole(role, data);

            roleToUpdate.permissions = data.permissions;

            return await Role.updateOne({ _id: data._id }, roleToUpdate);
        } else {
            return Promise.reject({
                error: true,
                message: constants.MESSAGES.ERRORS.NOT_FOUND
            });
        }
    }

    async getPermissionByRoleByModule(roleId: string, module: string) {
        let role: any = await this.findOne(roleId);

        if (role && role.permissions) {
            let permissions: any = [];

            for (let permission of role.permissions) {
                if (permission.module == module) {
                    permissions.push(permission);
                }
            }

            return permissions;
        } else {
            return false;
        }
    }

    async removePermission(data: any) {
        let role: any = await this.findOne(data.roleId);

        if (role && role.permissions) {
            let permissions: any = [];

            for (let permission of role.permissions) {
                if (permission._id != data.id) {
                    permissions.push(permission);
                }
            }

            role.permissions = permissions;

            return await Role.updateOne({ _id: role._id }, role);
        } else {
            return false;
        }
    }

    async remove(id: number, headers: any = null) {
        return await this.removeRecord(id);
    }
}