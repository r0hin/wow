import { storage } from "../js/auth";
import { ref, uploadBytes } from "firebase/storage";
import { db } from "../js/auth";
import { setDoc, doc, getDoc } from "firebase/firestore";

class Onboard extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <ion-content class="ion-padding">
        <br><br>
        <h1 class="title">Create Profile</h1>
        <br><br>
        <center>
          <button id="profilePhotoButton" class="profileButton">
            <img id="profilePhoto" class="profileImage" src="https://firebasestorage.googleapis.com/v0/b/social-721e8.appspot.com/o/default.png?alt=media" alt="" />
            <i class="bx bx-camera"></i>
          </button>
          <br><br><br>
          <input placeholder="Username" class="field" type="email" name="" id="username">
          <button id="continueOnboardButton" class="loginButton disabled">Continue <i class="bx bx-right-arrow-alt"></i></button>
        </center>
      </ion-content>
    `

    $(`#username`).on("input", () => {
      if ($(`#username`).val()) {
        $(`#continueOnboardButton`).removeClass("disabled")
      }
      else {
        $(`#continueOnboardButton`).addClass("disabled")
      }
    })

    $(`#profilePhotoButton`).on("click", () => {
      console.log('creating')
      const a = document.createElement("input");
      a.type = "file";
      a.accept = "image/*";
      a.onchange = async () => {
        const file = a.files[0];
        const storageRef = ref(storage, `profile/${window.user.uid}.png`);
        console.log("Uploading")
        await uploadBytes(storageRef, file);
        console.log("Uploaded")
        console.log($(`#profilePhoto`).get(0))
        $(`#profilePhoto`).attr("src", `https://firebasestorage.googleapis.com/v0/b/social-721e8.appspot.com/o/profile%2F${window.user.uid}.png?alt=media`);
      }
      a.onclick = (e) => {
        e.stopPropagation();
        a.value = null;
      }
      a.click();
    });

    $(`#continueOnboardButton`).on("click", async () => {
      $(`#continueOnboardButton`).addClass("disabled");
      const username = $(`#username`).val();

      if (username.length < 3) {
        alert("Username must be at least 3 characters");
        return;
      }

      if (username.length > 16) {
        alert("Username must be less than 16 characters");
        return;
      }

      if (!username.match(/^[a-zA-Z0-9]+$/)) {
        alert("Username must be alphanumeric and contain no spaces");
        return;
      }

      const usernameDoc = await getDoc(doc(db, `usernames/${username}`));
      if (usernameDoc.exists()) {
        alert("Username taken");
        return;
      }

      await setDoc(doc(db, `usernames/${username}`), {
        uid: window.user.uid,
        created: new Date().getTime(),
      });

      await setDoc(doc(db, `users/${window.user.uid}`), {
        username: username,
        created: new Date().getTime(),
      });

      const routerElement = $(`#router`).get(0);
      routerElement.push("/home")

    });
  }
}

customElements.define('page-onboard', Onboard);