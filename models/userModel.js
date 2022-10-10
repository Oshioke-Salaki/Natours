const mongoose = require('mongoose');

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
    },
    role: {
        type: String,
        required: [true, 'This user has to have a role'],
    },
    active: {
        type: Boolean,
        required: true,
    },
    photo: {
        type: String,
    },
});

const User = mongoose.model('User', userSchema);

module.exports = User;