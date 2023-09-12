import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "./auth"

import anime from 'animejs/lib/anime.es.js';
import { showToasty } from "./alerts";

window.activeChat = null;
window.displayed = [];
window.messagesLoaded = false;

function startChatListeners() {
  try { window.chatListener() } catch (error) {}

  $(`.chatCanvasText`).addClass("fadeOutUp")

  const friend = activeChat.split("-").filter((uid) => uid !== window.user.uid)[0];
  messagesLoaded = false;

  window.chatListener = onSnapshot(doc(db, `relations/${activeChat}`), async (doc) => {
    const totalMessages = [...(doc.data()[`${friend}-messages`] || []), ...(doc.data()[`${window.user.uid}-messages`] || [])];
    totalMessages.sort((a, b) => a.timestamp - b.timestamp); // Ascending (oldest first)

    const otherMessages = doc.data()[`${friend}-messages`];
    otherMessages && otherMessages.forEach((message) => {
      let index = totalMessages.findIndex((m) => m.timestamp == message.timestamp);
      if (messagesLoaded) { index = 0 }
      window.setTimeout(async () => {
        const a = document.createElement("div");
        a.classList.add("bubbleContainer")
        a.id = `bubble-${message.timestamp}`;
        if (window.displayed.includes(a.id)) return;
        displayed.push(a.id);
        a.style.left = `${(Math.floor(Math.random() * 50)) / 2}%`;
        a.innerHTML = `<div class="bubble incoming"><p>Message</p></div>`;
        $(`#messageCanvas`).get(0).appendChild(a);

        const canvasHeight = $(`#messageCanvas`).height();

        // Anime.js move bubble quickly from out of view bottom to bottom, then slowly travel to top, then fade out.
        // It is posoitioned absoulte
        anime.timeline({
          easing: "linear",
          complete: () => {
            $(a).remove();
          },
          loop: false
        }).add({
          targets: a,
          translateY: [canvasHeight, canvasHeight - 60],
          opacity: [0, 1],
          duration: 500,
          easing: "easeOutQuad"
        }).add({
          targets: a,
          translateY: [canvasHeight - 60, 12],
          opacity: [1, 1],
          easing: "easeInOutQuad",
          duration: 3500
        }).add({
          targets: a,
          translateY: [12, -48],
          opacity: [1, 0],
          duration: 500,
          easing: "easeInQuad"
        })
      }, index * 750)
    });

    const messages = doc.data()[`${window.user.uid}-messages`];
    messages && messages.forEach((message) => {
      let index = totalMessages.findIndex((m) => m.timestamp == message.timestamp);
      if (messagesLoaded) { index = 0 }
      window.setTimeout(async () => {
        const a = document.createElement("div");
        a.classList.add("bubbleContainer")
        a.id = `bubble-${message.timestamp}`;
        if (window.displayed.includes(a.id)) return;
        displayed.push(a.id);

        a.style.right = `${(Math.floor(Math.random() * 50)) / 2}%`;
        a.innerHTML = `<div class="bubble outgoing"><p>Message</p></div>`;
        $(`#messageCanvas`).get(0).appendChild(a);

        const canvasHeight = $(`#messageCanvas`).height();

        // Anime.js move bubble quickly from out of view bottom to bottom, then slowly travel to top, then fade out.
        // It is posoitioned absoulte
        anime.timeline({
          easing: "linear",
          complete: () => {
            $(a).remove();
          },
          loop: false,
        }).add({
          targets: a,
          translateY: [canvasHeight, canvasHeight - 60],
          opacity: [0, 1],
          duration: 500,
          easing: "easeOutQuad"
        }).add({
          targets: a,
          translateY: [canvasHeight - 60, 12],
          opacity: [1, 1],
          easing: "easeInOutQuad",
          duration: 3500
        }).add({
          targets: a,
          translateY: [12, -48],
          opacity: [1, 0],
          duration: 500,
          easing: "easeInQuad"
        });
      }, index * 750)
    });

    messagesLoaded = true;

    // If unread
    if (!doc.data()[`${window.user.uid}-read`]) {
      await updateDoc(doc.ref, {
        [`${window.user.uid}-read`]: true
      })
    }
  });
}

export function openChat(friend, username) {
  $(`#messagesTab`).addClass("chatOpen")
  $(`#messagesTab`).addClass("endBounceBottom")
  window.setTimeout(() => {
    $(`#messagesTab`).removeClass("endBounceBottom")
    window.setTimeout(() => {
      $(`#messagesTab`).addClass("lastInFirstOut");
    }, 200)
  }, 200)

  $(`#chatHeader`).html(`
    <div>
      <profile-photo uid="${friend}"></profile-photo>
      <h3>${username}</h3>
    </div>
    <button id="moreOptionsButton"><i class="bx bx-dots-vertical-rounded"></i></button>
  `)

  $(`#moreOptionsButton`).click(() => {
    showToasty("Here's a toast.")
  })

  activeChat = [window.user.uid, friend].sort().join("-");
  startChatListeners();
}

export function exitChat() {
  $(`#messagesTab`).removeClass("lastInFirstOut");
  window.setTimeout(() => {
    $(`#messagesTab`).removeClass("chatOpen")
    $(`#messagesTab`).addClass("endBounceTop")
  }, 9);
  window.setTimeout(() => {
    $(`#messagesTab`).removeClass("endBounceTop")
  }, 209);

  activeChat = null;
  try { window.chatListener() } catch (error) {}
}
