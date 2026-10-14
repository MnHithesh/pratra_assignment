import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

import { Airport } from '../../core/models/airport.model';
import { startOfToday } from '../../core/utils/date.util';

export function isAirport(value: unknown): value is Airport {
  return !!value && typeof value === 'object' && 'code' in value;
}

/**
 * The airport inputs are autocompletes. While typing the value is a plain string,
 * and only becomes an Airport once an option is picked. Empty is left to `required`.
 */
export const airportSelectedValidator: ValidatorFn = control => {
  const value = control.value;
  if (value === null || value === '' || isAirport(value)) return null;
  return { airportNotSelected: true };
};

export const notInPastValidator: ValidatorFn = control => {
  const value = control.value as Date | null;
  if (!(value instanceof Date)) return null;
  return value < startOfToday() ? { dateInPast: true } : null;
};

/** Group validator: origin and destination can't be the same airport. */
export function differentAirportsValidator(fromKey: string, toKey: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const from = group.get(fromKey)?.value;
    const to = group.get(toKey)?.value;
    if (isAirport(from) && isAirport(to) && from.code === to.code) {
      return { sameAirport: true };
    }
    return null;
  };
}

/** Group validator: the return date, when given, can't be before the departure. */
export function returnAfterDepartureValidator(departKey: string, returnKey: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const depart = group.get(departKey)?.value;
    const back = group.get(returnKey)?.value;
    if (depart instanceof Date && back instanceof Date && back < depart) {
      return { returnBeforeDeparture: true };
    }
    return null;
  };
}
