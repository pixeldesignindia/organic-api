import * as path from 'path';
import fs, { readFileSync, writeFileSync } from 'fs';

import { DateUtil } from './date-util';
import { LoggerUtil } from './logger-util';

export class FileUtil {
    private dateUtil: DateUtil;

    constructor() {
        this.dateUtil = new DateUtil();
    }

    public readFile(filePath: any, format: any = 'utf-8') {
        if (this.checkIfFileExists(filePath)) {
            return readFileSync(filePath, format);
        } else {
            return null;
        }
    }

    public writeFile(filePath: any, data: any, format: any = 'utf-8') {
        return writeFileSync(filePath, data, format);
    }

    public checkIfFileExists(filePath: string) {
        return fs.existsSync(filePath);
    }

    public async renameFile(oldFile: string, newFile: string) {
        return new Promise((resolve, reject) => {
            fs.rename(oldFile, newFile, (result: any) => {
                resolve(null);
            });
        });
    }

    public checkOrCreateDirectory(directoryPath: any) {
        let rootPath = path.normalize(__dirname + '/..');
        let publicPath = rootPath + '/public/';

        if (!fs.existsSync(publicPath)) {
            fs.mkdirSync(publicPath);
        }

        if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath);
        }
    }

    public uploadBase64Files(files: any, storagePath: string) {
        let result: any = [];

        return new Promise((resolve, reject) => {
            if (files && files.length > 0) {
                files.forEach(async (file: any) => {
                    file.file_name = this.cleanName(file.file_name);

                    let file_name = file.file_name;
                    let saved_file_name = this.dateUtil.getCurrentEpoch() + "_" + file_name;
                    let filePath = storagePath + '/' + saved_file_name;

                    let fileContent = Buffer.from(file.base64, 'base64');

                    try {
                        // write buffer to file
                        let err: any = writeFileSync(filePath, fileContent);

                        if (err) {
                            LoggerUtil.log('error', { message: 'Cannot write file', location: 'file-util => uploadBase64Files' });
                            reject(err);
                        } else {
                            result.push({
                                file_name: file_name,
                                saved_file_name: saved_file_name
                            });
                        }
                    } catch (writeErr) {
                        resolve(null);
                    }
                });

                resolve(result);
            } else {
                resolve(null);
            }
        });
    }

    cleanName(name: string) {
        name = name.replace(/-/g, '_');
        name = name.replace(/:/g, '_');

        return name;
    }

    public removeFile(storagePath: string, filePath: string) {
        filePath = storagePath + '/' + filePath;

        fs.unlink(filePath, (err) => {
            if (err) {
                LoggerUtil.log('error', { message: 'Cannot remove file', location: 'file-util => removeFile' });
            }

            return Promise.resolve();
        });
    }

    async readLogFile(logFilePath: string, lineCount: number) {
        return new Promise((resolve, reject) => {
            const fsR = require('fs-reverse');

            let jsonArray: any = [];
            const readStream = fsR(logFilePath, {});

            let count = 0;
            readStream.on('data', (line: string) => {
                if (count <= lineCount) {
                    if (line) { // have this check to make sure empty lines are not parsed
                        jsonArray.push(JSON.parse(line));
                    }
                }

                ++count;
            });

            readStream.on('end', () => { resolve(jsonArray); })
        });
    }
}