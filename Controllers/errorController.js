//Global Error Handling middleware

//An error handling middleware accepts 4 parameter, the first is the error
module.exports = (err, req, res, next) => {
    //err.stack gives us exactly where an error occurs
    // console.log(err.stack);
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack,
        });
    } else if (process.env.NODE_ENV === 'production') {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }
};