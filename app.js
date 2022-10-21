//import core modules
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./Controllers/errorController');
const tourRouter = require('./Routes/tourRoutes');
const userRouter = require('./Routes/userRoutes');

const app = express();
console.log(process.env.NODE_ENV);

//Global Middlewares (Used for all routes)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('dev'));
}

const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, Please tryagain in an hour!',
});

//this applies to all our routes that start with '/api'
app.use('/api', limiter);

app.use(express.json());
//middleware to load static files in our browser
app.use(express.static(`${__dirname}/public`));

//creating a middleware
// app.use((req, res, next) => {
//     console.log('Hello from the middleware');
//     next();
// });

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    // console.log(req.headers);
    next();
});

//middlewares for mounting our routes (middlewares for specifically defined routes)
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);

//app.all runs for all the http methods
app.all('*', (req, res, next) => {
    //You can only pass error into the next() function
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

//Global Error Handling middleware
app.use(globalErrorHandler);

module.exports = app;