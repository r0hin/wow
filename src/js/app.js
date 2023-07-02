// Use matchMedia to check the user preference
import { StatusBar, Style } from '@capacitor/status-bar';
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

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