import { httpsCallable } from "firebase/functions";
import { db, functions } from "../js/auth";
import { getDoc, doc } from "firebase/firestore";
import {  Keyboard} from "@capacitor/keyboard"
import { showToasty } from "../js/alerts";

class AddFriend extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <ion-modal id="addFriendModal" swipe-to-close="true">
        <ion-content class="ion-padding">
          <ion-searchbar id="friendSearch" debounce="1000" placeholder="Search Username"></ion-searchbar>

          <div id="noSearchResult" class="hidden">
            <center>
            No result
            </center>
          </div>
          <div id="searchResult" class="hidden">
            <ion-card>
              <div id="profileCoverContainer"></div>
              <ion-card-header>
                <ion-card-subtitle id="cardSubtitle"></ion-card-subtitle>
              </ion-card-header>
              <ion-card-content id="cardBody"></ion-card-content>
            </ion-card>
            <button id="sendButton" class="blockButton sendRequestButton">
              Send Request
              <i class="bx bx-right-arrow-alt"></i>  
            </button>
          </div>
        </ion-content>
      </ion-modal>
    `

    const modal = document.querySelector('#addFriendModal');
    // modal.presentingElement = $(`#homeContainer`).get(0);
    modal.initialBreakpoint = "0.25"
    modal.breakpoints = [0, 0.25, 0.75];

    $(`#friendSearch`).on("ionChange", async (ev) => {
      // Hide keyboard
      await Keyboard.hide();

      const username = $(ev.target).val().toLowerCase();
      const usernameMap = await getDoc(doc(db, `usernames/${username}`));

      if (!usernameMap.exists()) {
        $(`#noSearchResult`).removeClass("hidden");
        $(`#searchResult`).addClass("hidden");
        return;
      }
      $(`#noSearchResult`).addClass("hidden");
      $(`#searchResult`).removeClass("hidden");

      const uid = usernameMap.data().uid;

      $(`#profileCoverContainer`).html(`<profile-photo uid="${uid}" id="profileCover"></profile-photo>`);

      const userDoc = await getDoc(doc(db, `users/${uid}`));
      $(`#cardSubtitle`).html(`@${userDoc.data().username}`)
      $(`#cardBody`).html(`${userDoc.data().bio || "No bio."}`)

      modal.setCurrentBreakpoint(0.75);
    });

    $(`#sendButton`).on("click", async () => {
      $(`#sendButton`).addClass("disabled");

      const usernameDoc = await getDoc(doc(db, `usernames/${$(`#friendSearch`).val().toLowerCase()}`));
      if (!usernameDoc.exists()) {
        alert("User does not exist");
        return;
      }

      const uid = usernameDoc.data().uid;
      const sendRequest = httpsCallable(functions, "friends-sendRequest");
      const response = await sendRequest({
        target: uid
      })

      if (!response.data.success) {
        alert(response.data.message);
        $(`#sendButton`).removeClass("disabled");
        return;
      }

      $(`#noSearchResult`).addClass("hidden");
      $(`#searchResult`).addClass("hidden");
      $(`#friendSearch`).val("")
      $(`#sendButton`).removeClass("disabled");
      modal.dismiss();

      showToasty("Friend request sent!")
    });
  }
}

customElements.define('add-friend', AddFriend);