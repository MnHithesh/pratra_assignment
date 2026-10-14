export type PassengerTitle = 'Mr' | 'Ms' | 'Mrs';

export interface Passenger {
  title: PassengerTitle;
  firstName: string;
  lastName: string;
  age: number;
}

/** Copy of the flight at the time of booking, so old bookings still render if the schedule changes. */
export interface BookedFlight {
  airline: string;
  airlineCode: string;
  flightNumber: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  stops: number;
}

export interface FareBreakdown {
  baseFare: number;
  taxes: number;
  total: number;
  currency: string;
}

export interface NewBooking {
  flightId: string;
  travelDate: string;
  flight: BookedFlight;
  passengers: Passenger[];
  contact: { email: string; phone: string };
  fare: FareBreakdown;
}

export interface Booking extends NewBooking {
  id: string;
  userId: number;
  reference: string;
  status: 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
}
