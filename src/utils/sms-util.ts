const https = require('https');
const fetch = require('node-fetch');

import config from '../config/app-config';
import { LoggerUtil } from './logger-util';

export class SmsUtil {


    public SmsUtil() {

    }

    public sendSms(phoneNumber: any, body: any, notificationConfig: any = null) {
        let smsApiKey;
        let smsSender;

        if (notificationConfig) {
            smsApiKey = notificationConfig.sms_key;
            smsSender = notificationConfig.sms_sender;
        } else {
            smsApiKey = config.SMS.API.KEY;
            smsSender = config.SMS.API.SENDER_NAME;
        }

        let smsUrl = config.SMS.API.URL;

        let logData = { url: smsUrl, phoneNumber: phoneNumber.slice(0, -6) + 'x'.repeat(6), body: body };
        LoggerUtil.log('debug', { message: 'Sending Whatsapp message sent', location: 'whatsapp-util-gupshup => sendMessage', data: logData });

        smsUrl += '/send?apikey=' + smsApiKey + '&sender=' + smsSender;
        smsUrl += '&numbers=' + phoneNumber + '&message=' + body;

        return this.sendSmsNow(smsUrl);
    }

    async getShortenedUrl(smsUrl: string) {
        return new Promise((resolve, reject) => {
            let apiKey = config.SMS.API.KEY;

            // Prepare data for POST request
            let data: any = `${'apikey'}=${encodeURIComponent(apiKey)}&${'url'}=${smsUrl}`;

            fetch('https://api.textlocal.in/create_shorturl/', {
                method: 'POST',
                body: data,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).then((res: any) => res.json())
                .then((json: any) => {
                    LoggerUtil.log('debug', { message: 'Shortened sms result', location: 'sms-util => getShortenedUrl', data: json });

                    if (json.status == 'success') {
                        resolve(json.shorturl);
                    } else {
                        resolve(null);
                    }
                })
                .catch((err: any) => {
                    LoggerUtil.log('error', { message: 'Cannot send sms', location: 'sms-util => getShortenedUrl', error: err });
                    resolve(null);
                });
        });
    }

    sendSmsNow(smsUrl: string) {
        return new Promise((resolve, reject) => {
            try {
                https.get(smsUrl, (response: any) => {
                    let data = '';

                    // A chunk of data has been recieved.
                    response.on('data', (chunk: any) => {
                        data += chunk;
                    });

                    // The whole response has been received. Print out the result.
                    response.on('end', () => {
                        try {
                            LoggerUtil.log('debug', { message: 'Sms sent successfully', location: 'sms-util => sendSmsNow' });
                            resolve(true);
                        } catch (error) {
                            LoggerUtil.log('error', { message: 'Error in sending sms', location: 'sms-util => sendSmsNow', data: error });
                            resolve(false);
                        }
                    });
                }).on('error', (error: any) => {
                    LoggerUtil.log('error', { message: 'Cannot send sms', location: 'sms-util => sendSmsNow', data: error });
                    resolve(false);
                });
            } catch (error) {
                LoggerUtil.log('error', { message: 'Error in sending sms', location: 'sms-util => sendSmsNow', data: error });
                resolve(false);
            }
        });
    }
}