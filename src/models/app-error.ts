export class AppError {
	detail: any;
	status: string;
	message: string;
	httpStatusCode: number;

	constructor(message: string, detail: any, httpStatusCode: number) {
	    this.detail = detail;
		this.message = message;
		this.httpStatusCode = httpStatusCode;
		this.detail = detail != null ? detail.toString() : 'No detail';

		this.status = `${httpStatusCode}`.startsWith('4') ? 'fail' : 'error';
	}
	
}
