import { getApp, initializeApp } from "firebase/app"
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { getAuth, initializeAuth, indexedDBLocalPersistence, signInWithCredential, OAuthProvider, onAuthStateChanged, reauthenticateWithCredential } from "@firebase/auth";
import { refreshLoc } from "../pages/Router";
import { getFirestore } from "firebase/firestore";

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

onAuthStateChanged(auth, (user) => {
  window.user = user;
  console.log(user)
  refreshLoc();
});

export async function appleLoginButton() {
  console.log("hiere")
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