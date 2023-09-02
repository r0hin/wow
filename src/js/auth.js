import { getApp, initializeApp } from "firebase/app"
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { getAuth, initializeAuth, indexedDBLocalPersistence, signInWithCredential, OAuthProvider, onAuthStateChanged, signInWithEmailAndPassword } from "@firebase/auth";
import { doc, getFirestore, onSnapshot } from "firebase/firestore";
import { getStorage } from "firebase/storage"
import { getFunctions } from "firebase/functions"

import { refreshLoc } from "../pages/Router";
import { StatusBar, Style } from "@capacitor/status-bar";
import { loadSettings } from "./settings";
import { loadData } from "./data";
StatusBar.setStyle({
  style: Style.Dark
})

const firebaseConfig = {
  apiKey: "AIzaSyC2pUO_tPX2_r6yJjDzyhubx5Tok16L5eg",
  authDomain: "social-721e8.firebaseapp.com",
  projectId: "social-721e8",
  storageBucket: "social-721e8.appspot.com",
  messagingSenderId: "707217834321",
  appId: "1:707217834321:web:d9588ce5b9accf8b7c9370"
};

window.user = null;

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
export const storage = getStorage(app);
export const functions = getFunctions(app);

onAuthStateChanged(auth, (user) => {
  window.user = user;

  if (user) {
    loadSettings();
    loadData({}, window.cacheUser) // Load data from cache, if it exists
  }

  // Listener tech
  if (!window.listenerCreated && user) {
    window.listenerCreated = true;
    try { listener();} catch (error) {}
    console.log("Creating listener...")
    window.listener = onSnapshot(doc(db, `users/${user.uid}`), (doc) => {
      loadData(window.cacheUser || {}, doc.data())
      window.cacheUser = doc.data();
      loadSettings();
    });
  }

  refreshLoc();
});

export async function appleLoginButton() {
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
};

export async function emailLoginButton(email, password, button) {
  button.addClass("disabled"); // Even if errors, dont re enable. Will be re-enabled on input
  let signInResult;
  try {
    signInResult = await FirebaseAuthentication.signInWithEmailAndPassword({
      email: email,
      password: password,
      skipNativeAuth: false
    });
  } catch (error) {
    if (`${error}`.includes("no user record")) {
      try {
        signInResult = await FirebaseAuthentication.createUserWithEmailAndPassword({
          email: email,
          password: password,
          skipNativeAuth: false
        })
      } catch (error) {
        alert(error);
      }
    }
    else {
      alert(error);
    }
  }

  // Sign in on web layer
  await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
}