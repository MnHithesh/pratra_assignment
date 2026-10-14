import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ApiError } from '../http/api-error';
import { errorInterceptor } from '../http/error.interceptor';
import { FlightService } from './flight.service';

describe('FlightService', () => {
  let service: FlightService;
  let http: HttpTestingController;

  const criteria = { from: 'BLR', to: 'DEL', departDate: '2030-05-10', returnDate: null, passengers: 1 };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(FlightService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('searches by route and puts flights on the requested date', () => {
    let result: unknown[] = [];
    service.search(criteria).subscribe(flights => (result = flights));

    const req = http.expectOne(r => r.url === '/api/flights');
    expect(req.request.params.get('from')).toBe('BLR');
    expect(req.request.params.get('to')).toBe('DEL');
    req.flush([{ id: '1', departure: '09:15', durationMinutes: 60 }]);

    expect(result.length).toBe(1);
    expect((result[0] as { departureTime: Date }).departureTime).toEqual(new Date(2030, 4, 10, 9, 15));
  });

  it('retries once on a server error, then gives up with a friendly message', fakeAsync(() => {
    let error: ApiError | undefined;
    service.search(criteria).subscribe({ error: e => (error = e) });

    http.expectOne(r => r.url === '/api/flights').flush(null, { status: 503, statusText: 'Unavailable' });
    tick(1000);
    http.expectOne(r => r.url === '/api/flights').flush(null, { status: 503, statusText: 'Unavailable' });

    expect(error).toEqual(jasmine.any(ApiError));
    expect(error?.status).toBe(503);
    expect(error?.message).toContain('Something went wrong');
  }));

  it('does not retry a 404', () => {
    let error: ApiError | undefined;
    service.getFlight('nope', '2030-05-10').subscribe({ error: e => (error = e) });

    http.expectOne('/api/flights/nope').flush({ message: 'Not found' }, { status: 404, statusText: 'Not Found' });
    expect(error?.isNotFound).toBeTrue();
  });
});
