import {inject, Injectable} from '@angular/core';
import {ModalController} from '@ionic/angular/standalone';
import {BarcodeScanningModalComponent} from '../barcode-scanning-modal/barcode-scanning-modal.component';
import {Barcode} from '@capacitor-mlkit/barcode-scanning';
import {AuthModalComponent} from '../auth-modal/auth-modal.component';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private modalController = inject(ModalController);

  async display(
    component: any,
    breakpoint: number = 0.5,
    fullScreenable: boolean = true,
    props?: any
  ) {
    let breakpoints = [0, breakpoint];
    if (fullScreenable) breakpoints.push(0.95);

    const modal = await this.modalController.create({
      component: component,
      breakpoints: breakpoints,
      initialBreakpoint: breakpoint,
      cssClass: 'modal',
      componentProps: props,
    });
    await modal.present();

    const {data} = await modal.onDidDismiss();
    return data;
  }

  async displayAuth() {
    const modal = await this.modalController.create({
      component: AuthModalComponent,
      canDismiss: false,
    });
    await modal.present();

    const {data} = await modal.onDidDismiss();
    return data;
  }

  async displayQrScanner() {
    const element = await this.modalController.create({
      component: BarcodeScanningModalComponent,
      cssClass: 'barcode-scanning-modal', // defined in global.scss
      showBackdrop: false,
    });
    await element.present();

    let result: Barcode | undefined = (await element.onDidDismiss()).data
      ?.barcode;
    return result;
  }
}
