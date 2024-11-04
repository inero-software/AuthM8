import {inject, Injectable} from '@angular/core';
import {AlertController, ToastController} from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);

  async toast(message: string) {
    let toast = await this.toastController.create({
      message: message,
      duration: 2000,
    });
    await toast.present();
  }

  async info(message: string) {
    let alert = await this.alertController.create({
      message: message,
      buttons: ['OK'],
    });
    await alert.present();
    return alert.onDidDismiss();
  }

  private enableDeleteButton(enable: boolean) {
    // This is a workaround for the lack of an API to disable alert buttons in Ionic
    let element = document.querySelector('ion-alert div.alert-button-group button:nth-of-type(2)');
    if (enable) element?.removeAttribute('disabled');
    else element?.setAttribute('disabled', '');
  }

  async dangerousAction(
    title: string,
    message: string,
    confirmation: string,
    cancelText: string,
    actionText: string,
    action: () => void
  ) {
    let enabled = false;

    let alert = await this.alertController.create({
      header: title,
      message: message,
      inputs: [
        {
          name: 'delete',
          type: 'checkbox',
          label: confirmation,
          value: 'delete',
          checked: false,
          handler: (event) => {
            enabled = event.checked!;
            this.enableDeleteButton(enabled);
          },
        },
      ],
      buttons: [
        cancelText,
        {
          text: actionText,
          role: 'destructive',
          handler: () => {
            if (enabled) action();
          },
        },
      ],
    });
    this.enableDeleteButton(enabled);

    await alert.present();
  }

  async confirmableAction(
    message: string,
    cancelText: string,
    actionText: string,
    action: () => void,
    cancel?: () => void,
  ) {
    let alert = await this.alertController.create({
      message: message,
      buttons: [
        {
          text: cancelText,
          role: 'cancel',
          handler: () => {
            if (cancel) cancel();
          },
        },
        {
          text: actionText,
          handler: () => {
            alert.dismiss();
            action();
          },
        },
      ],
    });

    await alert.present();
  }

  async passwordPrompt(message: string) {
    let alert = await this.alertController.create({
      message: message,
      inputs: [
        {
          name: 'input',
          type: 'password',
        },
      ],
      buttons: [
        'Cancel',
        {
          text: 'Ok',
          handler: (data) => {
            return data.password;
          },
        },
      ],
    });

    await alert.present();
    let {data} = await alert.onDidDismiss();
    return data?.values?.input;
  }
}
