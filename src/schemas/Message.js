const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Chat'
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  content: {
    type: String,
    // required: true
  },
  amount: {
    type: String,
    // required: true
  },
  type: {
    type: String,
    // required: true,
    enum: ['message'],
    default: 'message'
  },
  status: {
    type: String,
    enum: ['0', '1'],
    default: '1'
  },
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
