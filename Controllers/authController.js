//jsonwebtoken is a npm package that allows us to perform authorization tasks
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.signup = catchAsync(async(req, res, next) => {
    const newUser = await User.create(req.body);

    //Create the payload
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
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
    //Check if email and pasword actually exist
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }
    //check if user exist and if password is correct
    // here we find a document where email is equal to the email passed in the body. email: email

    //The .select('+password') is to include the password field in the output because it was originally not supposed to be outputted
    const user = await User.findOne({ email }).select('+password');

    console.log(user);

    //check if everything is ok, send token to client

    const token = '';
    res.status(200).json({
        status: 'success',
        token,
    });
});