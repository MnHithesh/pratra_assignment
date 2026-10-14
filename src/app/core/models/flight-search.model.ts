export interface FlightSearchCriteria {
  from: string;
  to: string;
  /** yyyy-MM-dd */
  departDate: string;
  /** yyyy-MM-dd, only set for return trips */
  returnDate: string | null;
  passengers: number;
}

export type TripLeg = 'onward' | 'return';

export type SortOption = 'price' | 'duration' | 'departure';

export interface FlightFilters {
  maxPrice: number | null;
  /** Empty list means "any number of stops". 2 stands for "2 or more". */
  stops: number[];
  /** Empty list means "any airline". */
  airlines: string[];
}

export interface FilterOptions {
  airlines: string[];
  stops: number[];
  minPrice: number;
  maxPrice: number;
}
