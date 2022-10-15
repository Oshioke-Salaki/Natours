const User = require('../models/userModel');
const catchAsync = require('./../utils/catchAsync');
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