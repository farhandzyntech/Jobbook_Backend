const mongoose = require ('mongoose')
const { Schema } = mongoose

const CommentSchema = new Schema ({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    news : { type: mongoose.Schema.Types.ObjectId, ref: 'News' },
    forum : { type: mongoose.Schema.Types.ObjectId, ref: 'Forum' },
    content: { type: String, required: true },
    status:{ type: String, enum: ['0', '1'], default: "1" }
}, {timestamps: true});

module.exports = mongoose.model('Comment', CommentSchema)