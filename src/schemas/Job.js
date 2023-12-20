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
    description: { type: String },
    picture: { type: String },
    status:{
        type: String,
        enum: ['Active', 'Closed', 'Expired'],
        default: "Active"
    },
    createdAt:{
      type: Date,
      default: Date.now
    }
})


// Reverse populate with virtuals
JobSchema.virtual('requests', {
    ref: 'Request',
    localField: '_id',
    foreignField: 'job',
    justOne: false
  });

module.exports = mongoose.model('Job', JobSchema);
