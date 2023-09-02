import { getDoc, doc } from "firebase/firestore";
import { db } from "../js/auth";

class Router extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="centered">
        <center>
          <ion-spinner></ion-spinner>
          <br></br>
          <p style="opacity: 0.2">Beep boop</p>
        </center>
      </div>
    `
  }
}

try {
  customElements.define('page-router', Router);
} catch (error) {
}
  

export async function refreshLoc() {
  const routerElement = $(`#router`).get(0);
  if (user) {
    const userDoc = await getDoc(doc(db, `users/${user.uid}`));
    if (userDoc.exists()) {
      routerElement.push("/home")
    }
    else {
      console.log("going onboard")
      routerElement.push("/onboard")
    }
  }
  else {
    console.log("going login")
    routerElement.push("/login")
  }
}