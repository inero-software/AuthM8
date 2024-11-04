import {AbstractControl} from '@angular/forms';

export function notEmpty(control: AbstractControl) {
  if (control.value.trim().length === 0) {
    return {notEmpty: true};
  }
  return null;
}

export function validOtpKey(control: AbstractControl) {
  let value = (control.value as string).replace(/\s/g, '').toUpperCase();
  if (value.length !== 32 || !/^[A-Z2-7]*$/i.test(value)) {
    return {validKey: true};
  }
  return null;
}
