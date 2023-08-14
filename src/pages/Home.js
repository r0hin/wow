class Home extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <ion-content class="ion-padding">
        <br><br>
        Home
      </ion-content>
    `
  }
}

customElements.define('page-home', Home);