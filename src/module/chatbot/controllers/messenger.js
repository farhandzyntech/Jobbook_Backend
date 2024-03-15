const Message = require('../../../schemas/Message'); 
const Chat = require('../../../schemas/Chat');
const User = require('../../../schemas/User'); 
const Notification = require('../../../schemas/Notification');
const ErrorResponse = require('../../../utils/errorResponse');
const mongoose = require('mongoose');

exports.startOrGetChat = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const receiverId = req.body.receiverId;
    if(!userId || !receiverId) return next(new ErrorResponse('Receiver Id is required', 400))
    // Check if a chat already exists
    let chat = await Chat.findOne({ participants: { $in: [userId, receiverId] } });
    if (!chat) {
      // If chat doesn't exist, create a new one
      chat = new Chat({
        participants: [userId, receiverId]
      });
      await chat.save();
    }

    // const newMessage = new Message({chatId: chat.id, senderId: userId, receiverId, ...req.body});

    // Save the message to the database
    // await newMessage.save();
  
    res.json({ success: true, chat });
  }  catch (error) {
    console.error('ERROR', error);
    return next(error);
  }
};

exports.getMyChats = async (req, res, next) => {
  const userId = req.user.id; // This assumes that your authentication middleware correctly sets `req.user`

  try {
    // Fetch chats where the logged-in user is a participant
    const myChats = await Chat.find({
      participants: { $in: [(userId)] },
      deletedFor: { $ne: userId }
    })
    .populate('participants', 'firstName lastName email role phone photo ') // Adjust based on desired participant details
    .sort({ updatedAt: -1 }); // This sorts chats by the most recent

    res.json({
      success: true,
      chats: myChats
    });
  } catch (error) {
    console.error('ERROR', error);
    return next(error);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const { chatId, productId, senderId, receiverId, content, type } = req.body;

    // Create a new message or offer
    // const newMessage = new Message({
    //   chatId,
    //   productId,
    //   senderId,
    //   receiverId,
    //   content,
    //   type
    // });
    const newMessage = new Message(req.body);

    // Save the message to the database
    await newMessage.save();

    // TODO: Integrate WebSocket logic here to emit the message to connected clients
    // const io = req.app.get('io');
    // io.to(chatId).emit('receiveMessage', newMessage); // Emitting the message to the chat room

    // Send response
    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage
    });
  }  catch (error) {
    console.error('ERROR', error);
    return next(error);
  }
};

exports.getChatHistory = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    // Fetch all messages and offers for the chat
    const chatHistory = await Message.find({ chatId }).sort({ createdAt: 1 });

    // Send response
    res.status(200).json({
      success: true,
      message: 'Chat history fetched successfully',
      data: chatHistory
    });
  }  catch (error) {
    console.error('ERROR', error);
    return next(error);
  }
};

exports.updateMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { status } = req.body;

    // Update the message's status
    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { status, updatedAt: Date.now() },
      { new: true }
    );

    // TODO: Integrate WebSocket logic here to emit the message update to connected clients

    // Send response
    res.status(200).json({
      success: true,
      message: 'Offer status updated successfully',
      data: updatedMessage
    });
  }  catch (error) {
    console.error('ERROR', error);
    return next(error);
  }
};

exports.deleteChatHistory = async (req, res, next) => {
    try {     
      const { chatId } = req.params;
      const userId = req.user._id;

      const chat = await Chat.findById(chatId);
  
      // Check if the chat exists
      if (!chat) { return next(new ErrorResponse(`chat not exist`, 404)) }
      // Check if user is a participant of the chat
      if (!chat.participants.includes((userId))) {
        return next(new ErrorResponse(`User is not a participant of the chat`, 403))
      }
  
      // Add the user to the deletedFor array if not already present
      if (!chat.deletedFor.includes(userId)) {
        chat.deletedFor.push(userId);
        await chat.save();
      }
    
      res.status(200).json({ success: true, message: 'Chat and messages deleted successfully.' });
    }  catch (error) {
      console.error('ERROR', error);
      return next(error);
    }
}

// exports.getChatSessions = async (req, res, next) => {
//     try {
//       const { userId } = req.params;
      
//       // Fetch all chat sessions that the user is part of
//       const chatSessions = await Message.aggregate([
//         { $match: { $or: [{ senderId: userId }, { receiverId: userId }] } },
//         // { $group: { _id: "$chatId", lastMessage: { $last: "$$ROOT" } } },
//         { $sort: { "lastMessage.createdAt": -1 } }
//       ]);
  
//       // Send response with all chat sessions
//       res.status(200).json({
//         success: true,
//         message: 'Chat sessions fetched successfully',
//         data: chatSessions
//       });
//     }  catch (error) {
  //   console.error('ERROR', error);
  //   return next(error);
  // }
//   };
  
exports.notifications = async (req, res, next) => {
  try{
      const notification = await Notification.find({to: req.user.id});
      const unReadCount = await Notification.countDocuments({to: req.user.id, read: '0'}) 
      res.status(200).json({
          success: true,
          data: {
              unReadCount,
              notification
          }                                                       
      })
  } catch (error) {
      console.error(error);
      return next(error)
  }
}

exports.read = async (req, res, next) => {
  try{
      const notification = await Notification.updateMany({to: req.user.id}, { read: '1' });

      res.status(200).json({
          success: true,
          // data: notification                                                       
      })
  } catch (error) {
      console.error(error);
      return next(error)
  }
}