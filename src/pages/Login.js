import { appleLoginButton } from "../js/auth";

class Login extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <ion-content class="ion-padding">
        <div class="loginCentered centered">
          <center>
            <img class="loginTitleImage" src="./assets/imgs/logo.png" alt="" />
            <h1 class="loginTitle">Welcome to Wow!</h1>
            <p class="loginDescription">Interprative messaging...</p>
            <br><br>
            <button id="appleLoginButton" class="appleLoginButton"> <i class="bx bxl-apple"></i> Sign in with Apple</button>
            <p class="or"> – or –</p>
            <input placeholder="Email" class="field" type="email" name="" id="">
            <input placeholder="Password" class="field" type="password" name="" id="">
            <button id="emailLoginButton" class="loginButton">Continue <i class="bx bx-right-arrow-alt"></i></button>
          </center>
        </div>
      </ion-content>
    `

    $(`#appleLoginButton`).on("click", appleLoginButton)
  }
}

customElements.define('page-login', Login);