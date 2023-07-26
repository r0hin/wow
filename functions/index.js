const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging")
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const functions = require("firebase-functions");

const app = initializeApp();
const messaging = getMessaging(app);
const db = getFirestore(app);

exports.notificationHandler = onDocumentCreated("relations/{relationId}/chats/{messageId}", async (event) => {
  const snapshot = event.data;
  const data = snapshot.data();
  const text = data.text;

  const sender = data.sender;
  
  const senderDoc = await db.doc(`users/${sender}`).get();
  const senderName = senderDoc.data().name || "Anonymous";

  const receiver = event.params.relationId.replace(sender, "");

  const receiverFcm = await db.doc(`fcm/${receiver}`).get();

  if (!receiverFcm.exists || !receiverFcm.data().tokens) return;

  const receiverToken = receiverFcm.data().tokens;

  // messaging.send({
  //   token: receiverToken,
  //   notification: {
  //     title: `${senderName}`,
  //     body: `${text}`,
  //   }
  // }), 

  await Promise.all(messaging.send({
    "token": receiverToken,
    "data": {
      "title": `${senderName}`,
      "body": `${text}`,
      "sender": `${sender}`,
      "id": new Date().getTime().toString(),
    },
    "apns": {
      "payload": {
        "aps": {
          "contentAvailable": 1,
          "badge": 0,
        }
      }
    }
  }))
});



exports.deleteHandler = functions.auth.user().onDelete(async (user) => {
  const userDoc = await db.doc(`users/${user.uid}`).get();
  const userDocData = userDoc.data();
  const friends = userDocData.friends;

  friends.forEach(async (friend) => {
    await db.doc(`users/${friend}`).update({
      friends: FieldValue.arrayRemove(user.uid)
    });
    await db.doc(`users/${user.uid}`).update({
      friends: FieldValue.arrayRemove(friend)
    })

    const arrayIDs = [friend, user.uid]
    arrayIDs.sort();
    const relationID = arrayIDs.join("");

    await db.recursiveDelete(`relations/${relationID}`);

  });

  await db.doc(`fcm/${user.uid}`).delete();
  await db.doc(`users/${user.uid}`).delete();
})