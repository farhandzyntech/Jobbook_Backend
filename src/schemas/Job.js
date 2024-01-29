const mongoose = require('mongoose')
const { Schema } = mongoose

const JobSchema = new Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['fulltime', 'contract', 'parttime', 'internship'],
        default: 'fulltime'
    },
    travel: { type: String },
    location: { type: String },
    salary: {
        type: String,
    },
    salaryMode: {
        type: String,
        required: true,
        enum: ['daily', 'weekly', 'monthly'],
        default: 'monthly'
    },
    speciality: { type: String },
    category: { type: String },
    title: { type: String },
    description: { type: String },
    experience: { type: String },
    picture: { type: String },
    // Users who have saved this job
    savedByUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', select: false }],
    // Users who have applied to this job
    appliedByUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', select: false }],
    status: {
        type: String,
        enum: ['Active', 'Closed', 'Expired'],
        default: "Active"
    }
},{ timestamps: true })

// Reverse populate with virtuals
JobSchema.virtual('applications', {
    ref: 'Application',
    localField: '_id',
    foreignField: 'Job',
    justOne: false,
  });

module.exports = mongoose.model('Job', JobSchema);
