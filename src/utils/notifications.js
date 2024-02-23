const admin = require('firebase-admin');
const serviceAccount = require('../../privatekey.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Function to send a push notification
// exports.sendPushNotification = (deviceToken, title, body) => {
sendPushNotification = (deviceToken, title, body) => {
    const message = {
        token: deviceToken,
        notification: {
          title: title,
          body: body,
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
  admin.app().messaging().send(message)
//   admin.messaging().send(deviceToken, payload)
    .then((response) => {
      console.log('Successfully sent message:', response);
    })
    .catch((error) => {
      console.log('Error sending message:', error);
    });
}


const deviceToken = 'dvDjmY7ITzSRHUdVA1AI3m:APA91bHewKDxP_klqbUugxpheqerljGyZekVWQh4lllnRWppvJXKZgW1L_Wqz3B0hlujsGZBUIXptIMhuqVLG51xK1rm12XzjFpIQzjoRaBzABfBqW435LOh5pn6HfZxduUNY9Q4cQUe';
const title = 'Hello!';
const body = 'This is a test notification';

sendPushNotification(deviceToken, title, body) 