const mongoose = require('mongoose');

import App from './app';
import config from './config/app-config';
import CDNController from './controllers/cdn-ctrl';
import FAQController from './controllers/faq-ctrl';
import LogController from './controllers/log-ctrl';
import AuthController from './controllers/auth-ctrl';
import CrudController from './controllers/crud-ctrl';
import IntroController from './controllers/intro-ctrl';
import RoleController from './controllers/role-ctrl';
import CartController from './controllers/cart-ctrl';
import UserController from './controllers/user-ctrl';
import LoginController from './controllers/login-ctrl';
import OrderController from './controllers/order-ctrl';
import BannerController from './controllers/banner-ctrl';
import CouponController from './controllers/coupon-ctrl';
import VenderController from './controllers/vender-ctrl';
import SearchController from './controllers/search-ctrl';
import StatusController from './controllers/status-ctrl';
import ProductController from './controllers/product-ctrl';
import SummaryController from './controllers/summary-ctrl';
import AddressController from './controllers/address-ctrl';
import CategoryController from './controllers/category-ctrl';
import PaymentController from './controllers/payU-controller';
import wishlistController from './controllers/wishlist-cntrl';
import StatisticsController from './controllers/statistics-cntrl';
import BusinessController from './controllers/business-review-ctrl';
import RegistrationController from './controllers/registration-ctrl';
import ConfigurationController from './controllers/admin-config-ctrl';
const app = new App([
	new CDNController(),
	new FAQController(),
	new LogController(),
	new CrudController(),
	new RoleController(),
	new CartController(),
	new UserController(),
	new AuthController(),
	new LoginController(),
	new OrderController(),
	new IntroController(),
	new VenderController(),
	new SearchController(),
	new StatusController(),
	new CouponController(),
	new BannerController(),
	new ProductController(),
	new SummaryController(),
	new PaymentController(),
	new AddressController(),
	new BusinessController(),
	new CategoryController(),
	new wishlistController(),
	new StatisticsController(),
	new RegistrationController(),
	new ConfigurationController(),
]);

if (isValidEnvironment()) {
	/* 
        async() =>{} is immediately invoked async function expression 
        This is required for await
    */
	(async () => {
		// For Docker, postgresql may be starting in background, hence retry connection if failed
		let retries = 1;
		while (retries) {
			try {
				console.log('Trying connecting: ' + retries);
				mongoose.connect(config.DB_CONNECTION, {});
				break; // Stop loop if connection established
			} catch (error) {
				console.log(error);
			}

			await new Promise((resolve) => setTimeout(resolve, 2000));

			++retries;

			if (retries > 5) break;
		}
		// Logging middleware

		//cronUtil.init();
		app.listen();
	})();
} else {
	console.log('Invalid environment data');
}

function isValidEnvironment() {
	let valid: boolean = true;

	valid = valid && process.env.APP_NAME ? true : false;
	valid = valid && process.env.SERVER_PORT ? true : false;
	valid = valid && process.env.EMAIL_SERVICE ? true : false;
	valid = valid && process.env.SERVER_ROOT_URL ? true : false;

	return valid;
}
