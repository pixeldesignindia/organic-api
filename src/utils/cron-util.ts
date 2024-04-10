var dotenv = require('dotenv');

// initialize configuration
dotenv.config();

export class CronUtil {
    constructor() {
    }
}

/*
   ┌──────────── minute
   │ ┌────────── hour
   │ │ ┌──────── day of month
   │ │ │ ┌────── month
   │ │ │ │ ┌──── day of week
   │ │ │ │ │
   │ │ │ │ │
   * * * * *
 */