import { toastController } from "@ionic/core";

export async function showAlert(title, header, body) {
  const alert = document.createElement('ion-alert');
  alert.header = title;
  alert.subHeader = header;
  alert.message = body;
  alert.buttons = ['OK'];

  document.body.appendChild(alert);
  await alert.present();
}

export async function showToasty(message) {
  const toast = await toastController.create({
    message: message,
    duration: 2500,
    position: "bottom",
    buttons: [{
      text: "OK",
      role: "cancel"
    }]
  });

  await toast.present();
}