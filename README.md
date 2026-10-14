# FlyFinder – Flight Search (Angular 18)

A small flight search and booking app built for the Angular REST API integration task.
You can search flights, filter and sort the results, open a flight's details, and book it
after logging in. Everything runs against a local mock REST API, so there are no API keys to set up.

**Demo login:** `mnhithesh26@gmail.com` / `12345` (or create a new account from the Sign up page)

## Setup

Requirements: Node 18.19+ (tested on Node 24) and npm.

```bash
npm install
npm start
```

`npm start` runs two things together:

| What            | URL                      |
| --------------- | ------------------------ |
| Angular app     | http://localhost:4200    |
| Mock REST API   | http://localhost:3000    |

The Angular dev server proxies `/api/*` to the mock API (`proxy.conf.json`), so there are no CORS issues.

Other scripts:

```bash
npm run serve        # only the Angular app
npm run mock:api     # only the mock API
npm run mock:reset   # wipe bookings/new users and start from the seed data again
npm test             # unit tests (Karma + Jasmine)
npm run build        # production build
```

## Technologies used

- Angular 18 (standalone components, signals, new control flow `@if` / `@for` / `@let`)
- Angular Material 18 with a custom M3 theme
- Reactive Forms (typed), including custom and cross-field validators
- HttpClient with functional interceptors
- RxJS for search, filtering, sorting and request handling
- Angular Router with lazy-loaded routes and functional guards
- json-server 0.17 (with a small custom Express layer) as the mock API
- Karma + Jasmine for unit tests

## Features

- **Hero landing page** with the search form: From/To with airport autocomplete, departure date,
  optional return date, travellers (1–9), plus quick links to popular routes. The landing page fits on
  a laptop screen without scrolling.
- **Results page** with loading, empty and error states (with retry):
  - Filters for max price (slider), stops and airline
  - Sorting by cheapest, fastest or earliest
  - Onward/return toggle when a return date is chosen
  - "Modify search" without leaving the page
- **Flight details page**: timings, terminals, layovers, baggage, meal, Wi-Fi, refund policy, seats left and a fare summary.
- **Login before booking**: "Book this flight" is protected by an auth guard. Guests are sent to
  login and brought back to the booking afterwards (`returnUrl`).
- **Booking form**: one set of fields per traveller (dynamic `FormArray`) and contact details with validation.
- **Booking confirmation** with a small plane-and-tick animation (plain CSS/SVG, respects `prefers-reduced-motion`).
- **My bookings**: upcoming and past trips for the logged-in user.
- **Two layouts**: a public header (Log in / Sign up) and a logged-in header with all the menus
  (Search flights, My bookings, profile menu, Log out). Both share the same footer.
- Responsive down to small phones. On mobile the header menus collapse into a menu button
  and the filters into a toggle panel.

## API details

The mock API lives in `mock-api/`:

- `seed.json`: 10 airports, 168 flights on 28 routes (Indian domestic plus Dubai and Singapore),
  and one demo user
- `server.js`: json-server plus a few custom routes
- `db.json`: created from the seed on first start and git-ignored, so test bookings don't end up in the repo

| Method | Endpoint                         | Notes                                                   |
| ------ | -------------------------------- | ------------------------------------------------------- |
| GET    | `/airports`                      | Airport list for the autocomplete                       |
| GET    | `/flights?from=BLR&to=DEL`       | Flights on a route                                      |
| GET    | `/flights/:id`                   | One flight                                              |
| POST   | `/auth/login`                    | `{ email, password }` → `{ token, user }`               |
| POST   | `/auth/signup`                   | `{ name, email, password }` → `{ token, user }`         |
| GET    | `/bookings`                      | Auth required. Only returns the current user's bookings |
| GET    | `/bookings/:id`                  | Auth required. 404 if it belongs to someone else        |
| POST   | `/bookings`                      | Auth required. Server adds id, reference, status, date  |

Every response is delayed by about 600 ms so the loading states are visible. You can change
this with `MOCK_API_LATENCY=0 npm run mock:api`. The `/users` collection is blocked so passwords
are never returned.

## Project structure

```
src/app
├── core/                  # app-wide, no UI
│   ├── guards/            # authGuard, guestGuard
│   ├── http/              # interceptors, ApiError, retry helper, API base URL token
│   ├── models/
│   ├── services/          # FlightService, AirportService, AuthService, BookingService
│   └── utils/             # pure functions: dates, filtering/sorting, URL <-> criteria
├── layout/                # public + member layouts, headers, footer, brand
├── shared/                # reusable UI: search form, flight card, timeline, loading/message panels, pipes, validators
└── features/
    ├── home/              # hero + search
    ├── flights/           # results, filters, details
    ├── auth/              # login, signup
    ├── booking/           # booking form, confirmation (+ animation), my bookings
    └── not-found/
```

## Key implementation decisions

- **Search criteria live in the URL** (`/flights?from=BLR&to=DEL&depart=2026-11-20&pax=2`).
  Refresh, back/forward and sharing a link all work, and the results page just reacts to `queryParamMap`.
- **RxJS on the results page:**
  - `switchMap` cancels an in-flight request when a new search starts.
  - `combineLatest` merges the results with the filter and sort streams.
  - `debounceTime` + `distinctUntilChanged` stop the list from recalculating on every slider tick.
  - `shareReplay` stops the HTTP call from running once per subscriber.
  - A `Subject` drives the "Try again" button.
- **Each page has a single view state**: `loading | loaded | error`, built with `startWith` / `catchError`
  and rendered with `@switch`. This avoids juggling separate `isLoading` / `error` flags.
- **Error handling is layered:**
  - The error interceptor turns every `HttpErrorResponse` into an `ApiError` with a readable message,
    and logs the user out on a 401 (expired token).
  - Services retry once, but only on network or 5xx errors, so a 404 or 400 is not retried
    and a POST booking is never retried.
  - Pages show the message with a retry or a way out.
- **Filtering and sorting are pure functions** (`core/utils/flight.util.ts`). That keeps them easy to
  unit test and keeps the components thin.
- **Layouts switch on auth state.** `AppComponent` renders either the public or the member layout. Routes
  stay the same for both, and only booking routes are guarded.
- **Signals for local UI state** (toggles, submitting flags, the session in `AuthService`).
  **Observables for async data** (HTTP, route params, filter streams).
- All components use `OnPush`, and all pages are lazy loaded.
- No component library besides Material, and no state management library. For an app this size,
  services plus RxJS are enough.

## Assumptions

- Flights operate **daily**. The API stores a departure time (`"HH:mm"`) and the app places it on the
  searched date. That way the mock data works for any date you pick. Flights that have already left
  are hidden when you search for today.
- The listed price is the all-in price **per adult**. The fare breakdown splits out roughly 14% as taxes.
- Economy class only. All travellers are adults (age is still captured). Max 9 travellers per booking.
- A return trip is shown as two one-way searches (onward and return tabs), and each flight is booked separately.
- There is no real payment. "Confirm booking" saves the booking straight away.
- Auth is mocked: the token is base64-encoded JSON with an expiry, and passwords are stored
  in plain text in the mock DB. This is fine for a demo and obviously not for production.
- The phone number is validated as a 10-digit Indian mobile number.

## Tests

```bash
npm test
```

The 25 specs cover:
- the filter/sort/fare helpers
- date and URL helpers
- the search form validators
- the duration pipe
- `FlightService` against `HttpTestingController` (including the retry-on-5xx and no-retry-on-404 behaviour)
- the auth guard

---

Assignment done by **Hithesh M N**.
