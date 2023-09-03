export function openChat(friend) {
  $(`#messagesTab`).addClass("chatOpen")
  $(`#messagesTab`).addClass("endBounceBottom")
  window.setTimeout(() => {
    $(`#messagesTab`).removeClass("endBounceBottom")
  }, 200)
}

export function exitChat() {
  $(`#messagesTab`).removeClass("chatOpen")
  $(`#messagesTab`).addClass("endBounceTop")
  window.setTimeout(() => {
    $(`#messagesTab`).removeClass("endBounceTop")
  }, 200);
}