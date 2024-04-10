import { exit } from 'process';
const mongoose = require('mongoose');

import config from '../config/app-config';
import { FileUtil } from '../utils/file-util';
import { GenericUtil } from '../utils/generic-util';
import { EncryptionUtil } from '../utils/encryption-util';

import { IRole, Role } from '../models/role';
import { IUser, User } from '../models/user';

export default class InitialSetup {
    private fileUtil: FileUtil;
    private genericUtil: GenericUtil;
    private encryptionUtil: EncryptionUtil;

    constructor() {
        this.fileUtil = new FileUtil();
        this.genericUtil = new GenericUtil();
        this.encryptionUtil = new EncryptionUtil();
    }

    async setupData() {
        mongoose.connect(config.DB_CONNECTION, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        if (await this.isDataAlreadySetup()) {
            console.log('Seed data already setup');
            exit();
        }

        let adminRole: any = await this.createRoles();
        let adminUser: any = await this.createAdminUsers(adminRole);

        console.log('Seed data setup successfully');
        exit(0);
    }

    async isDataAlreadySetup() {
        return await User.exists({});
    }

    async createRoles() {
        let adminRole: any = null;

        const path = require('path');
        let filePath = path.join(__dirname, './seed-data/roles.json');

        let fileContent = this.fileUtil.readFile(filePath);
        if (fileContent) {
            let roles = JSON.parse(fileContent.toString());
            if (roles) {
                for (let role of roles) {
                    role.created_at = new Date();
                    role.unique_id = this.genericUtil.getUniqueId();

                    if (role.permissions) {
                        for (let permission of role.permissions) {
                            permission.unique_id = this.genericUtil.getUniqueId();
                        }
                    }

                    const createdRole = await Role.create(role);

                    if (role.name.toUpperCase() == 'ADMINISTRATOR') {
                        adminRole = createdRole;
                    }
                }
            }
        }

        return adminRole;
    }

    async createAdminUsers(adminRole: any) {
        let adminUser: IUser = null;
        let createdUser: IUser = null;

        const path = require('path');
        let usersFilePath = path.join(__dirname, './seed-data/users.json');

        let usersFileContent = this.fileUtil.readFile(usersFilePath);
        if (usersFileContent) {
            let users = JSON.parse(usersFileContent.toString());
            if (users) {
                for (let user of users) {
                    user.role_id = adminRole._id;
                    user.created_at = new Date();
                    user.unique_id = this.genericUtil.getUniqueId();
                    user.password = this.encryptionUtil.encryptWithBcrypt(user.password);

                    createdUser = await User.create(user);
                    if (!adminUser) {
                        adminUser = createdUser;
                    }
                }
            }
        }

        return adminUser;
    }
}

let setup = new InitialSetup();
setup.setupData();