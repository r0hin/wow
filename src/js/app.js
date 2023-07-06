// Use matchMedia to check the user preference
import { StatusBar, Style } from '@capacitor/status-bar';

import { auth, db } from "./authservice"
import { addDoc, arrayRemove, arrayUnion, collection, doc, getDoc, limitToLast, onSnapshot, orderBy, query, setDoc, updateDoc } from "firebase/firestore"

import { showToasty } from './alerts';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

window.activeSnapshotListener = null;
window.scrollTimeout = null;

// Add or remove the "dark" class based on if the media query matches
window.toggleDarkTheme = (shouldAdd) => {
  if (shouldAdd) {
    console.log('adding dark')
    document.body.classList.add('dark');
    StatusBar.setStyle({ style: Style.Dark });
    $(`#metacolor`).attr("content", "dark");
  }
  else {
    document.body.classList.remove('dark');
    StatusBar.setStyle({ style: Style.Light });
    $(`#metacolor`).attr("content", "light");
  }
}

window.addEventListener('keyboardWillShow', (ev) => {
  let kbh = ev.keyboardHeight;
  kbh = kbh - 40 // Account for moved bottommost elements which have bottom padding for curved displays .... anyways
  $(`#app-setup`).get(0).setAttribute("style", `height: calc(100% - env(safe-area-inset-top) - env(safe-area-inset-bottom) - ${kbh}px)`);
  console.log($(`#ionicapptarget`).get(0))
});

window.addEventListener("keyboardWillHide", () => {
  $(`#app-setup`).get(0).setAttribute("style", "");
});

window.friendsCache = [];
window.lastPaintUID = null;
window.friendsSnapshotListener = null;

window.loadFriends = async (list, card) => {
  const user = auth.currentUser;
  if (!user) {
    return;
  }

  try { friendsSnapshotListener() } catch (error) {}
  friendsSnapshotListener = onSnapshot(doc(db, `users/${await getAuthDetail("uid")}`), async (selfDoc) => {
    if (lastPaintUID !== selfDoc.id) {
      $(list).empty();
      $(`#home-nav`).get(0).popToRoot();
    }

    lastPaintUID = selfDoc.id;

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
    for (let i = 0; i < additions.length; i++) {
      const friend = additions[i]; 
      const userDoc = await getDoc(doc(db, `users/${friend}`));
      const friendData = userDoc.data();

      const a = document.createElement("ion-nav-link");
      a.setAttribute("component", `friend-${friend}`);
      a.onclick = async () => {
        // Remove badge
        updateDoc(doc(db, `users/${await getAuthDetail("uid")}`), {
          badges: arrayRemove(friend)
        }, { merge: true });
      }
      a.setAttribute("router-direction", "forward");
      a.classList.add("friend");
      a.id = friend;
      a.innerHTML = `
        <ion-item button>
          <ion-label>${friendData.name}</ion-label>
          <ion-badge class="badge hidden" id="${friend}badge" color="primary">!</ion-badge>
        </ion-item>
      `;
      list.appendChild(a);

      class friendElement extends HTMLElement {
        async connectedCallback() {
          this.innerHTML = `
            <style>
              #messagesContainer {
                height: calc(100% - 80px);
                overflow-y: scroll;
              }

              #messages {
                --sentColor: #0b93f6;
                --receiveColor: var(--ion-color-step-100);
                --bg: var(--ion-background-color);
              
                display: flex;
                flex-direction: column;
                padding: 0;
                list-style: none;
                margin: 16px;
              }

              .shared {
                position: relative; /* Setup a relative container for our psuedo elements */
                max-width: 255px;
                margin-bottom: 15px;
                padding: 10px 20px;
                line-height: 24px;
                word-wrap: break-word; /* Make sure the text wraps to multiple lines if long */
                border-radius: 25px;
              }

              .shared:before {
                width: 20px;
              }
              
              .shared:after {
                width: 26px;
                background-color: var(--bg); /* All tails have the same bg cutout */
              }
              
              .shared:before, .shared:after {
                position: absolute;
                bottom: 0;
                height: 25px; /* height of our bubble "tail" - should match the border-radius above */
                content: '';
              }

              .sent {
                align-self: flex-end;
                color: white;
                background: var(--sentColor);
              }

              .sent:before {
                right: -7px;
                background-color: var(--sentColor);
                border-bottom-left-radius: 16px 14px;
              }
              
              .sent:after {
                right: -26px;
                border-bottom-left-radius: 10px;
              }

              .received {
                align-self: flex-start;
                color: var(--ion-text-color);
                background: var(--receiveColor);
              }

              .received:before {
                left: -7px;
                background-color: var(--receiveColor);
                border-bottom-right-radius: 16px 14px;
              }
              
              .received:after {
                left: -26px;
                border-bottom-right-radius: 10px;
              }

              .noTail {
                margin-bottom: 2px;
              }

              .noTail:before, noTail:after {
                opacity: 0;
              }

              #controls {
                display: flex;
                flex-direction: row;
                justify-content: center;
                align-items: center;
                height: 48px;
              }

              #controls > * {
                margin: 0 8px;
              }

              .hidden {
                display: none !important;
              }
            </style>
            <ion-header>
              <ion-toolbar>
                <ion-buttons slot="start">
                  <ion-nav-link component="home-main" routerDirection="back">
                    <ion-back-button text="Friends"></ion-back-button>
                  </ion-nav-link>
                </ion-buttons>
                <ion-title>${friendData.name}</ion-title>
                <ion-buttons slot="end">
                  <ion-button id="infoButton">
                    <ion-icon name="ellipsis-horizontal"></ion-icon>
                  </ion-button>
                </ion-buttons>
              </ion-toolbar>
            </ion-header>
            <ion-content>
              <ion-content id="messagesContainer">
                <ol id="messages"></ol>
              </ion-content>
              <div id="controls">
                <ion-button id="sendButton">Send Wow!</ion-button>
                <ion-button id="sendButton2">Send Womp Womp</ion-button>
              </div>
            </ion-content>
          `;

          $(`#infoButton`).on("click", async () => {
            const actionSheet = document.createElement('ion-action-sheet');
            actionSheet.header = friendData.name;
            actionSheet.buttons = [{
              text: 'Remove Friend',
              role: 'destructive',
              handler: async () => {
                await setDoc(doc(db, `users/${await getAuthDetail("uid")}`), {
                  friends: arrayRemove(friend),
                  badges: arrayRemove(friend)
                }, { merge: true });

                await setDoc(doc(db, `users/${friend}`), {
                  friends: arrayRemove(await getAuthDetail("uid")),
                  badges: arrayRemove(await getAuthDetail("uid"))
                }, { merge: true });

                showToasty("Friend removed successfully");
              }
            }, {
              text: 'Cancel',
              role: 'cancel',
            }];
            document.body.appendChild(actionSheet);
            await actionSheet.present();

            const { role } = await actionSheet.onDidDismiss();
            console.log('onDidDismiss resolved with role', role);
          })
          
          const alphabetized = [friend, await getAuthDetail("uid")].sort();
          const chatId = alphabetized[0] + alphabetized[1];
          window.countMessages = 0;
          activeSnapshotListener = onSnapshot(query(collection(db, `relations/${chatId}/chats`), limitToLast(12), orderBy("timestamp", "asc")), (snapshot) => {
            snapshot.docChanges().forEach(async (change) => {
              if (change.type === "added") {
                countMessages++;
                const message = change.doc.data();
                const messageElement = document.createElement("li");
                messageElement.setAttribute("data-sender", message.sender)
                messageElement.classList.add("shared");

                // Last 5 seconds
                if (message.timestamp > Date.now() - 5000) {
                  messageElement.classList.add("animated");
                  messageElement.classList.add("zoomIn");
                  messageElement.classList.add("fast");
                }

                if (message.sender === await getAuthDetail("uid")) {
                  messageElement.classList.add("sent");
                } else {
                  messageElement.classList.add("received");
                }
                messageElement.innerHTML = `
                  <ion-label>${message.text}</ion-label>
                `;

                if ($(`#messages`).children().length && $(`#messages`).children().last().get(0).getAttribute("data-sender") == message.sender) {
                  // If last message equals sender, remove tail of last message
                  $(`#messages`).children().last().get(0).classList.add("noTail");
                }

                $(`#messages`).append(messageElement);

                window.clearTimeout(window.scrollTimeout);
                scrollTimeout = window.setTimeout(() => {
                  $(`#messagesContainer`).get(0).scrollToBottom(500);
                }, 100)
              }
            });
          })

          $(`#sendButton`).on("click", async () => {
            $(`#sendButton`).attr("disabled", true);
            $(`#sendButton2`).attr("disabled", true);
            setTimeout(() => {
              $(`#sendButton`).attr("disabled", false);
              $(`#sendButton2`).attr("disabled", false);
            }, 999);
            const message = {
              sender: await getAuthDetail("uid"),
              timestamp: Date.now(),
              text: "Wow!",
            }
            await updateDoc(doc(db, `users/${friend}`), {
              badges: arrayUnion(await getAuthDetail("uid"))
            });
            await addDoc(collection(db, `relations/${chatId}/chats`), message)
          });

          $(`#sendButton2`).on("click", async () => {
            $(`#sendButton`).attr("disabled", true);
            $(`#sendButton2`).attr("disabled", true);
            setTimeout(() => {
              $(`#sendButton`).attr("disabled", false);
              $(`#sendButton2`).attr("disabled", false);
            }, 500);
            const message = {
              sender: await getAuthDetail("uid"),
              timestamp: Date.now(),
              text: "Womp Womp",
            }
            await updateDoc(doc(db, `users/${friend}`), {
              badges: arrayUnion(await getAuthDetail("uid"))
            });
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
    }

    // Remove old friends
    for (let i = 0; i < deletions.length; i++) {
      const friend = deletions[i];
      $(list).find(`#${friend}`).remove();
      const component = (await $(`#home-nav`).get(0).getActive()).component;

      console.log(component);
      if (component === `friend-${friend}` || component === `friend-${friend.toLowerCase()}`) {
        $(`#home-nav`).get(0).popToRoot();
      }
    }

    const badgeUsers = selfDoc.data().badges || [];
    $(`.badge`).addClass("hidden")
    badgeUsers.forEach(async (badgeUser) => {
      $(`#${badgeUser}badge`).removeClass("hidden");
    });

    const component = (await $(`#home-nav`).get(0).getActive()).component;
    if (`${component}`.startsWith("friend-")) {
      const activeID = `${component}`.split(`-`).pop();
      if (badgeUsers.includes(activeID)) {
        updateDoc(doc(db, `users/${await getAuthDetail("uid")}`), {
          badges: arrayRemove(activeID)
        }, { merge: true });
      }
    }
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