const mongoose = require('mongoose')
const { Schema } = mongoose

const ForumSchema = new Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    status:{
        type: String,
        enum: ['0', '1'],
        default: "1"
    }
},{ toJSON: { virtuals: true }}, { timestamps: true })

// // Reverse populate with virtuals
ForumSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'forum',
  count: true // And only get the number of docs
//   justOne: false
});

module.exports = mongoose.model('Forum', ForumSchema);
