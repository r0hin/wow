import { httpsCallable } from "firebase/functions";
import { functions } from "./auth";
import { showToasty } from "./alerts";
import { openChat } from "./chats";

export function loadData(oldData, newData) {
  // Basically, load the difference between the two objects
  if (!newData) return;

  // Incoming requests

  $(`#incomingRequests`).text(newData.incomingRequests.length || "0")

  if (current == "/requests") { // Live update only if on the requests page
    let incomingRequests = newData.incomingRequests
    if (oldData.incomingRequests && (oldData.incomingRequests.length == newData.incomingRequests.length)) {
      incomingRequests = false;
    }
    loadIncomingRequests(incomingRequests);
  }

  if (current == "/home") {
    let friends = newData.friends;
    if (oldData.friends && (oldData.friends.length == newData.friends.length)) {
      friends = false;
    }
    loadFriends(friends);
  }
}

function loadFriends(data) {
  if (!data) return; // An empty array is still truthy

  console.log("Clearing")
  $(`#friendsList`).empty();

  for (let i = 0; i < data.length; i++) {
    const friend = data[i];

    const a = document.createElement("ion-item");
    a.setAttribute("button", "true");
    a.classList.add("friendItem");
    a.id = `friend${friend.uid}`;
    a.innerHTML = `
      <ion-avatar class="friendItemAvatar" slot="start">
        <profile-photo uid="${friend.uid}"></profile-photo>
      </ion-avatar>
      <ion-label>${friend.username}</ion-label>
    `;

    a.onclick = () => {
      openChat(friend.uid);
    }


    $(`#friendsList`).get(0).appendChild(a);
  }
}

export function loadIncomingRequests(data) {
  if (!data) return;

  $(`#requestsList`).children(`:not(.listItemOut)`).remove();

  for (let i = 0; i < data.length; i++) {
    const request = data[i];

    const a = document.createElement("ion-item");
    a.classList.add("requestItem");
    a.id = `incomingRequest${request.uid}`;
    a.innerHTML = `
      <ion-avatar class="requestItemAvatar" slot="start">
        <profile-photo uid="${request.uid}"></profile-photo>
      </ion-avatar>
      <ion-label>${request.username}</ion-label>
      <button id="incomingRequestReject${request.uid}" class="requestDecisionButton"><i class="bx bx-x"></i></button>
      <button id="incomingRequestAccept${request.uid}" class="requestDecisionButton"><i class="bx bx-check"></i></button>
    `
    $(`#requestsList`).get(0).appendChild(a);

    $(`#incomingRequestReject${request.uid}`).on("click", async () => {
      $(`#incomingRequestReject${request.uid}`).addClass("disabled");
      $(`#incomingRequestAccept${request.uid}`).addClass("disabled");
      const rejectRequest = httpsCallable(functions, "friends-rejectRequest");
      const response = await rejectRequest({
        target: request.uid
      });
      if (!response.data.success) {
        $(`#incomingRequestReject${request.uid}`).removeClass("disabled");
        $(`#incomingRequestAccept${request.uid}`).removeClass("disabled");
        alert(response.data.message);
        return;
      }

      $(`#incomingRequest${request.uid}`).addClass("listItemOut");
      window.setTimeout(() => {
        $(`#incomingRequest${request.uid}`).remove();
      }, 499);
      showToasty("Rejected request!");
    });

    $(`#incomingRequestAccept${request.uid}`).on("click", async () => {
      $(`#incomingRequestReject${request.uid}`).addClass("disabled");
      $(`#incomingRequestAccept${request.uid}`).addClass("disabled");
      const acceptRequest = httpsCallable(functions, "friends-acceptRequest");
      const response = await acceptRequest({
        target: request.uid
      });
      if (!response.data.success) {
        alert(response.data.message);
        $(`#incomingRequestReject${request.uid}`).removeClass("disabled");
        $(`#incomingRequestAccept${request.uid}`).removeClass("disabled");
        return;
      }
      $(`#incomingRequest${request.uid}`).addClass("listItemOut");
      window.setTimeout(() => {
        $(`#incomingRequest${request.uid}`).remove();
      }, 499);
      showToasty("Accepted request!");
    });
  }

  if (!data.length) {
    $(`#noIncoming`).removeClass("hidden");
  }
  else {
    $(`#noIncoming`).addClass("hidden");
  }
}