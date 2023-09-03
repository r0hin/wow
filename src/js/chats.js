window.scrollReturn = false;

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

  scrollReturn = true;
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
}
