import { getApp, initializeApp } from "firebase/app";
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { arrayUnion, collection, doc, getCountFromServer, getDoc, getFirestore, query, setDoc, where } from "firebase/firestore"
import { getAuth, initializeAuth, indexedDBLocalPersistence, signInWithCredential, OAuthProvider, onAuthStateChanged, reauthenticateWithCredential, GoogleAuthProvider, TwitterAuthProvider } from "@firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { FirebaseMessaging } from "@capacitor-firebase/messaging";
import { showAlert, showToasty } from "./alerts";

import QRCode from "qrcode"
import { Clipboard } from '@capacitor/clipboard';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { LocalNotifications } from "@capacitor/local-notifications";

window.scanning = false;

const firebaseConfig = {
  apiKey: "AIzaSyC2pUO_tPX2_r6yJjDzyhubx5Tok16L5eg",
  authDomain: "social-721e8.firebaseapp.com",
  projectId: "social-721e8",
  storageBucket: "social-721e8.appspot.com",
  messagingSenderId: "707217834321",
  appId: "1:707217834321:web:d9588ce5b9accf8b7c9370"
};

const getFirebaseAuth = (app) => {
  if (Capacitor.isNativePlatform()) {
    console.log("Native platform detected")
    return initializeAuth(getApp(), {
      persistence: indexedDBLocalPersistence,
    });
  }
  else {
    return getAuth(app);
  }
}

export const app = initializeApp(firebaseConfig);
export const auth = getFirebaseAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const storage = getStorage(app);

window.user = false;

setupAuthListeners();

async function setupAuthListeners() {
  onAuthStateChanged(auth, (user) => {
    triggerAuthUpdate();
  });

  FirebaseMessaging.addListener(`notificationReceived`, async (notification) => {
    console.log("Notification received")
    // Disable notification when app is active
    const state = await App.getState();
    if (!state.isActive) {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: notification.notification.data.title,
            body: notification.notification.data.body,
            id: new Date().getTime(),
          }
        ],
      })
    }
    else {
      const component = (await $(`#home-nav`).get(0).getActive()).component;
      if (`${component}`.startsWith("friend-")) {
        const activeID = `${component}`.split(`-`).pop();
        if (activeID === notification.notification.data.sender) {
          return;
        }
      }
      showToasty(`${notification.notification.data.title}: ${notification.notification.data.body}`);
    }
  });

  FirebaseMessaging.addListener(`notificationActionPerformed`, (action) => {
    console.log(action)
  });
}

App.addListener("appStateChange", async (state) => {
  if (state.isActive) {
    await FirebaseMessaging.removeAllDeliveredNotifications();
  }
})

window.manualTriggerAuth = triggerAuthUpdate;

function getToken() {
  return new Promise(async (resolve, reject) => {
    const options = {
      vapidKey: "BGmBqGKOda3AHlkf73Vpi7pQSaWnYHmrzkju6K5AjJA-DGz-JgK7nJ_VhFodlUJQM1o_WAyHyjVy8uOx3wOfxRI"
    }
    
    const { token } = await FirebaseMessaging.getToken(options);
    resolve(token);
  })
}

export async function triggerAuthUpdate() {
  window.user = auth.currentUser;
  if (user) {

    // Check if user has setup
    const userDoc = await getDoc(doc(db, `users/${user.uid}`));
    if (!userDoc.exists() || userDoc.data().setup !== true) {
      $(`#app-loading`).addClass("hidden");
      $(`#app-home`).addClass("hidden");
      $(`#app-login`).addClass("hidden");
      $(`#app-setup`).removeClass("hidden");

      // const count = await getNumberOfUsers();
      const count = 91;

      let ending = "th";
      if (count % 10 === 1) {
        ending = "st";
      }
      else if (count % 10 === 2) {
        ending = "nd";
      }
      else if (count % 10 === 3) {
        ending = "rd";
      }

      $(`#CountPlaqueEntryTitle`).html(`${count}<span>${ending}</span>`);
    }
    else {
      $(`#app-setup`).addClass("hidden");
      $(`#app-loading`).addClass("hidden");
      $(`#app-login`).addClass("hidden");
      $(`#app-home`).removeClass("hidden");

      const response = await FirebaseMessaging.requestPermissions();
      if (response.receive === "granted") {
        const token = await getToken();
        console.log("Updating FCM token!")
        await setDoc(doc(db, `fcm/${user.uid}`), {
          tokens: token
        }, { merge: true })
      }
      else {
        showToasty(":( You won't receive notifications. You can enable notifications in device settings")
      }
    }
  }
  else {
    $(`#app-loading`).addClass("hidden");
    $(`#app-setup`).addClass("hidden");
    $(`#app-home`).addClass("hidden");
    $(`#app-login`).removeClass("hidden");
  }
}

window.prepareFriends = (list, card) => {
  onAuthStateChanged(auth, (user) => {
    loadFriends(list, card);
  });
}

window.signOut = async () => {
  try {
    await setDoc(doc(db, `fcm/${window.user.uid}`), {
      tokens: ""
    }, { merge: true })
    await FirebaseAuthentication.signOut();
    await getFirebaseAuth().signOut();
  } catch (error) {
    showAlert("Authentication Error", "", error.message);
  }
}

window.editDisplayName = async () => {
  const alert = document.createElement('ion-alert');
  alert.header = "Set Display Name";
  alert.buttons = [{
    text: "Cancel",
    role: "cancel"
  }, {
    text: "Save",
    handler: async (data) => {

      if (!data.displayName) {
        showAlert("Update Error", "", "Display Name cannot be empty");
        return;
      }

      if (data.displayName.length < 3) {
        showAlert("Update Error", "", "Display Name must be at least 3 characters long");
        return;
      }

      if (data.displayName.length > 30) {
        showAlert("Update Error", "", "Display Name must be less than 30 characters long");
        return;
      }

      try {
        await setDoc(doc(db, `users/${window.user.uid}`), {
          name: data.displayName
        }, { merge: true })

        
        showToasty("Display name successfully updated");
        
        try {
          refreshProfile();
        } catch (error) {  
        }
      } catch (error) {
        showAlert("Update Error", "", error.message);
      }
    }
  }];

  alert.inputs = [{
    name: "displayName",
    type: "text",
    placeholder: await getAuthDetail("name"),
    spellcheck: false,
    autocapitalize: "on",
  }];

  document.body.appendChild(alert);
  await alert.present();
}

window.getAuthDetail = (type) => {
  console.log("Auth detail requested of type: " + type);
  return new Promise(async (resolve, reject) => {
    switch (type) {
      case "name":
        const userDoc = await getDoc(doc(db, `users/${window.user.uid}`));
        resolve(userDoc.data().name);
        break;
      case "email":
        resolve(window.user.email || "no-email");
        break;
      case "uid":
        resolve(window.user.uid);
        break;
      default:
        break;
    }
  })
}

window.generateQRCode = async (canv, uid) => {
  // Get screen width in px
  const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  QRCode.toDataURL(uid, {
    color: {
      dark: '#5856d6',  // Blue dots
      light: '#0000' // Transparent background
    },
    width: width
  }, (err, url) => {
    $(canv).attr("src", url);
  })

  // Generate user file if it doesnt exist
  const userDoc = await getDoc(doc(db, `users/${uid}`));
  if (!userDoc.exists()) {
    await setDoc(doc(db, `users/${uid}`), {
      name: await getAuthDetail("name"),
      friends: []
    }, { merge: true })
  }
}

window.beginScanning = async () => {
  if (window.scanning) {
    stopScanning();
    return;
  }
  else {
    window.scanning = true;
  }

  toggleScanInfoBox();
  document.querySelector('body').classList.add('scanner-active');

  await BarcodeScanner.checkPermission({ force: true });
  BarcodeScanner.hideBackground();
  const result = await BarcodeScanner.startScan(); // start scanning and wait for a result
  if (result.hasContent) {
    stopScanning();
    console.log(result.content); // log the raw scanned content
    addFriend(result.content);
  }
}

function stopScanning() {
  BarcodeScanner.showBackground();
  BarcodeScanner.stopScan();
  document.querySelector('body').classList.remove('scanner-active');
  window.scanning = false;
  toggleScanInfoBox();
};

window.getNumberOfUsers = () => {
  return new Promise(async (resolve, reject) => {
    const snapshot = await getCountFromServer(query(collection(db, `users`), where("setup", "==", true)));
    const count = snapshot.data().count;
    resolve(count);
  })
}

window.copyAuthCode = async () => {
  const uid = await getAuthDetail("uid");
  await Clipboard.write({
    string: uid
  });

  showToasty('Friend code copied to clipboard');
}

window.addFriend = async (uidInput) => {
  let uid = uidInput;
  if (!uid) {
    const { type, value } = await Clipboard.read();
    if (value) {
      uid = value;
    }
  }

  if (!uid || typeof uid !== "string" || uid.length < 1) {
    showAlert("Invalid Friend Code", "", "The friend code you are trying to add is invalid");
    return;
  }

  if (uid === window.user.uid) {
    showAlert("Invalid Friend Code", "", "You cannot add yourself as a friend");
    return;
  }

  // Check if user exists
  const userDoc = await getDoc(doc(db, `users/${uid}`));
  if (!userDoc.exists()) {
    showAlert("User not found", "", "The user you are trying to add does not exist");
    return;
  }

  // Check if user is already a friend
  const data = userDoc.data();
  if (data.friends && data.friends.length && data.friends.includes(window.user.uid)) {
    showAlert("User already added", "", "The user you are trying to add is already your friend");
    return;
  }

  // Add friend
  try {
    await setDoc(doc(db, `users/${uid}`), {
      friends: arrayUnion(window.user.uid)
    }, { merge: true })

    await setDoc(doc(db, `users/${window.user.uid}`), {
      friends: arrayUnion(uid)
    }, { merge: true })

    showToasty("Friend successfully added");
  }
  catch (error) {
    showAlert("Update Error", "", error.message);
  }
}

$(`#signInButtonApple`).get(0).onclick = async () => {
  const result = await FirebaseAuthentication.signInWithApple({
    skipNativeAuth: true,
    scopes: ["email"]
  });

  const provider = new OAuthProvider("apple.com");
  const credential = provider.credential({
    idToken: result.credential?.idToken,
    rawNonce: result.credential?.nonce
  });

  await signInWithCredential(getFirebaseAuth(), credential);
}

$(`#signInButtonGoogle`).get(0).onclick = async () => {
  const result = await FirebaseAuthentication.signInWithGoogle({
    skipNativeAuth: false,
  });
  const credential = GoogleAuthProvider.credential(result.credential.idToken);
  await signInWithCredential(getFirebaseAuth(), credential);
}

$(`#signInButtonTwitter`).get(0).onclick = async () => {
  const result = await FirebaseAuthentication.signInWithTwitter({
    skipNativeAuth: false,
  });
  console.log(result)
  const credential = TwitterAuthProvider.credential(result.credential?.accessToken, result.credential?.secret);
  await signInWithCredential(getFirebaseAuth(), credential);
}