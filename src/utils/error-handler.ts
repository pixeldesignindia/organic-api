import express from 'express';

let errorHandler = (err: any, request: express.Request, response: express.Response, next: any) => {
    err.statusCode = err.statusCode || 500;

    response.status(err.statusCode).json({
        status: err.status,
        message: err.message
    });

    next();
};

export default errorHandler;