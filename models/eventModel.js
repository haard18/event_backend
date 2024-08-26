const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define a subdocument for attendees
const attendeeSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    approvalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
});

const eventSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    organization: {
        type: String,
        required: true
    },
    hostedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    attendees: [attendeeSchema],  
    nfcUUID: {
        type: String,
        required: true
    },
    approvalNeeded: {
        type: Boolean,
        default: false
    },
    poapURL:{
        type: String,
        default: ''
    }
});

const eventModel = mongoose.model('event', eventSchema);
module.exports = eventModel;
