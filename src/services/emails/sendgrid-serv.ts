const fs = require("fs");
import sgMail from '@sendgrid/mail';

import config from '../../config/app-config';
import { LoggerUtil } from '../../utils/logger-util';

export class SendgridService {
    constructor() {
        sgMail.setApiKey(config.EMAIL.SENDGRID.API_KEY);
    }

    /**
     *  Sends email
     *  @function
     *  @name sendEmail
     *  @param {JSON} Parameters containing SUBJECT, BODY, TO, BCC, CC etc.
     *  @return {PROMISE}
     */
    async sendEmail(data: any) {
        return new Promise(async (resolve, reject) => {
            let logData = {
                email: data.email,
                subject: data.subject,
                filename: data.hasAttachment ? data.attachment.filePath : '-'
            };

            LoggerUtil.log('info', { message: 'Sending email', location: 'sendgrid-serv => sendEmail', data: logData });

            let message: any = {
                to: data.email,
                html: data.body,
                subject: data.subject,
                from: config.EMAIL.FROM_EMAIL
            };

            try {
                if (data.hasAttachment) {
                    message.attachments = [{
                        disposition: 'attachment',
                        type: data.attachment.contentType,
                        filename: data.attachment.fileName,
                        content: fs.readFileSync(data.attachment.filePath).toString("base64")
                    }];

                    try {
                        let result: any = await sgMail.send(message);

                        LoggerUtil.log('info', { message: 'Email sent', location: 'sendgrid-serv => sendEmail', result: result });
                        resolve(true);
                    } catch (error: any) {
                        LoggerUtil.log('error', { message: 'Cannot send email', location: 'sendgrid-serv => sendEmail', data: error });
                        resolve(false);
                    }
                } else {
                    try {
                        let result: any = await sgMail.send(message);

                        LoggerUtil.log('debug', { message: 'Email sent', location: 'sendgrid-serv => sendEmail', result: result });
                        resolve(true);
                    } catch (error) {
                        LoggerUtil.log('error', { message: 'Cannot send email', location: 'sendgrid-serv => sendEmail', data: error });
                        resolve(false);
                    }
                }
            } catch (error) {
                LoggerUtil.log('error', { message: 'Cannot send email', location: 'sendgrid-serv => sendEmail', data: error });
                resolve(false);
            }
        });
    };
}