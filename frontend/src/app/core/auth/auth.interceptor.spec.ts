import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let idToken: ReturnType<typeof vi.fn<() => Promise<string | null>>>;

  const backend = environment.apiUrl;

  beforeEach(() => {
    idToken = vi.fn(() => Promise.resolve('abc.def'));
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { idToken } },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('sends the token as "Authorization: Bearer <token>"', async () => {
    http.get(`${backend}/me`).subscribe();
    const request = await vi.waitFor(() => httpMock.expectOne(`${backend}/me`));

    expect(request.request.headers.get('Authorization')).toBe('Bearer abc.def');
    request.flush({});
  });

  it('never sends it to Jikan', async () => {
    http.get(`${environment.jikanUrl}/anime/1`).subscribe();
    const request = httpMock.expectOne(`${environment.jikanUrl}/anime/1`);

    expect(request.request.headers.has('Authorization')).toBe(false);
    expect(idToken).not.toHaveBeenCalled();
    request.flush({});
  });

  it.each([
    ['another host', 'https://example.com/me'],
    ['a host that only starts like the backend', `${backend}.evil.test/me`],
    ['the backend URL inside a query', `https://example.com/?next=${backend}/me`],
  ])('never sends it to %s', (_name, url) => {
    http.get(url).subscribe();
    const request = httpMock.expectOne(url);

    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({});
  });

  it('sends the call without a header when nobody is logged in', async () => {
    idToken.mockResolvedValue(null);
    http.get(`${backend}/anime`).subscribe();
    const request = await vi.waitFor(() => httpMock.expectOne(`${backend}/anime`));

    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({});
  });

  it('keeps the rest of the request as it was', async () => {
    http.post(`${backend}/kura`, { id: 1 }, { headers: { 'X-Test': '1' } }).subscribe();
    const request = await vi.waitFor(() => httpMock.expectOne(`${backend}/kura`));

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ id: 1 });
    expect(request.request.headers.get('X-Test')).toBe('1');
    request.flush({});
  });
});
