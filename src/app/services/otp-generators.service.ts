import {Injectable} from '@angular/core';
import {TOTP} from 'totp-generator';
import {GeneratorParameters, OtpType, Algorithm} from "../models/model";

@Injectable({
  providedIn: 'root',
})
export class OtpGeneratorsService {
  parseQrData(data: string): GeneratorParameters {
    // input format: otpauth://{TYPE}/{SERVICE}:{ACCOUNT}?{PARAMTERS}
    // type is either hotp or totp
    // parameters are key value pairs separated by &
    // they include a secret, digits, algorithm, issuer, and period
    // secret is required
    // digits is optional, defaults to 6
    // algorithm is optional, defaults to SHA1
    // issuer is optional defaults to {SERVICE}
    // period is optional, defaults to 30 (seconds)

    const url = new URL(data);
    const type = url.host;
    let [service, account] = url.pathname.slice(1).split(':'); // pathname includes the leading slash: /{SERVICE}:{ACCOUNT}

    // Extract the parameters
    const params = url.searchParams;

    // Extract and set default values for the parameters
    const secret = params.get('secret');
    if (!secret) {
      throw new Error('Secret is required');
    }

    const digits = params.get('digits') ? parseInt(params.get('digits')!) : 6;
    const algorithm = params.get('algorithm') || 'SHA1';
    let issuer = params.get('issuer') || service;
    const period = params.get('period') ? parseInt(params.get('period')!) : 30;

    if (type !== 'hotp' && type !== 'totp') {
      throw new Error('Invalid type');
    }
    if (
      algorithm !== 'SHA1' &&
      algorithm !== 'SHA256' &&
      algorithm !== 'SHA512'
    ) {
      throw new Error('Invalid algorithm');
    }

    // Decode the parameters
    issuer = decodeURIComponent(issuer);
    service = decodeURIComponent(service);
    account = decodeURIComponent(account);

    return {
      type: type as OtpType,
      service,
      account,
      secret,
      digits,
      algorithm: algorithm as Algorithm,
      issuer,
      period,
    };
  }

  private keycloakToTOTPAlgorithm(algorithm: Algorithm) {
    switch (algorithm) {
      case 'SHA1':
        return 'SHA-1';
      case 'SHA256':
        return 'SHA-256';
      case 'SHA512':
        return 'SHA-512';
    }
  }

  generateOtp(generator: GeneratorParameters) {
    return TOTP.generate(generator.secret, {
      algorithm: this.keycloakToTOTPAlgorithm(generator.algorithm),
      digits: generator.digits,
      period: generator.period,
    });
  }
}
