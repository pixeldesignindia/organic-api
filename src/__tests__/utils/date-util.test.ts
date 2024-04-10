import { DateUtil } from '../../utils/date-util';

describe("Date Util Tests", () => {
    test("Change date time format", () => {
        let dateUtil: DateUtil = new DateUtil();

        let result = dateUtil.changeToStandardDateTimeFormat("1/1/2023 12:20:30");
        expect(result).toBe("2023-01-01 12:20:30");
    });

    test("Change date format", () => {
        let dateUtil: DateUtil = new DateUtil();

        let result = dateUtil.changeToStandardDateTimeFormat("2023-1-1", true);
        expect(result).toBe("2023-01-01");
    });

    test("Add padding to date", () => {
        let dateUtil: DateUtil = new DateUtil();

        let result = dateUtil.changeToStandardDateTimeFormat("2023-1-1", true);
        expect(result).toBe("2023-01-01");
    });
});