const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    username: {
        type: String, // SchemaTypes.String,
        required: true,
        unique: true
    },
    birthday: {
        type: Date,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String, // SchemaTypes.String,
        required: true,
        minlength: 12
    },
    isMember: {
        type: Boolean,
        default: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);