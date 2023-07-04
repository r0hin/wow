const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging")
const { getFirestore } = require("firebase-admin/firestore");

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

  await messaging.send({
    token: receiverToken,
    notification: {
      title: senderName,
      body: `${text}`
    }
  })
});