import { initializeApp } from "firebase/app";
import { arrayUnion, doc, getDoc, getFirestore, setDoc } from "firebase/firestore"
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "@firebase/auth";
import { showAlert, showToasty } from "./alerts";

import { toastController } from "@ionic/core";
import QRCode from "qrcode"
import { Clipboard } from '@capacitor/clipboard';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';

window.scanning = false;

const firebaseConfig = {
  apiKey: "AIzaSyC2pUO_tPX2_r6yJjDzyhubx5Tok16L5eg",
  authDomain: "social-721e8.firebaseapp.com",
  projectId: "social-721e8",
  storageBucket: "social-721e8.appspot.com",
  messagingSenderId: "707217834321",
  appId: "1:707217834321:web:d9588ce5b9accf8b7c9370"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
window.user = null;

onAuthStateChanged(auth, (user) => {
  window.user = user;
  if (user) {
    $(`#app-loading`).addClass("hidden");
    $(`#app-login`).addClass("hidden");
    $(`#app-home`).removeClass("hidden");
  }
  else {
    $(`#app-loading`).addClass("hidden");
    $(`#app-login`).removeClass("hidden");
    $(`#app-home`).addClass("hidden");
  }
})

window.prepareFriends = (list, card) => {
  const onauthstatehandler = onAuthStateChanged(auth, async (user) => {
    if (user) {
      onauthstatehandler();
      loadFriends(list, card);
    }
  });
}

window.signOut = async () => {
  try {
    await auth.signOut();
  } catch (error) {
    showAlert("Authentication Error", "", error.message);
  }
}

window.editDisplayName = async () => {
  const alert = document.createElement('ion-alert');
  alert.header = "Edit Display Name";
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
        
        refreshProfile();
        await toast.present();
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
        if (userDoc.exists() && userDoc.data().name) {
          resolve(userDoc.data().name);
        }
        else {
          resolve(window.user.email.split("@")[0]);
        }
        break;
      case "email":
        resolve(window.user.email);
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
};

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

$(`#signUpButton`).get(0).onclick = async () => {
  const email = $(`#emailInput`).val()
  const password = $(`#passInput`).val()

  try {
    await createUserWithEmailAndPassword(auth, email, password)
  } catch (error) {
    showAlert("Authentication Error", "", error.message);
  }
}

$(`#signInButton`).get(0).onclick = async () => {
  const email = $(`#emailInput`).val()
  const password = $(`#passInput`).val()

  try {
    await signInWithEmailAndPassword(auth, email, password)
  }
  catch (error) {
    showAlert("Authentication Error", "", error.message);
  }
}