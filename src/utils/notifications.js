const admin = require('firebase-admin');
const serviceAccount = require('../../privatekey.json');

// Assuming Notification is your Mongoose model for the notification schema
const Notification = require('../schemas/Notification'); 

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Enhanced function to send push notifications and save them in MongoDB
exports.sendPushNotification = async (obj) => {
    // console.log(obj.deviceTokens);
    // // Send push notification
    try {
        const message = {
            tokens: obj.deviceTokens,
            notification: {
              title: obj.title,
              body: obj.body,
            },
            android: {
              notification: {
                icon: 'stock_ticker_update',
                color: '#7e55c3'
              }
            },
            apns: {
              payload: {
                aps: {
                  badge: 1,
                },
              },
            },
            webpush: {
              headers: {
                Urgency: 'high'
              },
              notification: {
                icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQeWybXPQGfpw32XFxfvlfRCLLpgeW26VAwXA&usqp=CAU'
              }
            }
          };
        if(obj.deviceTokens && obj.deviceTokens.length > 0) {
            const response = await admin.app().messaging().sendEachForMulticast(message)
            console.log('Successfully sent message:', response);
        }

    //     // Save the notification in MongoDB after sending
        const savedNotification = new Notification({
            from: obj.fromUserId,
            to: obj.toUserId,
            job: obj.job,
            title: obj.title,
            message: obj.body, 
        });

        await savedNotification.save();
        console.log('Notification saved in MongoDB successfully');
    } catch (error) {
        console.error('Error sending message:', error);
    }
};