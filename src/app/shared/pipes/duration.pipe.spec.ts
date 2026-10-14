import { DurationPipe } from './duration.pipe';

describe('DurationPipe', () => {
  const pipe = new DurationPipe();

  it('formats minutes as hours and minutes', () => {
    expect(pipe.transform(170)).toBe('2h 50m');
    expect(pipe.transform(120)).toBe('2h');
    expect(pipe.transform(45)).toBe('45m');
    expect(pipe.transform(null)).toBe('');
  });
});
