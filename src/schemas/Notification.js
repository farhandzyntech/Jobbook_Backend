const mongoose = require('mongoose')
const { Schema } = mongoose

const NotificationSchema = new Schema({
    from: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        // required: true,
    },
    to: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    job: {
        type: mongoose.Schema.ObjectId,
        ref: 'Job',
        required: true,
    },
    type: {
        type: String, //e.g., 'jobApplication', 'jobAcceptance', 'jobRejection'
        required: false
    },
    title: {
        type: String, //e.g., 'jobApplication', 'jobAcceptance', 'jobRejection'
        required: true
    },
    message: {
        type: String,
        required: true
    },
    read: { 
        type: String, 
        enum: ['0','1'],
        default: "0"
    },
    status:{
        type: String,
        enum: ['0','1'],
        default: "1"
    },
},{ timestamps: true })

module.exports = mongoose.model('Notification', NotificationSchema);
