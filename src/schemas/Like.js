const mongoose = require ('mongoose')
const { Schema } = mongoose

const LikeSchema = new Schema ({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    newsId: {type: mongoose.Schema.Types.ObjectId, ref: 'News', reuired: true},
    status:{ type: String, enum: ['0', '1'], default: "1" }
}, {timestamps: true})