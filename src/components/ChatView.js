class ChatView extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div id="chatViewContainer">
        <h1>Chat View</h1>
      </div>
    `;
  }
}

customElements.define("chat-view", ChatView);