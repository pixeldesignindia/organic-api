import { NodeMailgun } from 'ts-mailgun';

import config from '../../config/app-config';
import { LoggerUtil } from '../../utils/logger-util';

export class MailgunService {
    private mailer: NodeMailgun;

    constructor() {
        this.initEmail();
    }

    initEmail() {
        this.mailer = new NodeMailgun();

        this.mailer.domain = config.EMAIL.MAILGUN.DOMAIN;
        this.mailer.apiKey = config.EMAIL.MAILGUN.API_KEY;
        this.mailer.fromEmail = config.EMAIL.PDF_FROM_EMAIL;
        this.mailer.fromTitle = config.EMAIL.PDF_FROM_TITLE;

        try {
            this.mailer.init();
        } catch (err) {
            LoggerUtil.log('error', { message: 'Cannot initialize email settings', location: 'mailgun-serv => constructor', error: err });
        }
    }

    /**
     *  Sends email
     *  @function
     *  @name sendEmail
     *  @param {JSON} Parameters containing SUBJECT, BODY, TO, BCC, CC etc.
     *  @return {STRING} Full name
     */
    async sendEmail(data: any) {
        return new Promise(async (resolve, reject) => {
            let logData = {
                email: data.email,
                subject: data.subject,
                filename: data.hasAttachment ? data.attachment.filePath : '-'
            };

            LoggerUtil.log('info', { message: 'Sending email', location: 'mailgun-serv => sendEmail', data: logData });

            try {
                if (data.hasAttachment) {
                    try {
                        let result: any = await this.mailer.send(
                            data.email,
                            data.subject,
                            data.body,
                            {},
                            { attachment: data.attachment.filePath }
                        );

                        LoggerUtil.log('info', { message: 'Email sent', location: 'mailgun-serv => sendEmail', result: result });
                        resolve(true);
                    } catch (error: any) {
                        LoggerUtil.log('error', { message: 'Cannot send email', location: 'mailgun-serv => sendEmail', data: error });
                        resolve(false);
                    }
                } else {
                    try {
                        let result: any = await this.mailer.send(
                            data.email,
                            data.subject,
                            data.body
                        );

                        LoggerUtil.log('debug', { message: 'Email sent', location: 'mailgun-serv => sendEmail', result: result });
                        resolve(true);
                    } catch (error) {
                        LoggerUtil.log('error', { message: 'Cannot send email', location: 'mailgun-serv => sendEmail', data: error });
                        resolve(false);
                    }
                }
            } catch (error) {
                LoggerUtil.log('error', { message: 'Cannot send email', location: 'mailgun-serv => sendEmail', data: error });
                resolve(false);
            }
        });
    };
}