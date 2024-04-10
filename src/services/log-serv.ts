import constants from '../utils/constants';
import { FileUtil } from '../utils/file-util';

import { BaseService } from './base-serv';

export class LogService extends BaseService {
    private fileUtil: FileUtil;

    constructor() {
        super();

        this.fileUtil = new FileUtil();
    }

    async readLogs(params: any, headers: any = null) {
        return new Promise(async (resolve, reject) => {
            if (params.date) {
                let filePath: string = '';
                let logDirectory: string = constants.PATH.LOG_DIR;

                filePath += params.date + '.log';

                let logFilePath = logDirectory + filePath;

                if (!params.line_count)
                    params.line_count = 50;

                if (params.line_count > 1000)
                    params.line_count = 1000;

                if (this.fileUtil.checkIfFileExists(logFilePath)) {
                    let logs = await this.fileUtil.readLogFile(logFilePath, params.line_count);
                    logs = this.filterLogsByLevel(params.level, logs);
                    resolve({
                        data: logs
                    });
                } else {
                    resolve({
                        error: true,
                        message: 'Log file does not exist: ' + filePath
                    });
                }
            } else {
                resolve({
                    error: true,
                    message: 'Date not provided'
                });
            }
        });
    }

    filterLogsByLevel(level: string, logs: any) {
        if (level) {
            let resultLogs: any = [];

            logs.forEach((log: any) => {
                if (JSON.stringify(log).toLowerCase().indexOf(level.toLowerCase()) > -1) {
                    resultLogs.push(log);
                }
            });

            return resultLogs;
        } else {
            return logs;
        }
    }
}

