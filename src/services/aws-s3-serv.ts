import { Readable } from "stream";
import { writeFileSync } from "fs";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
const { fromIni } = require("@aws-sdk/credential-provider-ini");

import config from '../config/app-config';
import constants from '../utils/constants';
import { LoggerUtil } from '../utils/logger-util';

const credentials = fromIni({ profile: config.AWS.PROFILE_NAME });

// Configure the AWS region
const s3Client = new S3Client({
    credentials: credentials,
    region: config.AWS.S3_REGION
});

export default class AwsS3Service {
    constructor() {
    }

    // Method to upload a file to S3
    async uploadFile(fileKey: string, fileContent: any, bucketName: string) {
        const params: any = {
					Bucket: bucketName,
					Key: fileKey,
					Body: fileContent,
					ContentEncoding: 'base64',
					ContentType: 'image/jpeg',
				};

        try {
            const data = await new Upload({
                params: params,
                client: s3Client
            }).done();

            LoggerUtil.log('info', { message: `File uploaded successfully at ${data.Location}` });
            return data;
        } catch (err) {
            LoggerUtil.log('info', { message: `Error in uploading file`, error: err });
            return Promise.reject({
                error: true,
                message: err
            });
        }
    }

    // Method to download a file from S3
    async downloadFile(fileKey: string, downloadPath: string, bucketName: string): Promise<void> {
        const params: any = {
            Key: fileKey,
            Bucket: bucketName
        };

        try {
            const { Body } = await s3Client.send(new GetObjectCommand(params));
            const bodyStream = Body as Readable;

            const bodyContents = await new Promise<Buffer>((resolve, reject) => {
                const chunks: Buffer[] = [];
                bodyStream.on("data", (chunk) => chunks.push(chunk as Buffer));
                bodyStream.on("end", () => resolve(Buffer.concat(chunks)));
                bodyStream.on("error", reject);
            });

            writeFileSync(downloadPath, bodyContents);
            LoggerUtil.log('info', { message: `File uploaded successfully at ${downloadPath}` });
        } catch (err) {
            LoggerUtil.log('info', { message: `Error in downloading file`, error: err });
            return Promise.reject({
                error: true,
                message: err.toString()
            });
        }
    }

    async getImage(data: any, headers: any) {
        // Create a command to get the object
        const params: any = {
            Bucket: data.bucketName,
            Key: `${data.folder}/${data.file}`,
        };

        const command = new GetObjectCommand(params);

        try {
            // Generate the signed URL for the getObject operation
            const signedUrl = await getSignedUrl(s3Client, command, {
                expiresIn: constants.AWS_LINK_EXPIRY_MINUTES * 60, // ExpiresIn is in seconds
            });

            return signedUrl;
        } catch (err) {
            LoggerUtil.log('info', { message: `Error in getting signed image URL`, error: err });
            return null;
        }
    }
}