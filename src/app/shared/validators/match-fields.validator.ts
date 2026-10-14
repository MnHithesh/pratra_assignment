import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Group validator for "confirm password" style fields. */
export function matchFieldsValidator(key: string, confirmKey: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const value = group.get(key)?.value;
    const confirm = group.get(confirmKey)?.value;
    return value && confirm && value !== confirm ? { fieldsMismatch: true } : null;
  };
}
