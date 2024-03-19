const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messenger');
const { protect } = require('../../../middleware/auth');
// const upload = require('../middleware/uploadMiddleware');

//--//
let routes = function(){
let routes = express.Router({mergeParams: true});

// Route to create or get chat
routes.route('/create').post([protect], messageController.startOrGetChat);

// Route to fetch all chats 
routes.route('/getMyChats').get([protect], messageController.getMyChats);

// Route to send a new message or make an offer
routes.route('/messages/send').post(messageController.sendMessage);

// Route to retrieve the chat history for a specific chat session
routes.route('/history/:chatId').get(messageController.getChatHistory);
  
// Route to update the status of an offer
routes.route('/messages/update/:messageId').put(messageController.updateMessage);

// Route to delete the chat & history for a specific chat session
routes.route('/delete/:chatId').delete([protect], messageController.deleteChatHistory);

// Route to retrieve all chat sessions for a specific user
// routes.route('/messages/sessions/:userId').get(messageController.getChatSessions);

//--////////////////////////////////
// routes.route("/notifications").get([protect], messageController.notifications);
// routes.route("/readNotification").get([protect], messageController.read);
//--////////////////////////////////
return routes;
};
//--//
module.exports = routes;
