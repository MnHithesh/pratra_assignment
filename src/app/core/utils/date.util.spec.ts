import { addDays, dayDifference, parseIsoDate, toIsoDate } from './date.util';

describe('date utils', () => {
  it('formats dates in local time', () => {
    expect(toIsoDate(new Date(2030, 0, 5, 23, 59))).toBe('2030-01-05');
  });

  it('parses valid dates and rejects invalid ones', () => {
    expect(parseIsoDate('2030-03-09')).toEqual(new Date(2030, 2, 9));
    expect(parseIsoDate('2030-02-31')).toBeNull();
    expect(parseIsoDate('09/03/2030')).toBeNull();
    expect(parseIsoDate(null)).toBeNull();
  });

  it('counts calendar days between dates', () => {
    expect(dayDifference(new Date(2030, 0, 1, 23, 0), new Date(2030, 0, 2, 1, 0))).toBe(1);
    expect(dayDifference(new Date(2030, 0, 1), addDays(new Date(2030, 0, 1), 30))).toBe(30);
  });
});
