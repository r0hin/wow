class Onboard extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <ion-content class="ion-padding">
        <br><br>
        Onboarding
      </ion-content>
    `
  }
}

customElements.define('page-onboard', Onboard);