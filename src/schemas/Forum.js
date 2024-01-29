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
},{ timestamps: true })

module.exports = mongoose.model('Forum', ForumSchema);
