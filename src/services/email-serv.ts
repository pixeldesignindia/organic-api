import { NodeMailgun } from 'ts-mailgun';

import config from '../config/app-config';
import constants from '../utils/constants';

import { LoggerUtil } from '../utils/logger-util';
import { GenericUtil } from '../utils/generic-util';
import { MailgunService } from './emails/mailgun-serv';
import { SendgridService } from './emails/sendgrid-serv';

export class EmailService {
    private mailer: NodeMailgun;

    private genericUtil: GenericUtil;

    constructor() {
        this.genericUtil = new GenericUtil();
    }

    /**
     *  Sends email
     *  @function
     *  @name sendEmail
     *  @param {JSON} Parameters containing SUBJECT, BODY, TO, BCC, CC etc.
     *  @return {STRING} Full name
     */
    async sendEmail(data: any) {
        if (!config.EMAIL_SERVICE) {
            config.EMAIL_SERVICE = constants.EMAIL_SERVICES_MAILGUN;
        }

        if (config.EMAIL_SERVICE.toLowerCase() == constants.EMAIL.SERVICE_MAILGUN.toLowerCase()) {
            return new MailgunService().sendEmail(data);
        }
        else if (config.EMAIL_SERVICE.toLowerCase() == constants.EMAIL.SERVICE_SENDGRID.toLowerCase()) {
            return new SendgridService().sendEmail(data);
        } else {
            return Promise.reject({
                error: true,
                message: constants.MESSAGES.NO_EMAIL_PROVIDER_CONFIGURED
            });
        }
    };

    /**
     *  Sends medical report email
     *  @function
     *  @name sendReportEmail
     *  @param {JSON} Parameters containing ticket information
     */
    async sendForgotPasswordEmail(data: any, subject: string, hasAttachment: boolean = false) {
        let emailData: any = {
            email: data.email,
            subject: subject,
            body: data.body
        };

        /*
        if (hasAttachment) {
            emailData.hasAttachment = true;

            emailData.attachment = {
                contentType: 'application/pdf',
                fileName: data['fileName'],
                filePath: data['filePath']
            };
        }
        */

        return await this.sendEmail(emailData);
    }

    /**
     *  Sends rapid test email
     *  @function
     *  @name sendExceptionEmail
     *  @param {JSON} Parameters containing ticket information
     */
    sendExceptionEmail(emailData: any) {
        emailData['env'] = config.ENV_NAME;

        let to = config.EMAIL.EXCEPTION_NOTIFICATION_EMAIL;
        let subject = '(' + emailData['env'] + ')' + constants.APPLICATION_EXCEPTION_MESSAGE;

        this.genericUtil.getExceptionTemplate(emailData).then((body: string) => {
            let emailData: any = {
                to: to,
                html: body,
                subject: subject
            };

            return this.sendEmail(emailData);
        });
    }
}