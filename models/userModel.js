const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: Number,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    gender: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true

    },
    city: {
        type: String,
        required: true
    },
    events_attended: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'event',
        default: [],
    },
    events_hosted: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'event',
        default: [],
    }
}
)
const userModel = mongoose.model('user', userSchema);
module.exports = userModel;