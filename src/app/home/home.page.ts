import {Component, inject} from '@angular/core';
import {IonicModule} from '@ionic/angular';
import {addIcons} from 'ionicons';
import {add, copyOutline, ellipsisVertical, qrCode, text} from 'ionicons/icons';
import {OtpGeneratorsService} from '../services/otp-generators.service';
import {ModalService} from '../services/modal-service';
import {PersistenceService} from '../services/persistence.service';
import {ManualEnterModalComponent} from '../manual-enter-modal/manual-enter-modal.component';
import {GeneratorsListComponent} from "./generators-list/generators-list.component";
import {TEXTS} from '../constants/texts';
import {AlertService} from '../services/alert.service';
import {ViewWillEnter} from '@ionic/angular';
import {App} from '@capacitor/app';
import {Capacitor} from "@capacitor/core";
import {GeneratorParameters} from "../models/model";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, GeneratorsListComponent],
})
export class HomePage implements ViewWillEnter {
  private persistenceService = inject(PersistenceService);
  private otpGeneratorsService = inject(OtpGeneratorsService);
  private modalService = inject(ModalService);
  private alertService = inject(AlertService);
  text = TEXTS.home;

  generators = this.persistenceService.generators;

  constructor() {
    addIcons({add, qrCode, text, ellipsisVertical, copyOutline});
  }

  ionViewWillEnter() {
    this.modalService.displayAuth().then(async (auth) => {
      if (auth) {
        await this.persistenceService.load();
      } else {
        if (Capacitor.getPlatform() === 'android') {
          await App.exitApp();
        }
      }
    });
  }

  async addTextClicked() {
    let generator: GeneratorParameters | undefined =
      await this.modalService.display(ManualEnterModalComponent, 1.0, false);
    if (generator) await this.persistenceService.saveGenerator(generator);
  }

  async addQrClicked() {
    let barcode = await this.modalService.displayQrScanner();
    if (barcode === undefined) return;

    try {
      let generator = this.otpGeneratorsService.parseQrData(
        barcode.displayValue
      );
      await this.persistenceService.saveGenerator(generator);
    } catch (e) {
      await this.alertService.info(this.text.invalidQr);
      console.error(e);
    }
  }
}
