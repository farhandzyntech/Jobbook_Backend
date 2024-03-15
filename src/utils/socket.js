const Message = require('../schemas/Message'); 
const Notification = require('../schemas/Notification'); 
const notification = require('./notifications');
const initSocket = (server, corsOptions) => {
const io = require('socket.io')(server, { cors: corsOptions })

//--////////////////////////////////
let users = [];
const addUser = (userId, socketId) => {
  // Check if the user with the same userId and chatId is already in the array
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};
const removeUser = (socketId) => {
  // Remove the user based on socketId
  users = users.filter((user) => user.socketId !== socketId);
};
const getUser = (userId) => {
  // Find the user based on userId and chatId
  return users.find((user) => user.userId === userId);
};
// const getUser = (userId, chatId) => {
//   // Find the user based on userId and chatId
//   return users.find((user) => user.userId === userId && user.chatId === chatId);
// };
//--////////////////////////////////

  io.on('connection', (socket) => {
    console.log('User connected');
    // Listen for add user
    // socket.on('ADD_USER', async (userId) => {
    //   addUser(userId, socket.id);
    //   // // Load previous messages from MongoDB and send them to the client
    //   // const messages = await Message.find({ chatId: obj.chatId })
    //   // socket.emit('LOAD_MESSAGES', messages);
    //   socket.to(chatId).emit('LOAD_MESSAGES', messages);
    // });

    //when ceonnect
    //take userId and socketId from user
    socket.on("ADD_USER", (userId) => {
      addUser(userId, socket.id);
    });

    // Listen for new messages
    socket.on('SEND_MESSAGE', async (obj) => {
      try {
        console.log("SEND_MESSAGE", obj);
        //send new message
        const message = new Message(obj);
        await message.save();

        // Emit the message to the same chat room
        const user = await getUser(obj.receiverId);
        io.to(user.socketId).emit('RECEIVE_MESSAGE', message);
      } catch (error) {
        console.error(`Error: ${error}`);
        // Emit an error if there's an issue saving the message
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // //send and get message
    // socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    //   const user = getUser(receiverId);
    //   io.to(user.socketId).emit("getMessage", {
    //     senderId,
    //     text,
    //   });
    // });

    // New event to handle edit message
    socket.on('EDIT_MESSAGE', async (editedMessage) => {
      try {
        console.log("EDIT_MESSAGE", editedMessage);
        const { messageId, editedContent, status } = editedMessage;
        const existingMessage = await Message.findById(messageId);

        if (existingMessage) {
          // existingMessage.content = (editedContent) ? editedContent : existingMessage.content;
          existingMessage.status = status;
          await existingMessage.save();
          // Broadcast the edited message to all clients in the room
          // io.emit('MESSAGE_EDITED', existingMessage);
          io.to(existingMessage.chatId).emit('MESSAGE_EDITED', existingMessage);
        }
      } catch (error) {
        console.error(`Error editing message: ${error}`);
        socket.emit('error', { message: 'Failed to edit message' });
      }
    });

    // Listen for disconnect
    // socket.on('disconnect', () => {
    //   console.log('User disconnected');
    // });
      //when disconnect
      socket.on("disconnect", () => {
        console.log("a user disconnected!");
        removeUser(socket.id);
        io.emit("getUsers", users);
      });
  });
}

module.exports = {
  initSocket
}