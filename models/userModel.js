const mongoose = require('mongoose');
const validator = require('validator');
//bcrypt is used for hashing passwords on save
const bcrypt = require('bcryptjs');

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
        validate: {
            //the validator key has a function that either returns true or false
            //this refers to the mongoose schema object
            //this only works on create or save
            validator: function(el) {
                return el === this.password;
            },
            message: 'Passwords are not the same',
        },
    },
    // role: {
    //     type: String,
    //     required: [true, 'This user has to have a role'],
    // },
    // active: {
    //     type: Boolean,
    //     required: true,
    // },
});

userSchema.pre('save', async function(next) {
    //We only want to run this function if the password has been modified
    if (!this.isModified('password')) return next();

    //the second parameter in the hash method is the cost parameter. The defualt is 10. A higher number IS A MEASURE of how CPU intensive the operation will be and the better the password will be encrypted
    //this is the asynchrounous version and it returns a promise.

    this.password = await bcrypt.hash(this.password, 12);

    //We dont need confirm password to be persisted to the database so we set it to undefined
    this.passwordConfirm = undefined;

    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;