const mongoose = require('mongoose')
const { Schema } = mongoose

const JobSchema = new Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    job: {
        type: mongoose.Schema.ObjectId,
        ref: 'Job',
        required: true
    },
    status:{
        type: String,
        enum: ['Pending','Approved', 'Shortlisted', 'Rejected'],
        default: "Pending"
    },
    createdAt:{
      type: Date,
      default: Date.now
    }
})

module.exports = mongoose.model('Request', JobSchema);
