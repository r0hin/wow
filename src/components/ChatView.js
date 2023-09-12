import { arrayUnion, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../js/auth";

class ChatView extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div id="chatViewContainer">
        <div id="chatHeader"></div>
        <div class="chatCanvas" id="messageCanvas">
          <p class="chatCanvasText animated">Live messages</p>
        </div>
        <div class="detailsBoxes">
          <div class="streakBox"></div>
          <div class="sendBox">
            <button id="sendMessageButton">
              <i class="bx bx-up-arrow-alt"></i>
            </button>
          </div>
        </div>
      </div>
    `;

    $(`#sendMessageButton`).click(async () => {
      const friend = activeChat.split("-").filter((uid) => uid !== window.user.uid)[0];

      // Trim the 

      const existingMessages = (await getDoc(doc(db, `relations/${activeChat}`))).data()[`${window.user.uid}-messages`] || [];
      existingMessages.push({
        message: "wow",
        timestamp: Date.now(),
      });
      // Keep the last two elements
      existingMessages.splice(0, existingMessages.length - 2);

      await setDoc(doc(db, `relations/${activeChat}`), {
        [`${window.user.uid}-messages`]: existingMessages,
        [`${window.user.uid}-read`]: true,
        [`${friend}-read`]: false,
      }, { merge: true})

      
    })
  }
}

customElements.define("chat-view", ChatView);