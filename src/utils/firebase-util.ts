const firebase = require('firebase-admin');

import constants from "./constants";
import config from "../config/app-config";
import { LoggerUtil } from "./logger-util";

export class FirebaseUtil {
    firebaseApp: any;


    constructor() {

        this.setupFireBase();
    }

    public setupFireBase() {
        let serviceAccount = require(constants.PATH.PROFILES + "firebase/serviceAccountKey.json");

        // Your web app's Firebase configuration
        const firebaseConfig = {
            credential: firebase.credential.cert(serviceAccount),
            apiKey: config.FIREBASE.API_KEY,
            authDomain: config.FIREBASE.AUTH_DOMAIN,
            projectId: config.FIREBASE.PROJECT_ID,
            storageBucket: config.FIREBASE.STORAGE_BUCKET,
            messagingSenderId: config.FIREBASE.MESSAGING_SENDER_ID,
            appId: config.FIREBASE.APP_ID
        };

        // Initialize Firebase
        if (firebase.apps.length === 0) {
            this.firebaseApp = firebase.initializeApp(firebaseConfig);
        } else {
            this.firebaseApp = firebase.apps[0];
        }
    }

    //function to upload file
    async uploadFile(fileName: string, filePath: string) {
        let bucketName = config.FIREBASE.BUCKET_NAME;

        //get your bucket
        let bucket = this.firebaseApp.storage().bucket(bucketName);

        await bucket.upload(filePath, {
            gzip: true,
            destination: fileName,
            metadata: {
                cacheControl: 'public, max-age=31536000'
            }
        });

        LoggerUtil.log('debug', { message: `${fileName} uploaded to bucket.`, location: 'firebase-util => uploadFile' });
        return Promise.resolve();
    }

    async downloadFile(srcFileName: string, destFileName: string) {
        let bucketName = config.FIREBASE.BUCKET_NAME;

        const options = {
            destination: destFileName
        };

        let bucket = this.firebaseApp.storage().bucket(bucketName);

        // Downloads the file
        await bucket.file(srcFileName).download(options);

        LoggerUtil.log('error', { message: `gs://${bucketName}/${srcFileName} downloaded to ${destFileName}.`, location: 'firebase-util => downloadFile' });
        return Promise.resolve();
    }

    async pushMessage(token: string, title: string, body: string) {
        return new Promise((resolve, reject) => {
            const data = {
                notification: {
                    body: body,
                    title: title
                }
            };

            // Send a message to the device corresponding to the provided
            // registration token.
            this.firebaseApp.messaging().sendToDevice(token, data).then((response: any) => {
                // Response is a message ID string.
                LoggerUtil.log('error', { message: body, location: 'firebase-util => pushMessage' });
                resolve({
                    success: true,
                    message: response
                });
            }).catch((error: any) => {
                LoggerUtil.log('error', { message: 'Error sending push notification', location: 'firebase-util => pushmessage' });
                resolve({
                    error: error,
                    success: false
                });
            });
        });
    }
}