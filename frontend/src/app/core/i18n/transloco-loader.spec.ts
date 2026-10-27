import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { TranslocoHttpLoader } from './transloco-loader';

describe('TranslocoHttpLoader', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads the file of the language, relative to the base href', () => {
    let result: unknown;
    TestBed.inject(TranslocoHttpLoader)
      .getTranslation('ca')
      .subscribe((translation) => (result = translation));

    http.expectOne('i18n/ca.json').flush({ nav: { home: 'Inici' } });

    expect(result).toEqual({ nav: { home: 'Inici' } });
  });
});
