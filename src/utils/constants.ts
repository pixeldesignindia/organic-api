import * as path from 'path';

var dotenv = require('dotenv');

// initialize configuration
dotenv.config();

let rootPath = path.normalize(__dirname + '/..');

let publicPath = rootPath + '/public/';

const constants: any = {
	APP_NAME: process.env.APP_NAME ? process.env.APP_NAME : null,
	SERVER_ROOT_URL: process.env.SERVER_ROOT_URL ? process.env.SERVER_ROOT_URL : null,

	SEARCH_PAST_DAYS: 7,
	MAX_PAGED_RECORDS_TO_LOAD: 10,
	AWS_LINK_EXPIRY_MINUTES: 60 * 20, // URL expires in 20 minutes
	PASSWORD_EXPIRY_TIME_HOUR: 1 * 3600000, // 1 hour

	TIMEZONE: 'UTC',
	DATE_FORMAT: 'yyyy-mm-dd',
	DATE_TIME_FORMAT: 'yyyy-mm-dd HH:mm:ss',

	APPLICATION_EXCEPTION_MESSAGE: 'Exception occured in application',

	API: {
		V1: '/api/v1',

		APP: {
			CDN: '/cdn',
			LOG: '/log',
			FAQ: '/faq',
			ROLE: '/role',
			INTRO:'/intro',
			AUTH: '/auth',
			USER: '/user',
			CART: '/cart',
			ORDER: '/order',
			LOGIN: '/login',
			BANNER:"/banner",
			CONFIG: '/config',
			SEARCH: '/search',
			STATUS: '/status',
			COUPON:	'/coupon',
			VENDER:	'/vendor',
			PAYMENT:'/payment',
			ADDRESS: '/address',
			BUSINESS:'/business',
			PRODUCT: '/product',
			SUMMARY: '/summary',
			CATEGORY: '/category',
			WISHLIST: '/wishlist',
			REGISTER: '/register',
			STATISTICS: '/statistics',
			RESET_PASSWORD: '/reset-password',
			FORGOT_PASSWORD: '/forgot-password',
			VERIFY_FORGOT_PASSWORD: '/verify-forgot-password',
		},
	},

	DEFAULTS: {
		TOUR_IMAGE: 'default.jpg',
		USER_IMAGE: 'default.jpg',
	},

	EMAIL: {
		SUBJECT: '',
		SERVICE_MAILGUN: 'MailGun',
		SERVICE_SENDGRID: 'SendGrid',
	},

	FILES: {
		APP_CONFIG: rootPath + 'config/app-config',
	},

	MESSAGES: {
		ERRORS: {
			NOT_FOUND: 'Not found',
			READ_RECORD: 'Cannot read',
			ALREADY_EXIST: 'Already exists',
			CREATE_RECORD: 'Cannot create',
			UPDATE_RECORD: 'Cannot update',
			CANNOT_SEND_SMS: 'Cannot send sms',
			INVALID_PATIENT: 'Invalid patient',
			INVALID_REQUEST: 'Invalid request',
			STATE_NOT_FOUND: 'State not found',
			CANNOT_STORE_PDF: 'Cannot store PDF',
			INVALID_TOKEN_URL: 'Invalid token url',
			NO_FILE_UPLOADED: 'No file(s) uploaded',
			OLD_PASSWORD_MISMATCH: 'Invalid old password',
			NO_FCM_TOKEN: 'FCM token not found for doctor',
			FOLLOWED_USER_NOT_FOUND: 'Followed user not found',
			FOLLOWING_USER_NOT_FOUND: 'Following user not found',
			DOCTOR_ALREADY_AVAILABLE: 'Doctor is already available',
			CANNOT_STORE_RAPID_TEST_IMAGE: 'Cannot store rapid test image',
			FOLLOWER_DATA_ERROR: 'Either follower or followed already exist',
			INVALID_EXTERNAL_INTEGRATION_RESPONSE_URL: 'Invalid response url',
		},

		LOGIN: {
			INACTIVE: 'Account inactive',
			INVALID: 'Invalid credentials',
		},

		INVALID_LOGIN: 'Invalid login',
		USER_NOT_FOUND: 'User not found',
		RECORD_CREATED: 'Record created',
		RECORD_DELETED: 'Record deleted',
		RECORD_UPDATED: 'Record updated',
		VERIFICATION_FAILED: 'Wrong OTP',
		INVALID_REQUEST: 'Invalid request',
		DATA_NOT_PROVIDED: 'Data not provided',
		PATIENT_NOT_FOUND: 'Patient not found',
		DUPLICATE_USER_EMAIL: 'Duplicate email',
		DUPLICATE_USER_PHONE: 'Duplicate phone',
		VERIFIED: 'You have been successfully logged in',
		CANNOT_CHECK_USER_LOGIN: 'Cannot check user login',
		OTP: 'Your otp has been sent to your mobile number',
		NO_EMAIL_PROVIDER_CONFIGURED: 'No email provider configured',
		INVALID_RESET_TOKEN: 'Password reset token is invalid or has expired.',
		FORGOT_PASSWORD_EMAIL_FAILED: 'Error in sending forgot password email',
		FORGOT_PASSWORD_EMAIL_SENT: 'We sent you an email to reset your password',
	},

	SUBJECTS: {
		FORGOT_PASSWORD: 'Your password reset link',
	},

	TEMPLATES: {
		WELCOME_EMAIL: 'welcome-email.ejs',
		FORGOT_PASSWORD: 'forgot-password.ejs',
	},

	// all folders are outside the server root directory

	PATH: {
		PUBLIC: publicPath,
		LOG_DIR: rootPath + '/../../logs/',
		PROFILES: rootPath + '/../../profiles/',
		IMAGES: {
			USER: 'static/images/user',
			SIGNATURE: 'static/images/signature',
		},
		CDN: {
			DEFAULT: 'cdn/default/',
			APP_LOGO: 'cdn/app-logo/',
			USER_IMAGE: 'cdn/user-image/',
		},
	},

	RESPONSE_CODES: {
		/* All error codes starts with 9 */
		ERROR_PASSWORD_VALIDATE: 9001,
		ERROR_READING_APP_CONFIGURATION: 9002,
	},

	ROLES: {
		ADMINISTRATOR: {
			ID: 1,
			NAME: 'ADMINISTRATOR',
		},
		CUSTOMER: {
			ID: 2,
			NAME: 'CUSTOMER',
		},
		USER: {
			ID: 3,
			NAME: 'USER',
		},
		GUEST: {
			ID: 4,
			NAME: 'Guest',
		},
		VENDER: {
			ID: 4,
			NAME: 'Vender',
		},
	},

	USER_TYPES: {
		USER: 'User',
		GUEST: 'Guest',
		VENDER: 'Vendor',
		CUSTOMER: 'Customer',
		ADMINISTRATOR: 'Administrator',
	},

	MODULES: {
		ROLES: 'Roles',
		USERS: 'Users',
		MANAGE: 'Manage',
		DASHBOARD: 'Dashboard',
		CUSTOMERS: 'Customers',
	},

	HTTP_STATUS: {
		OK: 200,
		UPDATED: 204,
		NOT_FOUND: 404,
		BAD_REQUEST: 400,
		INTERNAL_SERVER_ERROR: 500,
	},
};

export default constants;