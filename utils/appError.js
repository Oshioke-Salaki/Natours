//here we want our class to inherit from the Error class
class AppError extends Error {
    constructor(message, statusCode) {
        //use super to call the parent constructor
        super(message);

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;