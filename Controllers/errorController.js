const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};

const sendErrorProd = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
    });
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
        sendErrorProd(err, res);
    }
};