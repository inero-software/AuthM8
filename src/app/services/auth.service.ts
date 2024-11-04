import {Injectable} from '@angular/core';
import {BiometricAuth, CheckBiometryResult} from '@aparajita/capacitor-biometric-auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private biometryInfo!: CheckBiometryResult;

  constructor() {
    this.init();
  }

  async init() {
    this.updateBiometryInfo(await BiometricAuth.checkBiometry());
    await BiometricAuth.addResumeListener((i) => this.updateBiometryInfo(i));
  }

  private updateBiometryInfo(info: CheckBiometryResult) {
    this.biometryInfo = info;
  }

  async isConfigured() {
    return this.biometryInfo
      ? Promise.resolve(this.biometryInfo.isAvailable)
      : await BiometricAuth.checkBiometry().then((info) => info.isAvailable);
  }

  async authenticate() {
    try {
      await BiometricAuth.authenticate({
        allowDeviceCredential: true,
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}
