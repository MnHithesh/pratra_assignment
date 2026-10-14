import { ParamMap, Params } from '@angular/router';

import { FlightSearchCriteria } from '../models/flight-search.model';
import { parseIsoDate } from './date.util';

const AIRPORT_CODE = /^[A-Z]{3}$/;

/** Search criteria live in the URL so results can be refreshed, shared and navigated back to. */
export function criteriaToParams(criteria: FlightSearchCriteria): Params {
  return {
    from: criteria.from,
    to: criteria.to,
    depart: criteria.departDate,
    return: criteria.returnDate ?? undefined,
    pax: criteria.passengers,
  };
}

/** Returns null when the URL doesn't describe a usable search. */
export function criteriaFromParams(params: ParamMap): FlightSearchCriteria | null {
  const from = params.get('from')?.toUpperCase() ?? '';
  const to = params.get('to')?.toUpperCase() ?? '';
  const departDate = params.get('depart') ?? '';
  const returnDate = params.get('return');
  const passengers = Number(params.get('pax') ?? 1);

  const valid =
    AIRPORT_CODE.test(from) &&
    AIRPORT_CODE.test(to) &&
    from !== to &&
    parseIsoDate(departDate) !== null &&
    (!returnDate || parseIsoDate(returnDate) !== null) &&
    Number.isInteger(passengers) &&
    passengers >= 1 &&
    passengers <= 9;

  return valid ? { from, to, departDate, returnDate: returnDate || null, passengers } : null;
}

export function sameCriteria(a: FlightSearchCriteria | null, b: FlightSearchCriteria | null): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
