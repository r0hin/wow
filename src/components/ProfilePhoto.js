class ProfilePhoto extends HTMLElement {
  connectedCallback() {
    const photoID = this.getAttribute("uid") + Date.now();

    this.innerHTML = `
      <div class="pfpContainer">
        <img id="${photoID}" class="pfp" alt="" />
      </div>
    `

    const img = new Image();
    const url = `https://firebasestorage.googleapis.com/v0/b/social-721e8.appspot.com/o/profile%2F${this.getAttribute("uid")}.png?alt=media`
    img.onload = () => {
      $(`#${photoID}`).attr("src", url);
    }
    img.onerror = () => {
      $(`#${photoID}`).attr("src", `https://api.dicebear.com/7.x/bottts/png?seed=${this.getAttribute("uid")}`);
    }
    img.src = url;
  }
}

customElements.define('profile-photo', ProfilePhoto);