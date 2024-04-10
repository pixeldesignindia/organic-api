var dotenv = require('dotenv');

// initialize configuration
dotenv.config();

export class ValidationUtil {
    isEmpty(str: string) {
        return str == null || str.toString().trim().length == 0;
    }
}