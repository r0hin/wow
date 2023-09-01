// import { createGesture} from "@ionic/core"

import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { auth } from "../js/auth";
import { loadSettings } from "../js/settings";

class Home extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <ion-content id="homeContainer" class="ion-padding">
        <br><br>
        <div index="0" class="tab active">
          <div class="header">
            <h1 class="title">Messages</h1>
          </div>
          <add-friend></add-friend>
        </div>
        <div index="1" class="tab">
          <h1 class="title">Add</h1>
        </div>
        <div index="2" class="tab">
          <h1 class="title">Settings</h1>
          <p class="subtitle">Profile</p>
          <ion-list inset="true">
            <ion-item>
              <ion-label>Email</ion-label>
              <ion-note id="emailAddress"></ion-note>
            </ion-item>
            <ion-item>
              <ion-label>Username</ion-label>
              <ion-note id="usernameSetting"></ion-note>
            </ion-item>
            <ion-item id="signOutButton" button>
              <ion-label>Sign Out</ion-label>
            </ion-item>
          </ion-list>
        </div>

        <nav-bar class="navBar" />
      </ion-content>
    `    

    loadSettings();

    $(`#signOutButton`).on('click', async () => {
      await Promise.all([
        await auth.signOut(),
        await FirebaseAuthentication.signOut()
      ]);

      alert("Signed out!")
    });
  }
}

customElements.define('page-home', Home);