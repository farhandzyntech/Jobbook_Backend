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
    name:{ type: String },
    portfolio:{ type: String },
    resume:{ type: String },
    attatchment:{ type: String },
    details:{ type: String },
    coverLetter: { type: String },
    dateApplied: { type: Date, default: Date.now },
    status:{
        type: String,
        // enum: ['submitted','Approved', 'Shortlisted', 'Rejected'],
        enum: ['submitted', 'reviewing', 'accepted', 'rejected'],
        default: "submitted"
    },
    createdAt:{
      type: Date,
      default: Date.now
    }
})

module.exports = mongoose.model('Application', JobSchema);
