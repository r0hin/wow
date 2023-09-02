export function loadSettings() {
  if (window.user) {
    $(`#emailAddress`).text(window.user.email || "Not logged in");
  }

  if (window.cacheUser) {
    $(`#usernameSetting`).text(window.cacheUser.username || "No username");

  }
}