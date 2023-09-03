import { loadData, loadIncomingRequests } from "./data";
import { loadSettings } from "./settings";

window.current = "/";

const pages = ["Login.js", "Router.js", "Onboard.js", "Home.js", "Requests.js"];
const components = ["NavBar.js", "AddFriend.js", "ProfilePhoto.js", "ChatView.js"]

if (!$(`#scriptsContainer`).children().length) {
  pages.forEach(page=>{const a=document.createElement("script");a.type="module",a.src=`./pages/${page}`,$(`#scriptsContainer`).get(0).appendChild(a)});
  components.forEach(page=>{const a=document.createElement("script");a.type="module",a.src=`./components/${page}`,$(`#scriptsContainer`).get(0).appendChild(a)});
}

const routerElement = $(`#router`)
routerElement.on("ionRouteDidChange", async (ev) => {
  current = ev.detail.to;
  if (current == "/home") {
    loadSettings();
    loadData({}, window.cacheUser)
  }
  else if (current == "/requests") {
    loadIncomingRequests(cacheUser.incomingRequests)
  }
});