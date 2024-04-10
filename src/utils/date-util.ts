import dotenv from 'dotenv';
import * as momentTz from 'moment-timezone';

import constants from '../utils/constants';

// initialize configuration
dotenv.config();

export class DateUtil {
    timezone: string;

    months: any = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    constructor() {
        this.timezone = process.env.TIMEZONE ? process.env.TIMEZONE : constants.TIMEZONE;
    }

    getCurrentDateTime() {
        return momentTz.tz(this.timezone).toDate();
    }

    getCurrentEpoch() {
        return Date.now();
    }

    formatDateTime(dateStr: string) {
        let date = new Date(dateStr);
        // return in format 01-Mar-2020 01:30 pm

        if (isNaN(date.getTime())) {
            throw new Error('Invalid datetime format');
        }

        const year = date.getFullYear();
        const month = this.months[date.getMonth()];
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');

        return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
    }

    changeToStandardDateTimeFormat(dateStr: string, onlyDate: boolean = false, forPdf: boolean = false) {
        if (dateStr.indexOf('/') > -1) {
            if (dateStr.indexOf('T') > -1) {
                // input => 2022-05-22T11:20:00
                // output => 2022-05-13 11:22
                let strDateTime = dateStr.split('T');

                let strDate = strDateTime[0].split('/');
                let strTime = strDateTime[1].split(':');

                let date = strDate[0] + '-' + strDate[1].padStart(2, '0') + '-' + strDate[2].padStart(2, '0');

                if (onlyDate) {
                    return date;
                } else {
                    let time = strTime[0].padStart(2, '0') + ':' + strTime[1].padStart(2, '0') + ':' + strTime[2].padStart(2, '0');
                    return date + ' ' + time;
                }
            } else if (dateStr.indexOf(' ') > -1) {
                // input => 05/22/2022 11:20:00
                // output => 2022-05-13 11:22
                let strDateTime = dateStr.split(' ');

                let strDate = strDateTime[0].split('/');
                let strTime = strDateTime[1].split(':');

                if (onlyDate) {
                    return strDate[2] + '-' + strDate[0].padStart(2, '0') + '-' + strDate[1].padStart(2, '0');
                } else {
                    if (forPdf) {
                        let date = strDate[1] + '-' + this.months[parseInt(strDate[0]) - 1] + '-' + strDate[2];
                        let time = this.pad(parseInt(strTime[0]) >= 12 ? parseInt(strTime[0]) - 12 : parseInt(strTime[0])) + ':' + this.pad(parseInt(strTime[1])) + ' ' + (parseInt(strTime[0]) >= 12 ? 'pm' : 'am');

                        return date + ' ' + time;
                    } else {
                        let date = strDate[2] + '-' + strDate[0] + '-' + strDate[1];

                        let time: string;
                        if (strTime[2]) {
                            time = strTime[0].padStart(2, '0') + ':' + strTime[1].padStart(2, '0') + ':' + strTime[2].padStart(2, '0');
                        } else {
                            time = strTime[0].padStart(2, '0') + ':' + strTime[1].padStart(2, '0') + ':00';
                        }

                        return date + ' ' + time;
                    }
                }
            } else {
                return dateStr;
            }
        } else if (dateStr.indexOf('-') > -1) {
            if (dateStr.indexOf('T') > -1) {
                // input => 2022-05-22T11:20:00
                // output => 2022-05-13 11:22:00
                let strDateTime = dateStr.split('T');

                let strDate = strDateTime[0].split('-');
                let strTime = strDateTime[1].split(':');

                let date = strDate[0] + '-' + strDate[1].padStart(2, '0') + '-' + strDate[2].padStart(2, '0');
                if (onlyDate) {
                    return date;
                } else {
                    let time = strTime[0].padStart(2, '0') + ':' + strTime[1].padStart(2, '0') + ':' + strTime[2].padStart(2, '0');
                    return date + ' ' + time;
                }
            } else {
                // Received yyyy-mm-dd, return padded date
                let strDate = dateStr.split('-');
                return strDate[0] + '-' + strDate[1].padStart(2, '0') + '-' + strDate[2].padStart(2, '0');
            }
        } else {
            return dateStr;
        }
    }

    convertDateToString(date: Date): any {
        return date.getFullYear() + '-' + (date.getMonth() + 1).toString().padStart(2, '0') + '-' + date.getDate().toString().padStart(2, '0');
    }

    getDateForPDF(date: Date): any {
        let day = date.getDate().toString().padStart(2, '0');
        let month = this.months[date.getMonth()];
        let year = date.getFullYear().toString().padStart(2, '0');

        let result = `${day}-${month}-${year}`;

        return result;
    }

    getDateTimeForPDF(date: Date): any {
        let day = date.getDate().toString().padStart(2, '0');
        let month = this.months[date.getMonth()];
        let year = date.getFullYear().toString().padStart(2, '0');

        let hour = date.getHours().toString().padStart(2, '0');
        let min = date.getMinutes().toString().padStart(2, '0');
        let sec = date.getSeconds().toString().padStart(2, '0');

        let result = `${day}-${month}-${year} ${hour}:${min}:${sec}`;

        return result;
    }

    pad(x: any) {
        return x.toString().padStart(2, '0')
    }
}