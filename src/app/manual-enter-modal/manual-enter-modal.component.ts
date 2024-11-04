import {Component, inject, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {IonicModule} from "@ionic/angular";
import {Algorithm} from '../models/model';
import {ModalController} from '@ionic/angular/standalone';
import {TEXTS} from '../constants/texts';
import {notEmpty, validOtpKey} from '../common/validators';

@Component({
  selector: 'app-manual-enter-modal',
  templateUrl: './manual-enter-modal.component.html',
  styleUrls: ['./manual-enter-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule],
})
export class ManualEnterModalComponent implements OnInit {
  private modalController = inject(ModalController);
  @Input() generator = {
    type: 'totp',
    service: '',
    account: '',
    secret: '',
    digits: 6,
    algorithm: 'SHA1',
    issuer: '',
    period: 30,
  };
  text = TEXTS.form;
  cancelText = TEXTS.cancel;

  form: FormGroup | undefined;

  ngOnInit() {
    this.form = new FormGroup({
      service: new FormControl(this.generator.service, {validators: [Validators.required, notEmpty]}),
      account: new FormControl(this.generator.account, {validators: [Validators.required, notEmpty]}),
      secret: new FormControl(this.generator.secret, {validators: [Validators.required, notEmpty, validOtpKey]}),
      digits: new FormControl(this.generator.digits, {validators: [Validators.required, Validators.min(3), Validators.max(16)]}),
      algorithm: new FormControl<Algorithm>(this.generator.algorithm as Algorithm, Validators.required),
      period: new FormControl(this.generator.period, Validators.required),
    });
  }

  async submit() {
    if (this.form!.valid) {
      await this.modalController.dismiss({
        type: 'totp',
        service: this.form!.value.service!,
        account: this.form!.value.account!,
        secret: (this.form!.value.secret as string).replace(/\s/g, '').toUpperCase(),
        digits: this.form!.value.digits!,
        algorithm: this.form!.value.algorithm!,
        issuer: this.form!.value.service!,
        period: this.form!.value.period!,
      });
    }
  }

  async cancel() {
    await this.modalController.dismiss();
  }
}
