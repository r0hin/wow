

const pages = ["Login.js", "Router.js", "Onboard.js", "Home.js"];
const components = ["NavBar.js", "AddFriend.js", "ProfilePhoto.js"]

if (!$(`#scriptsContainer`).children().length) {
  pages.forEach(page=>{const a=document.createElement("script");a.type="module",a.src=`./pages/${page}`,$(`#scriptsContainer`).get(0).appendChild(a)});
  components.forEach(page=>{const a=document.createElement("script");a.type="module",a.src=`./components/${page}`,$(`#scriptsContainer`).get(0).appendChild(a)});
}
