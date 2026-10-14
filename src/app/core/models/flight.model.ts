export interface Layover {
  airport: string;
  city: string;
  durationMinutes: number;
}

/**
 * A flight as the API returns it. Flights run daily, so the API only knows the
 * local departure time ("HH:mm"), not a full date.
 */
export interface FlightSchedule {
  id: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  from: string;
  to: string;
  departure: string;
  durationMinutes: number;
  stops: number;
  layovers: Layover[];
  price: number;
  currency: string;
  aircraft: string;
  cabinClass: string;
  seatsLeft: number;
  terminal: { departure: string; arrival: string };
  baggage: { cabin: string; checkIn: string };
  refundable: boolean;
  meal: string;
  wifi: boolean;
}

/** A schedule placed on a specific travel date. This is what the UI works with. */
export interface Flight extends FlightSchedule {
  travelDate: string;
  departureTime: Date;
  arrivalTime: Date;
}
