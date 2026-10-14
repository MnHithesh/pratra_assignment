import { convertToParamMap } from '@angular/router';

import { criteriaFromParams, criteriaToParams } from './search-params.util';

describe('search params', () => {
  it('round-trips criteria through query params', () => {
    const criteria = { from: 'BLR', to: 'DEL', departDate: '2030-05-10', returnDate: '2030-05-15', passengers: 2 };
    expect(criteriaFromParams(convertToParamMap(criteriaToParams(criteria)))).toEqual(criteria);
  });

  it('defaults to one passenger and no return', () => {
    const params = convertToParamMap({ from: 'blr', to: 'del', depart: '2030-05-10' });
    expect(criteriaFromParams(params)).toEqual({
      from: 'BLR',
      to: 'DEL',
      departDate: '2030-05-10',
      returnDate: null,
      passengers: 1,
    });
  });

  it('rejects broken links', () => {
    expect(criteriaFromParams(convertToParamMap({ from: 'BLR' }))).toBeNull();
    expect(criteriaFromParams(convertToParamMap({ from: 'BLR', to: 'BLR', depart: '2030-05-10' }))).toBeNull();
    expect(criteriaFromParams(convertToParamMap({ from: 'BLR', to: 'DEL', depart: 'tomorrow' }))).toBeNull();
    expect(criteriaFromParams(convertToParamMap({ from: 'BLR', to: 'DEL', depart: '2030-05-10', pax: '12' }))).toBeNull();
  });
});
