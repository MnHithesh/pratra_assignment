import { Flight, FlightSchedule } from '../models/flight.model';
import { FlightFilters, FilterOptions, SortOption } from '../models/flight-search.model';
import { FareBreakdown } from '../models/booking.model';
import { parseIsoDate } from './date.util';

export function toFlight(schedule: FlightSchedule, travelDate: string): Flight {
  const date = parseIsoDate(travelDate) ?? new Date();
  const [hours, minutes] = schedule.departure.split(':').map(Number);

  const departureTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes);
  const arrivalTime = new Date(departureTime.getTime() + schedule.durationMinutes * 60_000);

  return { ...schedule, travelDate, departureTime, arrivalTime };
}

export function applyFilters(flights: Flight[], filters: FlightFilters): Flight[] {
  return flights.filter(flight => {
    if (filters.maxPrice != null && flight.price > filters.maxPrice) return false;
    if (filters.stops.length && !filters.stops.includes(Math.min(flight.stops, 2))) return false;
    if (filters.airlines.length && !filters.airlines.includes(flight.airline)) return false;
    return true;
  });
}

export function sortFlights(flights: Flight[], sort: SortOption): Flight[] {
  const byDeparture = (a: Flight, b: Flight) => a.departureTime.getTime() - b.departureTime.getTime();
  const compare: Record<SortOption, (a: Flight, b: Flight) => number> = {
    price: (a, b) => a.price - b.price || byDeparture(a, b),
    duration: (a, b) => a.durationMinutes - b.durationMinutes || a.price - b.price,
    departure: byDeparture,
  };
  return [...flights].sort(compare[sort]);
}

export function buildFilterOptions(flights: Flight[]): FilterOptions {
  const prices = flights.map(f => f.price);
  return {
    airlines: [...new Set(flights.map(f => f.airline))].sort(),
    stops: [...new Set(flights.map(f => Math.min(f.stops, 2)))].sort(),
    // Rounded to the nearest 100 so the price slider (step 100) can reach both ends.
    minPrice: prices.length ? Math.floor(Math.min(...prices) / 100) * 100 : 0,
    maxPrice: prices.length ? Math.ceil(Math.max(...prices) / 100) * 100 : 0,
  };
}

/**
 * The listed price is the all-in fare per person. We split out an approximate
 * tax component only so the summary looks like a real fare breakdown.
 */
export function calculateFare(pricePerPerson: number, passengers: number, currency = 'INR'): FareBreakdown {
  const total = pricePerPerson * passengers;
  const taxes = Math.round(total * 0.14);
  return { baseFare: total - taxes, taxes, total, currency };
}
