//jsonwebtoken is a npm package that allows us to perform authorization tasks
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

exports.signup = catchAsync(async(req, res, next) => {
    const newUser = await User.create(req.body);

    //Create the payload
    const token = signToken(newUser._id);
    //Alternative
    // User.create({
    //     name: req.body.name,
    //     email: req.body.email,
    //     password: req.body.password,
    //     passwordConfirm: req.body.passwordConfirm,
    // });

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser,
        },
    });
});

exports.login = catchAsync(async(req, res, next) => {
    const { email, password } = req.body;
    ///////////////////////////////////////////////
    //1. Check if email and pasword actually exist
    //////////////////////////////////////////////
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    /////////////////////////////////////////////////
    //2. check if user exist and if password is correct
    /////////////////////////////////////////////////
    // here we find a document where email is equal to the email passed in the body. email: email
    //The .select('+password') is to include the password field in the output because it was originally not supposed to be outputted
    const user = await User.findOne({ email }).select('+password');

    // const correct = await user.correctPassword(password, user.password);

    if (!user || !(await user.correctPassword(password, user.password))) {
        //Error 401: Unauthorized access
        return next(new AppError('Incorrect email or password', 401));
    }

    ////////////////////////////////////////////////////
    //3. check if everything is ok, send token to client
    /////////////////////////////////////////////////////

    const token = signToken(user._id);
    res.status(200).json({
        status: 'success',
        token,
    });
});