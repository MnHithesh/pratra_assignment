import { Routes } from '@angular/router';

import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    title: 'FlyFinder · Find cheap flights',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'flights',
    title: 'Flights · FlyFinder',
    loadComponent: () => import('./features/flights/flight-results/flight-results.component').then(m => m.FlightResultsComponent),
  },
  {
    path: 'flights/:id',
    title: 'Flight details · FlyFinder',
    loadComponent: () => import('./features/flights/flight-details/flight-details.component').then(m => m.FlightDetailsComponent),
  },
  {
    path: 'login',
    title: 'Log in · FlyFinder',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'signup',
    title: 'Sign up · FlyFinder',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/signup/signup.component').then(m => m.SignupComponent),
  },
  {
    path: 'book/:flightId',
    title: 'Booking · FlyFinder',
    canActivate: [authGuard],
    loadComponent: () => import('./features/booking/booking-form/booking-form.component').then(m => m.BookingFormComponent),
  },
  {
    path: 'bookings',
    title: 'My bookings · FlyFinder',
    canActivate: [authGuard],
    loadComponent: () => import('./features/booking/my-bookings/my-bookings.component').then(m => m.MyBookingsComponent),
  },
  {
    path: 'bookings/:id',
    title: 'Booking details · FlyFinder',
    canActivate: [authGuard],
    loadComponent: () => import('./features/booking/booking-details/booking-details.component').then(m => m.BookingDetailsComponent),
  },
  {
    path: '**',
    title: 'Page not found · FlyFinder',
    loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent),
  },
];
