const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { onCall } = require("firebase-functions/v2/https");

const db = getFirestore();

exports.sendRequest = onCall(async (request) => {
  const target = request.data.target;
  const sender = request.auth.uid

  const targetDoc = await db.collection('users').doc(target).get();
  const senderDoc = await db.collection('users').doc(sender).get();

  if (!targetDoc.exists) {
    return { success: false, message: "User does not exist!" }
  }

  if (target === sender) {
    return { success: false, message: "You can't send a friend request to yourself!" }
  }

  if (targetDoc.data().friends.some(friend => friend.uid === sender)) {
    return { success: false, message: "You're already friends with this person!" }
  }

  if (targetDoc.data().outgoingRequests.some(request => request.uid === sender)) {
    // Target has already sent a request to sender, so accept it
    await Promise.all([
      db.collection('users').doc(target).update({
        outgoingRequests: FieldValue.arrayRemove({
          uid: sender,
          username: senderDoc.data().username,
        }),
        incomingRequests: FieldValue.arrayRemove({
          uid: sender,
          username: senderDoc.data().username,
        }),
        friends: FieldValue.arrayUnion({
          uid: sender,
          username: senderDoc.data().username,
        })
      }),
      db.collection('users').doc(sender).update({
        outgoingRequests: FieldValue.arrayRemove({
          uid: target,
          username: targetDoc.data().username,
        }),
        incomingRequests: FieldValue.arrayRemove({
          uid: target,
          username: targetDoc.data().username,
        }),
        friends: FieldValue.arrayUnion({
          uid: target,
          username: targetDoc.data().username,
        })
      })
    ]);
  }

  if (targetDoc.data().incomingRequests.some(request => request.uid === sender)) {
    return { success: false, message: "Request already sent!" }
  }

  await Promise.all([
    db.collection('users').doc(target).update({
      incomingRequests: FieldValue.arrayUnion({
        uid: sender,
        username: senderDoc.data().username,
      })
    }),
    db.collection('users').doc(sender).update({
      outgoingRequests: FieldValue.arrayUnion({
        uid: target,
        username: targetDoc.data().username,
      })
    })
  ]);

  return { success: true }
});

exports.acceptRequest = onCall(async (request) => {
  const target = request.data.target;
  const sender = request.auth.uid;

  const targetDoc = await db.collection('users').doc(target).get();
  const senderDoc = await db.collection('users').doc(sender).get();

  if (!targetDoc.exists) {
    return { success: false, message: "User does not exist!" }
  }

  if (targetDoc.data().friends.some(friend => friend.uid === sender)) {
    return { success: false, message: "You're already friends with this person!" }
  }

  await Promise.all([
    db.collection('users').doc(target).update({
      outgoingRequests: FieldValue.arrayRemove({
        uid: sender,
        username: senderDoc.data().username,
      }),
      incomingRequests: FieldValue.arrayRemove({
        uid: sender,
        username: senderDoc.data().username,
      }),
      friends: FieldValue.arrayUnion({
        uid: sender,
        username: senderDoc.data().username,
      })
    }),
    db.collection('users').doc(sender).update({
      outgoingRequests: FieldValue.arrayRemove({
        uid: target,
        username: targetDoc.data().username,
      }),
      incomingRequests: FieldValue.arrayRemove({
        uid: target,
        username: targetDoc.data().username,
      }),
      friends: FieldValue.arrayUnion({
        uid: target,
        username: targetDoc.data().username,
      })
    })
  ]);

  return { success: true }
});

exports.rejectRequest = onCall(async (request) => {
  const target = request.data.target;
  const sender = request.auth.uid;

  const targetDoc = await db.collection('users').doc(target).get();
  const senderDoc = await db.collection('users').doc(sender).get();

  if (!targetDoc.exists) {
    return { success: false, message: "User does not exist!" }
  }

  if (targetDoc.data().friends.some(friend => friend.uid === sender)) {
    return { success: false, message: "You're already friends with this person!" }
  }

  await Promise.all([
    db.collection('users').doc(target).update({
      outgoingRequests: FieldValue.arrayRemove({
        uid: sender,
        username: senderDoc.data().username,
      }),
    }),
    db.collection('users').doc(sender).update({
      incomingRequests: FieldValue.arrayRemove({
        uid: target,
        username: targetDoc.data().username,
      }),
    })
  ]);

  return { success: true }
});
