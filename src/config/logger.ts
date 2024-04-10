import path from 'path';
import * as fs from 'fs';
import * as winston from 'winston';

import config from './app-config';
import DailyRotateFile from 'winston-daily-rotate-file';

let rootPath = path.normalize(__dirname + '/..');
let logDir = rootPath + '/../../logs/'

// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

let logger = winston.createLogger({
    level: config.LOG_LEVEL,
    format: winston.format.json(),
    transports: [
        new DailyRotateFile({
            maxSize: '20m',
            maxFiles: '10d',
            datePattern: 'YYYY-MM-DD',
            filename: logDir + '/%DATE%.log'
        })
    ]
});

export default logger;