// Use matchMedia to check the user preference
import { StatusBar, Style } from '@capacitor/status-bar';
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

import { addDoc, collection, doc, getDoc, limitToLast, onSnapshot, orderBy, query } from "firebase/firestore"

import { db } from "./authservice"
console.log(db)

window.activeSnapshotListener = null;

toggleDarkTheme(prefersDark.matches);

// Listen for changes to the prefers-color-scheme media query
prefersDark.addEventListener('change', (mediaQuery) => toggleDarkTheme(mediaQuery.matches));

// Add or remove the "dark" class based on if the media query matches
function toggleDarkTheme(shouldAdd) {
  document.body.classList.toggle('dark', shouldAdd);
  if (shouldAdd) {
    StatusBar.setStyle({ style: Style.Dark });
  } else {
    StatusBar.setStyle({ style: Style.Light });
  }
}

window.addEventListener('keyboardWillShow', (ev) => {
  const kbh = ev.keyboardHeight;
  $(`#app-login`).css("height", "calc(100% - " + kbh + "px) !important");
  console.log($(`#ionicapptarget`).get(0))
});

window.addEventListener("keyboardWillHide", () => {
  $(`#app-login`).get(0).setAttribute("style", "");
});

window.friendsCache = [];

window.loadFriends = async (list, card) => {
  onSnapshot(doc(db, `users/${await getAuthDetail("uid")}`), (selfDoc) => {
    if (!selfDoc.exists()) {
      card.removeClass("hidden");
      return;
    };

    const friends = selfDoc.data().friends || [];
    console.log(friends)
    if (friends && friends.length) {
      card.addClass("hidden");
    }
    else {
      card.removeClass("hidden");
    }

    // Compare additions and deletions
    const additions = friends.filter(x => !window.friendsCache.includes(x));
    const deletions = window.friendsCache.filter(x => !friends.includes(x));

    friendsCache = friends;

    // Add new friends
    additions.forEach(async (friend) => {
      const userDoc = await getDoc(doc(db, `users/${friend}`));
      const friendData = userDoc.data();

      const a = document.createElement("ion-nav-link");
      a.setAttribute("component", `friend-${friend}`);
      a.setAttribute("router-direction", "forward");
      a.classList.add("friend");
      a.id = friend;
      a.innerHTML = `
        <ion-item button>
          <ion-label>${friendData.name}</ion-label>
        </ion-item>
      `;
      list.appendChild(a);

      class friendElement extends HTMLElement {
        async connectedCallback() {
          this.innerHTML = `
            <ion-header>
              <ion-toolbar>
                <ion-buttons slot="start">
                  <ion-nav-link component="home-main" routerDirection="back">
                    <ion-back-button text="Friends"></ion-back-button>
                  </ion-nav-link>
                </ion-buttons>
                <ion-title>${friendData.name}</ion-title>
              </ion-toolbar>
            </ion-header>
            <ion-content class="ion-padding">
              <div id="messages"></div>
              <ion-button id="sendButton">send</ion-button>
            </ion-content>
          `;

          const alphabetized = [friend, await getAuthDetail("uid")].sort();
          const chatId = alphabetized[0] + alphabetized[1];
          console.log(chatId)
          activeSnapshotListener = onSnapshot(query(collection(db, `relations/${chatId}/chats`), limitToLast(10), orderBy("timestamp", "asc")), (snapshot) => {
            snapshot.docChanges().forEach((change) => {
              if (change.type === "added") {
                const message = change.doc.data();
                const messageElement = document.createElement("ion-item");
                messageElement.innerHTML = `
                  <ion-label>${message.text} at ${new Date(message.timestamp)}</ion-label>
                `;
                $(`#messages`).append(messageElement);
              }
            });
          })

          $(`#sendButton`).on("click", async () => {
            const message = {
              sender: await getAuthDetail("uid"),
              timestamp: Date.now(),
              text: "Wow!",
            }
            addDoc(collection(db, `relations/${chatId}/chats`), message)
          });
        }
      }

      try {
        customElements.define(`friend-${friend.toLowerCase()}`, friendElement);
      } catch (error) {
        console.log(error)
        // Already defined
      }
    });

    // Remove old friends
    deletions.forEach(async (friend) => {
      $(list).find(`#${friend}`).remove();
      const component = (await $(`#home-nav`).get(0).getActive()).component;

      console.log(component);
      if (component === `friend-${friend}` || component === `friend-${friend.toLowerCase()}`) {
        $(`#home-nav`).get(0).popToRoot();
      }
    });
  })
}

$(`#home-nav`).on("ionNavDidChange", async (ev) => {
  const component = (await $(`#home-nav`).get(0).getActive()).component;
  
  if (component == "home-main") {
    try {
      activeSnapshotListener();
    } catch (error) {
      
    }
  }
});

window.activeTab = "friends";
$(`#ion-tabs-root`).on("ionTabsDidChange", async (ev) => {
  const tab = (await $(`#ion-tabs-root`).get(0).getSelected()).toString();
  activeTab = tab;
});

$(`#friendstabbutton`).on("click", () => {
  if (activeTab == "friends") {
    $(`#home-nav`).get(0).popToRoot();
  }
});

$(`#settingstabutton`).on("click", () => {
  if (activeTab == "settings") {
    $(`#settings-nav`).get(0).popToRoot();
  }
});