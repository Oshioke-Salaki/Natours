const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 404);
};

const handleDuplicateFieldsDB = (err) => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    console.log(value);
    const message = `Duplicate field value ${value}. Please use another value`;

    return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
    //object.values is used to loop over objects
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;

    return new AppError(message, 400);
};

const handleJWTError = () =>
    new AppError('Invalid token, Please log in again', 401);

const handleJWTExpiredError = () => {
    new AppError('Your token has expired please login again', 401);
};
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};

const sendErrorProd = (err, res) => {
    //Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
        //Programming or other unknown error: dont leak error details
    } else {
        // 1) Log error
        console.error('ERROR', err);

        // 2) Send generate mesage
        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong',
        });
    }
};

//Global Error Handling middleware

//An error handling middleware accepts 4 parameter, the first is the error
module.exports = (err, req, res, next) => {
    //err.stack gives us exactly where an error occurs
    // console.log(err.stack);
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    //Here we determine the errors to be displayed for both production and development
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = {...err };
        if (error.name === 'CastError') {
            error = handleCastErrorDB(error);
        }
        if (error.code === 11000) {
            error = handleDuplicateFieldsDB(error);
        }

        if (err.name === 'validationError') {
            error = handleValidationErrorDB(error);
        }
        if (err.name === 'JsonWebTokenError') {
            error = handleJWTError();
        }

        if (err.name === 'TokenExpiredError') {
            error = handleJWTExpiredError();
        }
        sendErrorProd(error, res);
    }
};