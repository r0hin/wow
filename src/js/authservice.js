import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "@firebase/auth";
import { showAlert } from "./alerts";

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

onAuthStateChanged(auth, (user) => {
  console.log(window.location.href)
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