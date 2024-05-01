import cors from 'cors';
import path from "path";
import helmet from 'helmet';
import express from 'express';
import * as bodyParser from 'body-parser';
const rateLimit = require('express-rate-limit');

const socketIO = require('socket.io');

import config from './config/app-config';
import { JwtUtil } from './utils/jwt-util';
import { LoggerUtil } from './utils/logger-util';

import errorHandler from './utils/error-handler';
import BaseController from './controllers/base-ctrl';

class App {
    private jwtUtil: JwtUtil;

    public app: express.Application;

    constructor(controllers: any) {
        this.app = express();

        this.jwtUtil = new JwtUtil();

        this.initializeMiddlewares();
        this.initializeJwtVerification();

        this.app.use(errorHandler);

        this.initializeControllers(controllers);

        process.on('unhandledRejection', error => {
            LoggerUtil.log('error', { message: 'Unhandled rejection', location: 'app => constructor', error: error.toString() });
        }).on('uncaughtException', error => {
            LoggerUtil.log('error', { message: 'Unhandled exception', location: 'app => constructor', error: error.toString() });
        });
    }

    public listen() {
        const { SERVER_PORT = 8000 } = process.env;
        const { SERVER_ROOT_URL =`http://localhost:${SERVER_PORT}` } = process.env;

        const server = this.app.listen(SERVER_PORT, () => {
            console.log(`Server is running at ${SERVER_ROOT_URL}...`);
            LoggerUtil.log('debug', { message: `Server is running at ${SERVER_ROOT_URL}...`, location: 'app => listen' });
        });

        const io = socketIO(server, {
            cors: {
                origins: '*'
            }
        });

        io.on('connection', (socket: any) => {
            // user connected
            LoggerUtil.log('debug', { message: 'Socket connection received', location: 'app => listen' });

            socket.on('message', (message: any) => {
                LoggerUtil.log('debug', { message: 'Socket message received', location: 'app => listen' });
                io.emit('message', message);
            });

            socket.on('connect_error', (error: any) => {
                LoggerUtil.log('error', { message: 'Error in socket connection', location: 'app.ts => listen', error: error });
            });
        });

        io.on('disconnect', () => {
            LoggerUtil.log('debug', { message: 'User disconnected', location: 'app => listen' });
        });
    }

    /**
     * @function initializeMiddlewares
     * @description Initializes all middlewares
     */
    public initializeMiddlewares() {
        /**
         * Allow cors requests from white listed urls
         */
        this.app.use(cors())

        // Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
        // see https://expressjs.com/en/guide/behind-proxies.html
        this.app.set('trust proxy', 1);

        this.app.use((request: express.Request, response: express.Response, next: any) => {
            response.setHeader('Access-Control-Allow-Methods', '*');
            response.setHeader('Access-Control-Allow-Headers', 'DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,authToken,loggedusertype,loggeduserid,clinicid');
            next();
        });

        this.app.use(helmet());

        // Apply rate limiter middleware
        const limiter = rateLimit({
            windowMs: config.RATE_LIMIT.MAX_REQUEST_INTERVAL, // in minutes
            max: config.RATE_LIMIT.MAX_REQUEST_COUNT, // Requests per request interval
            message: 'Too many requests from this IP, please try again after a minute.',
        });

        this.app.use('/api', limiter);

        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(bodyParser.json({ limit: '50mb' }));
        this.app.use(express.static(__dirname + '/public'));
        this.app.use('/api/static', express.static(__dirname + '/public/static'));

        this.app.use((request: express.Request, response: express.Response, next: any) => {
            request.body.startTime = new Date();
            next();
        });
        

        // Configure Express to use EJS
        this.app.set("views", path.join(__dirname, "views"));
        this.app.set("view engine", "ejs");
    }

    /**
     * @function initializeJwtVerification
     * @description Adds jwt verification on apis
     */
    public initializeJwtVerification() {
        let urlsToIgnore = [
					'cdn',
					'role',
					'login',
					'search',
					'status',
					'verify',
					'register',
					'category',
					'product',
                    'product/filter',
					'forgot-password',
					'product/comments',
					'product/has-liked',
					'product/has-bookmarked',
				];

        this.app.use((req, res, next) => {
            if ((req.url.indexOf('/api/v1/') > -1)) {
                let urlToCheck = null;

                if (req.url.indexOf('/api/v1/') > -1)
                    urlToCheck = req.url.split('/api/v1/')[1];

                if (this.ignoreUrl(urlToCheck, urlsToIgnore)) {
                    next();
                }
                 else {
                    if (req.headers && req.headers.authorization) {
                        let token: string = req.headers.authorization;

                        this.jwtUtil.verifyJWTToken(token).then((result: any) => {
                            if (result && result.valid) {
                                req.headers.loggeduserid = result.id;
                                next();
                            } else
                                return res.status(401).json({ message: 'Unauthorized' });
                        });
                    } else {
                        return res.status(401).json({ message: 'Unauthorized' });
                    }
                }
            } else {
                next();
            }
        });
    }

    ignoreUrl(urlToIgnore: string, urlsToIgnore: any[]) {
        let ignore = false;

        urlsToIgnore.forEach(url => {
            if (urlToIgnore.indexOf(url) > -1) {
                ignore = true;
            }
        });

        return ignore;
    }

    /**
     * @function initializeControllers
     * @description Initializes all routes
     * @param controllers 
     */
    public initializeControllers(controllers: BaseController[]) {
        let that = this;

        controllers.forEach((controller) => {
            that.app.use('/', controller.router);
        });
    }
}

export default App;