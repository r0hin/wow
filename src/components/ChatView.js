class ChatView extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div id="chatViewContainer">
        <div id="chatHeader"></div>
        <div class="chatCanvas"></div>
        <div class="detailsBoxes">
          <div class="streakBox"></div>
          <div class="sendBox"></div>
        </div>
      </div>
    `;
  }
}

customElements.define("chat-view", ChatView);