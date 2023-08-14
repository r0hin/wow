

const pages = ["./pages/Login.js", "./pages/Router.js", "./pages/Onboard.js", "./pages/Home.js"];


if (!$(`#scriptsContainer`).children().length) {
  pages.forEach(page=>{const a=document.createElement("script");a.type="module",a.src=page,$(`#scriptsContainer`).get(0).appendChild(a)});

}
