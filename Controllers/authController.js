const crypto = require('crypto');
const { promisify } = require('util');
//jsonwebtoken is a npm package that allows us to perform authorization tasks
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

//This function creates a jwt token
const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const createSendToken = (user, statusCode, res) => {
    //Create the payload
    const token = signToken(user._id);

    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        //this ensures that the cookie wont be accessed or modified in any way by the browser
        httpOnly: true,
    };

    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    //A cookie is a small piece of text that a server can send to clients. the client stores it then automatically sends it back.
    res.cookie('jwt', token, cookieOptions);

    //Removes password from the output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user,
        },
    });
};

exports.signup = catchAsync(async(req, res, next) => {
    const newUser = await User.create(req.body);

    createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async(req, res, next) => {
    const { email, password } = req.body;
    ///////////////////////////////////////////////
    //1. Check if email and pasword were provided in the body
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

    createSendToken(user, 200, res);
});

exports.protect = catchAsync(async(req, res, next) => {
    //1. Getting the token and check if it exists
    //we declared token outside because we want it to be accessed globally
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    // console.log(token);

    if (!token) {
        return next(
            new AppError('You are not logged in! Please log in to get access', 401)
        );
    }
    //2. verification token
    //.verify reads the payload(the id) also needs the secret and a callback
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    console.log(decoded);

    //3. check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(
            new AppError('The user belonging to the token no longer exists', 401)
        );
    }
    //4. Check if user changed passwords after token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(
            new AppError('User recently changed password! Please log in again', 401)
        );
    }

    //Grant access to protected route
    req.user = currentUser;
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        //roles is an array ['admin', 'lead-guide'], roles= user

        if (!roles.includes(req.user.role)) {
            return next(
                new AppError('You do not have permission to perform this action', 403)
            );
        }

        next();
    };
};

exports.forgotPassword = catchAsync(async(req, res, next) => {
    //1. get user based on POSTED Email
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new AppError('There is no user with email address', 404));
    }

    //2. generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    //3. Send it to user email
    const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your passowrd, please ignore this emiail`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 min)',
            message,
        });

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email',
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(
            new AppError('There was an error sending the email. Try again later!'),
            500
        );
    }
});

exports.resetPassword = catchAsync(async(req, res, next) => {
    //1. Get user based on the token
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });
    //2. If token has not expired and there is a user, set the new passsword
    if (!user) {
        return next(new AppError('Token is invalid or expired', 400));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();
    //3. Update the changed passwor At property for the user

    //4. log the user in send jwt
    createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async(req, res, next) => {
    //1. get user from the collection
    const user = await User.findById(req.user.id).select('+password');
    //2. check is post password is correct
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError('Your current password is wrong', 404));
    }
    //3. If so, update the password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;

    await user.save();

    //4. log user in, send jwt
    createSendToken(user, 200, res);
});