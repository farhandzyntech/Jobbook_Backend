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
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Like' }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
},{ timestamps: true })

module.exports = mongoose.model('News', NewsSchema);
