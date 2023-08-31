import { appleLoginButton, emailLoginButton } from "../js/auth";

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
            <input placeholder="Email" class="field" type="email" name="" id="email">
            <input placeholder="Password" class="field" type="password" name="" id="password">
            <button id="emailLoginButton" class="loginButton disabled">Continue <i class="bx bx-right-arrow-alt"></i></button>
          </center>
        </div>
      </ion-content>
    `

    $(`#email`).on("input", () => {
      if ($(`#email`).val() && $(`#password`).val()) {
        $(`#emailLoginButton`).removeClass("disabled")
      }
      else {
        $(`#emailLoginButton`).addClass("disabled")
      }
    })

    $(`#password`).on("input", () => {
      if ($(`#email`).val() && $(`#password`).val()) {
        $(`#emailLoginButton`).removeClass("disabled")
      }
      else {
        $(`#emailLoginButton`).addClass("disabled")
      }
    })

    $(`#appleLoginButton`).on("click", appleLoginButton)
    $(`#emailLoginButton`).on("click", () => emailLoginButton($(`#email`).val(), $(`#password`).val()), $(`#emailLoginButton`))
  }
}

customElements.define('page-login', Login);