const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'This user has to have a name'],
        unique: [true, 'A user name has to be unique'],
    },
    email: {
        type: String,
        required: [true, 'This user has to have an email'],
        unique: [true, 'A user email has to be unique'],
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email'],
    },
    photo: {
        type: String,
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
    },
    role: {
        type: String,
        required: [true, 'This user has to have a role'],
    },
    active: {
        type: Boolean,
        required: true,
    },
});

const User = mongoose.model('User', userSchema);

module.exports = User;