import { initializeApp } from "firebase/app";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore"
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "@firebase/auth";
import { showAlert } from "./alerts";

import { toastController } from "@ionic/core";

const firebaseConfig = {
  apiKey: "AIzaSyC2pUO_tPX2_r6yJjDzyhubx5Tok16L5eg",
  authDomain: "social-721e8.firebaseapp.com",
  projectId: "social-721e8",
  storageBucket: "social-721e8.appspot.com",
  messagingSenderId: "707217834321",
  appId: "1:707217834321:web:d9588ce5b9accf8b7c9370"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
window.user = null;

onAuthStateChanged(auth, (user) => {
  window.user = user;
  if (user) {
    $(`#app-loading`).addClass("hidden");
    $(`#app-login`).addClass("hidden");
    $(`#app-home`).removeClass("hidden");

    // $(`#profileEmail`).text(user.email);

    // const profileName = user.email.split("@")[0];
    // $(`#profileName`).text(profileName);
  }
  else {
    $(`#app-loading`).addClass("hidden");
    $(`#app-login`).removeClass("hidden");
    $(`#app-home`).addClass("hidden");
  }
})

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

        
        const toast = await toastController.create({
          message: 'Display name successfully updated',
          duration: 2500,
          position: "bottom",
          buttons: [{
            text: "OK",
            role: "cancel"
          }]
        });
        
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
      default:
        break;
    }
  })
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