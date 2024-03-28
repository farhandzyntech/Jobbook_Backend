const mongoose = require('mongoose')
const { Schema } = mongoose

const NewsSchema = new Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    location: { type: String },
    picture: { type: String },
    // photos: [{ type: String }],
    tags: { type: String },
    status:{
        type: String,
        enum: ['0', '1'],
        default: "1"
    }
},{ toJSON: { virtuals: true }}, { timestamps: true })

// // Reverse populate with virtuals
NewsSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'news',
  count: true // And only get the number of docs
//   justOne: false
});


module.exports = mongoose.model('News', NewsSchema);
