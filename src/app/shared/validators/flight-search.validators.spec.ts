import { FormControl, FormGroup } from '@angular/forms';

import { addDays, startOfToday } from '../../core/utils/date.util';
import {
  airportSelectedValidator,
  differentAirportsValidator,
  notInPastValidator,
  returnAfterDepartureValidator,
} from './flight-search.validators';

const BLR = { code: 'BLR', city: 'Bengaluru', name: 'Kempegowda International Airport', country: 'India' };
const DEL = { code: 'DEL', city: 'New Delhi', name: 'Indira Gandhi International Airport', country: 'India' };

describe('flight search validators', () => {
  it('airportSelected: needs an option from the list, leaves empty values to required', () => {
    expect(airportSelectedValidator(new FormControl('Beng'))).toEqual({ airportNotSelected: true });
    expect(airportSelectedValidator(new FormControl(BLR))).toBeNull();
    expect(airportSelectedValidator(new FormControl(''))).toBeNull();
  });

  it('notInPast: rejects yesterday, accepts today', () => {
    expect(notInPastValidator(new FormControl(addDays(startOfToday(), -1)))).toEqual({ dateInPast: true });
    expect(notInPastValidator(new FormControl(startOfToday()))).toBeNull();
  });

  it('differentAirports: flags the same origin and destination', () => {
    const validator = differentAirportsValidator('from', 'to');
    expect(validator(new FormGroup({ from: new FormControl(BLR), to: new FormControl(BLR) }))).toEqual({ sameAirport: true });
    expect(validator(new FormGroup({ from: new FormControl(BLR), to: new FormControl(DEL) }))).toBeNull();
  });

  it('returnAfterDeparture: return can be the same day but not earlier', () => {
    const validator = returnAfterDepartureValidator('depart', 'back');
    const day = startOfToday();
    const group = (back: Date | null) => new FormGroup({ depart: new FormControl(day), back: new FormControl(back) });

    expect(validator(group(addDays(day, -1)))).toEqual({ returnBeforeDeparture: true });
    expect(validator(group(day))).toBeNull();
    expect(validator(group(null))).toBeNull();
  });
});
