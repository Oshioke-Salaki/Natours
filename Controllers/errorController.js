//Global Error Handling middleware

//An error handling middleware accepts 4 parameter, the first is the error
module.exports = (err, req, res, next) => {
    //err.stack gives us exactly where an error occurs
    // console.log(err.stack);
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    res.status(err.statusCode).json({
        status: err.status,
        messagee: err.message,
    });
};