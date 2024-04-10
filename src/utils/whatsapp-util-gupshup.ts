import config from '../config/app-config';
import { LoggerUtil } from './logger-util';
const Gupshup = require('gupshup-whatsapp-api');

export class WhatsappUtilGupshup {
    public WhatsappUtilGupshup() {
    }

    async sendMessage(message: any, notificationConfig: any = null) {
        return new Promise((resolve, reject) => {
            let apiKey: string;
            let appName: string;
            let fromPhoneNumber: string;

            if (notificationConfig) {
                apiKey = notificationConfig.whatsapp_api_key;
                appName = notificationConfig.whatsapp_app_name;
                fromPhoneNumber = notificationConfig.whatsapp_sender
            } else {
                apiKey = config.GUPSHUP.API_KEY;
                appName = config.GUPSHUP.APP_NAME;
                fromPhoneNumber = config.WHATSAPP.FROM_PHONE_NUMBER;
            }

            let client = new Gupshup({
                apiKey: apiKey
            });

            let data = {
                text: message.text,
                fileName: message.filename,
                mobileToLog: message.mobile.slice(0, -6) + 'x'.repeat(6)
            };

            LoggerUtil.log('debug', { message: 'Sending Whatsapp message sent', location: 'whatsapp-util-gupshup => sendMessage', data: data });

            client.message.send({
                channel: "whatsapp",
                source: fromPhoneNumber,
                destination: message.mobile,
                'src.name': appName,
                message: {
                    isHSM: "false",
                    type: "file",
                    caption: message.text,
                    filename: message.filename,
                    url: message.patient_report_url
                }
            }).then((response: any) => {
                LoggerUtil.log('debug', { message: 'Whatsapp message sent', location: 'whatsapp-util-gupshup => sendMessage', data: response });
                resolve(response);
            }).catch((err: any) => {
                LoggerUtil.log('error', { message: 'Error in sending sms', location: 'whatsapp-util-gupshup => sendMessage', error: err });
                reject(err);
            });
        });
    }
}