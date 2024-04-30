const mongoose = require('mongoose');

import App from './app';
import config from './config/app-config';

import CDNController from './controllers/cdn-ctrl';
import LogController from './controllers/log-ctrl';
import CrudController from './controllers/crud-ctrl';
import RoleController from './controllers/role-ctrl';
import CartController from './controllers/cart-ctrl';
import UserController from './controllers/user-ctrl';
import LoginController from './controllers/login-ctrl';
import SearchController from './controllers/search-ctrl';
import StatusController from './controllers/status-ctrl';
import ProductController from './controllers/product-ctrl';
import SummaryController from './controllers/summary-ctrl';
import CategoryController from './controllers/category-ctrl';
import RegistrationController from './controllers/registration-ctrl';

const app = new App(
    [
        new CDNController(),
        new LogController(),
        new CrudController(),
        new RoleController(),
        new CartController(),
        new UserController(),
        new LoginController(),
        new SearchController(),
        new StatusController(),
        new ProductController(),
        new SummaryController(),
        new CategoryController(),
        new RegistrationController()
    ]
);

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
