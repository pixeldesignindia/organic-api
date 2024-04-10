import logger from '../config/logger';

export class LoggerUtil {
    static log(level: string, data: any) {
        if (data && level) {
            data.time = new Date();

            if (data.error) {
                data.error = data.error.toString();
            }

            logger.log(level, data);
        }
    }
}