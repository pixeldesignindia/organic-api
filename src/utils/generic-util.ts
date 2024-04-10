let ejs = require("ejs");
import dotenv from 'dotenv';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

import constants from './constants';
import { FileUtil } from './file-util';
import config from '../config/app-config';

// initialize configuration
dotenv.config();

export class GenericUtil {
    private fileUtil: FileUtil;

    constructor() {
        this.fileUtil = new FileUtil();
    }

    public generateOTP() {
        return Math.floor(1000 + (9999 - 1000) * Math.random());
    }

    public getEmailData(data: any) {
        return new Promise((resolve, reject) => {
            let rootPath = path.normalize(__dirname + '/..');
            let templatePath = rootPath + '/views/email/patient-report.ejs';

            data['thanks_message'] = config.EMAIL.THANKS_MESSAGE ? config.EMAIL.THANKS_MESSAGE : 'Thank you for using our software';

            ejs.renderFile(templatePath, data, (err: any, result: any) => {
                resolve({
                    text: result
                });
            });
        });
    }

    public getExceptionTemplate(data: any) {
        return new Promise((resolve, reject) => {
            let rootPath = path.normalize(__dirname + '/..');
            let templatePath = rootPath + '/views/email/exception.ejs';

            ejs.renderFile(templatePath, data, (err: any, result: any) => {
                resolve(result);
            });
        });
    }

    getContentType(fileName: string) {
        if (fileName.toLowerCase().indexOf(".pdf") > -1) {
            return 'application/pdf';
        } else {
            if (
                fileName.toLowerCase().indexOf(".jpg") > -1 ||
                fileName.toLowerCase().indexOf(".jpeg") > -1
            ) {
                return 'image/jpeg';
            } else if (fileName.toLowerCase().indexOf(".png") > -1) {
                return 'image/png';
            } else {
                return null;
            }
        }
    }

    getFileExtension(fileName: string) {
        const parts = fileName.split('.');

        if (parts.length > 1) {
            return parts[parts.length - 1];
        }

        return null; // No file extension found
    }

    public getSmsData(data: any) {
        return new Promise((resolve, reject) => {
            let rootPath = path.normalize(__dirname + '/..');

            let templatePath = rootPath + '/views/sms/sms-text.ejs';

            data['thanks_message'] = config.SMS.THANKS_MESSAGE ? config.SMS.THANKS_MESSAGE : 'Thank you for using our software';

            ejs.renderFile(templatePath, data, (err: any, result: any) => {
                if (err)
                    reject(err);
                else
                    resolve(result);
            });
        });
    }

    public getWhatsappData(data: any) {
        return new Promise((resolve, reject) => {
            let rootPath = path.normalize(__dirname + '/..');

            let templatePath = rootPath + '/views/whatsapp/whatsapp-text.ejs';

            ejs.renderFile(templatePath, data, (err: any, result: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    public isCustomer(headers: any) {
        return headers && headers.loggedusertype && (headers.loggedusertype == constants.USER_TYPES.CUSTOMER);
    }

    getAgeFromDateOfBirth(birthday: any) { // birthday is a date
        if (birthday) {
            var ageDifMs = Date.now() - birthday.getTime();
            var ageDate = new Date(ageDifMs); // miliseconds from epoch
            return Math.abs(ageDate.getUTCFullYear() - 1970);
        } else {
            return 0;
        }
    }

    getUniqueId() {
        return uuidv4();
    }

    getJsonString(jsonFileName: string) {
        let rootPath = path.normalize(__dirname + '/..');
        return this.fileUtil.readFile(rootPath + '/public/static/json/' + jsonFileName);
    }

    getPhoneNumber(phoneNumber: string) {
        /**
         * Checks following input formats:
         * +91 1111111111
         * +911111111111
         * 911111111111
         */
        if (phoneNumber && phoneNumber.startsWith('+')) {
            if (phoneNumber.indexOf(' ') > -1) {
                phoneNumber = phoneNumber.split(' ')[1];
            } else {
                if (phoneNumber.indexOf('+91') == 0) {
                    phoneNumber = phoneNumber.substring(3);
                }
            }
        } else {
            if (phoneNumber.indexOf('91') == 0) {
                phoneNumber = phoneNumber.substring(2);
            }
        }

        return phoneNumber;
    }

    removeNewLine(str: string, character: string = '') {
        return str.replace(/\n|\r|\t/g, character);
    }

    getFullName(firstName: string, middleName: string, lastName: string) {
        let name = '';
        if (firstName != null && firstName.trim().length > 0)
            name += firstName.trim();
        if (middleName != null && middleName.trim().length > 0)
            name += middleName.trim();
        if (lastName != null && lastName.trim().length > 0)
            name += lastName.trim();

        return name;
    }

    capitalizeFirstLetter(data: string) {
        if (data) {
            return data.charAt(0).toUpperCase() + data.slice(1);
        } else {
            return data;
        }
    }
}