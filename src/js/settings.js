export function loadSettings() {
  console.log("Filling in now")
  if (window.user) {
    console.log(window.user)
    $(`#emailAddress`).text(window.user.email || "Not logged in");
  }

  if (window.cacheUser) {
    console.log(window.cacheUser)
    $(`#usernameSetting`).text(window.cacheUser.username || "No username");
  }
}