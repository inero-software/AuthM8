export type OtpType = 'hotp' | 'totp';
export type OtpCode = { otp: string; expires: number };
export type Algorithm = 'SHA1' | 'SHA256' | 'SHA512';
export type GeneratorParameters = {
  type: OtpType;
  service: string;
  account: string;
  secret: string;
  digits: number;
  algorithm: Algorithm;
  issuer: string;
  period: number;
};
export type GeneratorData = {
  params: GeneratorParameters;
  code: OtpCode;
  secsRemaining: number;
};
