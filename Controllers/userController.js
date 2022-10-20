const User = require('../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    //Object.keys create an array out of the kets of an object
    Object.keys(obj).forEach((el) => {
        if (allowedFields.includes(el)) {
            newObj[el] = obj[el];
        }
    });

    return newObj;
};

//status(500) - Internal server error
exports.getAllUsers = catchAsync(async(req, res, next) => {
    const users = await User.find();
    await res.status(200).json({
        status: 'success',
        data: {
            users,
        },
    });
});

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route has not yet benn implemented',
    });
};

exports.updateMe = catchAsync(async(req, res, next) => {
    //1. create error is user post password date
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError(
                'This route is not for password updates please use /updateMyPassword',
                400
            )
        );
    }
    //2. Filterout feild names that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'name', 'email', 'date');
    //3. update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser,
        },
    });
});

exports.getUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route has not yet benn implemented',
    });
};

exports.UpdateUser = catchAsync(async(req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!user) {
        return next(new AppError('No user found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            user,
        },
    });
});

exports.deleteUser = async(req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.status(204).json({
        status: 'error',
        message: 'deleted user',
    });
};