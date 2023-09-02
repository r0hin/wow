class Requests extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-back-button default-href="/home"></ion-back-button>
          </ion-buttons>
          <ion-title>Incoming Requests</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-list inset="true" id="requestsList"></ion-list>
        <div id="noIncoming" class="noItems hidden">
          <center>
            <i class="bx bx-sad"></i>
          </center>
        </div>
      </ion-content>
    `;
  }
}

customElements.define('page-requests', Requests);
