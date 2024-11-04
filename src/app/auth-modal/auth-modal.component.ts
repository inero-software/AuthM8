import {Component, inject, OnInit} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {AuthService} from '../services/auth.service';
import {AlertService} from '../services/alert.service';
import {TEXTS} from '../constants/texts';
import {App} from '@capacitor/app';
import {addIcons} from 'ionicons';
import {lockClosedOutline} from 'ionicons/icons';
import {IonicModule} from '@ionic/angular';

@Component({
  selector: 'app-auth-modal',
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class AuthModalComponent implements OnInit {
  private authService = inject(AuthService);
  private alertService = inject(AlertService);
  private modalController = inject(ModalController);
  text = TEXTS.auth;

  constructor() {
    addIcons({lockClosedOutline});
  }

  ngOnInit() {
    this.authService.isConfigured().then(async (configured) => {
      if (!configured) {
        this.alertService
          .info(this.text.unsecuredDevice)
          .then(() => App.exitApp());
      } else {
        await this.auth();
      }
    });
  }

  async auth() {
    let authenticated = await this.authService.authenticate();

    if (!authenticated) {
      await this.alertService.confirmableAction(
        this.text.failure,
        TEXTS.cancel,
        TEXTS.ok,
        () => this.auth(),
        () => App.exitApp()
      );
      return;
    }

    let modal = await this.modalController.getTop();
    if (modal) {
      modal.canDismiss = true;
    }

    await this.modalController.dismiss(authenticated);
  }
}
