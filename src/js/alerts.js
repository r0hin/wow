export async function showAlert(title, header, body) {
  const alert = document.createElement('ion-alert');
  alert.header = title;
  alert.subHeader = header;
  alert.message = body;
  alert.buttons = ['OK'];

  document.body.appendChild(alert);
  await alert.present();
}