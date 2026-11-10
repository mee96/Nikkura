import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { ProfileService } from './profile.service';

const URL = `${environment.apiUrl.replace(/\/+$/, '')}/users/me`;

const apiProfile = (role: string) => ({
  uid: 'u1',
  username: 'Ana',
  email: 'ana@example.com',
  role,
  created_at: '2026-11-10T10:00:00',
});

describe('ProfileService', () => {
  let http: HttpTestingController;
  let service: ProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(ProfileService);
  });

  afterEach(() => http.verify());

  it('posts the username and the role with the names of the backend', async () => {
    const created = service.create('Ana', 'haku');

    const request = http.expectOne(URL);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ username: 'Ana', role: 'haku_sama' });
    request.flush(apiProfile('haku_sama'));

    expect(await created).toEqual({
      uid: 'u1',
      username: 'Ana',
      email: 'ana@example.com',
      role: 'haku',
    });
  });

  it('gives back the role of the profile that already existed', async () => {
    const created = service.create('Ana', 'moe');

    http.expectOne(URL).flush(apiProfile('senpai'));

    expect((await created).role).toBe('senpai');
  });

  it('fails when the backend answers with an error', async () => {
    const created = service.create('Ana', 'moe');
    const failed = expect(created).rejects.toMatchObject({ status: 503 });

    http.expectOne(URL).flush('down', { status: 503, statusText: 'Service Unavailable' });

    await failed;
  });

  it('fails when the backend sends a role the app does not know', async () => {
    const created = service.create('Ana', 'moe');
    const failed = expect(created).rejects.toThrow('Unknown role');

    http.expectOne(URL).flush(apiProfile('ninja'));

    await failed;
  });
});
