const mongoose = require('mongoose')
const { Schema } = mongoose

const SaveSchema = new Schema({
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
        enum: ['0','1'],
        default: "1"
    },
    createdAt:{
      type: Date,
      default: Date.now
    }
})

module.exports = mongoose.model('Saved', SaveSchema);
