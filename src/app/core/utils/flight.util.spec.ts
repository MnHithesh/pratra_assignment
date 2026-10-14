import { Flight, FlightSchedule } from '../models/flight.model';
import { applyFilters, buildFilterOptions, calculateFare, sortFlights, toFlight } from './flight.util';

function schedule(overrides: Partial<FlightSchedule> = {}): FlightSchedule {
  return {
    id: '1',
    airline: 'IndiGo',
    airlineCode: '6E',
    flightNumber: '6E 101',
    from: 'BLR',
    to: 'DEL',
    departure: '10:00',
    durationMinutes: 170,
    stops: 0,
    layovers: [],
    price: 5000,
    currency: 'INR',
    aircraft: 'A320neo',
    cabinClass: 'Economy',
    seatsLeft: 9,
    terminal: { departure: '1', arrival: '3' },
    baggage: { cabin: '7 kg', checkIn: '15 kg' },
    refundable: false,
    meal: 'Meals available to buy',
    wifi: false,
    ...overrides,
  };
}

const flight = (overrides: Partial<FlightSchedule> = {}): Flight => toFlight(schedule(overrides), '2030-05-10');

describe('flight utils', () => {
  describe('toFlight', () => {
    it('places the schedule on the travel date and works out the arrival', () => {
      const result = toFlight(schedule({ departure: '22:30', durationMinutes: 150 }), '2030-05-10');

      expect(result.departureTime).toEqual(new Date(2030, 4, 10, 22, 30));
      expect(result.arrivalTime).toEqual(new Date(2030, 4, 11, 1, 0));
      expect(result.travelDate).toBe('2030-05-10');
    });
  });

  describe('applyFilters', () => {
    const flights = [
      flight({ id: 'a', price: 4000, stops: 0, airline: 'IndiGo' }),
      flight({ id: 'b', price: 6000, stops: 1, airline: 'Air India' }),
      flight({ id: 'c', price: 9000, stops: 2, airline: 'Emirates' }),
      flight({ id: 'd', price: 7000, stops: 3, airline: 'Emirates' }),
    ];
    const ids = (list: Flight[]) => list.map(f => f.id);

    it('returns everything when no filter is set', () => {
      expect(ids(applyFilters(flights, { maxPrice: null, stops: [], airlines: [] }))).toEqual(['a', 'b', 'c', 'd']);
    });

    it('filters by max price', () => {
      expect(ids(applyFilters(flights, { maxPrice: 6000, stops: [], airlines: [] }))).toEqual(['a', 'b']);
    });

    it('treats 2 as "2 or more" stops', () => {
      expect(ids(applyFilters(flights, { maxPrice: null, stops: [2], airlines: [] }))).toEqual(['c', 'd']);
    });

    it('combines filters', () => {
      const result = applyFilters(flights, { maxPrice: 8000, stops: [0, 2], airlines: ['Emirates'] });
      expect(ids(result)).toEqual(['d']);
    });
  });

  describe('sortFlights', () => {
    const flights = [
      flight({ id: 'late-cheap', departure: '20:00', price: 3000, durationMinutes: 200 }),
      flight({ id: 'early-fast', departure: '06:00', price: 5000, durationMinutes: 120 }),
      flight({ id: 'mid', departure: '12:00', price: 4000, durationMinutes: 150 }),
    ];

    it('sorts by price, duration or departure without mutating the input', () => {
      expect(sortFlights(flights, 'price').map(f => f.id)).toEqual(['late-cheap', 'mid', 'early-fast']);
      expect(sortFlights(flights, 'duration').map(f => f.id)).toEqual(['early-fast', 'mid', 'late-cheap']);
      expect(sortFlights(flights, 'departure').map(f => f.id)).toEqual(['early-fast', 'mid', 'late-cheap']);
      expect(flights[0].id).toBe('late-cheap');
    });
  });

  describe('buildFilterOptions', () => {
    it('collects airlines and stops and rounds the price range to 100s', () => {
      const options = buildFilterOptions([
        flight({ airline: 'IndiGo', stops: 0, price: 4049 }),
        flight({ airline: 'Air India', stops: 3, price: 7951 }),
        flight({ airline: 'IndiGo', stops: 1, price: 5000 }),
      ]);

      expect(options).toEqual({ airlines: ['Air India', 'IndiGo'], stops: [0, 1, 2], minPrice: 4000, maxPrice: 8000 });
    });

    it('handles an empty list', () => {
      expect(buildFilterOptions([])).toEqual({ airlines: [], stops: [], minPrice: 0, maxPrice: 0 });
    });
  });

  describe('calculateFare', () => {
    it('keeps the total equal to price times passengers', () => {
      const fare = calculateFare(5449, 2);
      expect(fare.total).toBe(10898);
      expect(fare.baseFare + fare.taxes).toBe(fare.total);
    });
  });
});
