import path from 'path';
import dotenv from 'dotenv';

// initialize configuration
dotenv.config();

let rootPath = path.normalize(__dirname + '/..');

const config: any = {
    root: rootPath,
    port: process.env.PORT || 3000,
    ENV_NAME: process.env.ENV_NAME,
    TIME_ZONE: process.env.TIME_ZONE,
    DOMAIN_URL: process.env.DOMAIN_URL || null,
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    SERVER_ROOT_URL: process.env.SERVER_ROOT_URL,
    WHITE_LISTED_URLS: process.env.WHITE_LISTED_URLS,
    JWT_EXPIRY_SECONDS: parseInt(process.env.JWT_EXPIRY_SECONDS),
    JWT_REFRESH_EXPIRY_TIME: process.env.JWT_REFRESH_EXPIRY_TIME,
    ALLOW_CRON: process.env.ALLOW_CRON ? process.env.ALLOW_CRON : false,
    DEFAULT_USER_PASSWORD: process.env.DEFAULT_USER_PASSWORD ? process.env.DEFAULT_USER_PASSWORD : '12345',
    IS_EXCEPTION_EMAIL_ENABLED: process.env.IS_EXCEPTION_EMAIL_ENABLED ? process.env.IS_EXCEPTION_EMAIL_ENABLED : false,
    DB_CONNECTION: process.env.DB_CONNECTION,
    SERVER_KEYS: {
        SERVER_SECRET: process.env.SERVER_SECRET,
        REFRESH_SERVER_SECRET: process.env.REFRESH_SERVER_SECRET
    },
    EMAIL: {
        EMAIL_SERVICE: process.env.EMAIL_SERVICE,
        THANKS_MESSAGE: process.env.THANKS_MESSAGE_EMAIL,

        MAILGUN: {
            DOMAIN: process.env.MAILGUN_DOMAIN,
            API_KEY: process.env.MAILGUN_API_KEY,
        },
        SENDGRID: {
            API_KEY: process.env.SENDGRID_API_KEY,
        },
        FROM_EMAIL: process.env.EMAIL_FROM_NAME,
        EXCEPTION_FROM_EMAIL: process.env.EXCEPTION_FROM_EMAIL,
        EXCEPTION_NOTIFICATION_EMAIL: process.env.EXCEPTION_NOTIFICATION_EMAIL,
    },
    SMS: {
        SERVICE_TYPE: process.env.SMS_SERVICE_TYPE,      // api, twilio
        THANKS_MESSAGE: process.env.THANKS_MESSAGE_SMS,
        IS_DISABLED_FOR_REPORT: process.env.SMS_IS_DISABLED_FOR_REPORT ? process.env.SMS_IS_DISABLED_FOR_REPORT : false,

        API: {
            KEY: process.env.SMS_KEY,
            URL: process.env.SMS_API_URL,
            SENDER_NAME: process.env.SENDER_NAME
        },

        TWILIO: {
            SID: process.env.TWILIO_SID
        }
    },
    TWILIO: {
        API_KEY: process.env.TWILIO_API_KEY,
        API_SECRET: process.env.TWILIO_API_SECRET,
        AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
        ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID
    },
    WHATSAPP: {
        FROM_PHONE_NUMBER: process.env.WHATSAPP_FROM_PHONE_NUMBER,
        IS_DISABLED_FOR_REPORT: process.env.WHATSAPP_IS_DISABLED_FOR_REPORT ? process.env.WHATSAPP_IS_DISABLED_FOR_REPORT : false
    },
    GUPSHUP: {
        API_KEY: process.env.GUPSHUP_API_KEY,
        APP_NAME: process.env.GUPSHUP_WHATSAPP_APP_NAME,
        ROOT_PATH: process.env.GUPSHUP_WHATSAPP_ROOT_PATH,
        OPTIN_URL: process.env.GUPSHUP_WHATSAPP_OPTIN_URL,
    },
    FIREBASE: {
        API_KEY: process.env.API_KEY,
        APP_ID: process.env.FIREBASE_APP,
        PROJECT_ID: process.env.PROJECT_ID,
        AUTH_DOMAIN: process.env.AUTH_DOMAIN,
        BUCKET_NAME: process.env.BUCKET_NAME,
        STORAGE_BUCKET: process.env.STORAGE_BUCKET,
        MESSAGING_SENDER_ID: process.env.MESSAGING_SENDER_ID
    },
    RATE_LIMIT: {
        MAX_REQUEST_INTERVAL: process.env.MAX_REQUEST_INTERVAL ? parseInt(process.env.MAX_REQUEST_INTERVAL) : 60 * 1000,
        MAX_REQUEST_COUNT: process.env.MAX_REQUEST_COUNT ? parseInt(process.env.MAX_REQUEST_COUNT) : 200
    },
    PDF_LIBRARY: process.env.PDF_LIBRARY || 'html-pdf',
    AWS: {
        S3_REGION: process.env.AWS_S3_REGION || 'us-east-2',
        PROFILE_NAME: process.env.AWS_PROFILE_NAME || 'default',
    }
};

export default config;