import { TranslocoTestingModule, TranslocoTestingOptions } from '@jsverse/transloco';

import ca from '../../public/i18n/ca.json';
import en from '../../public/i18n/en.json';
import es from '../../public/i18n/es.json';

/** Transloco for unit tests, with the real translation files already loaded. */
export function provideTranslocoTesting(options: TranslocoTestingOptions = {}) {
  return TranslocoTestingModule.forRoot({
    langs: { ca, es, en },
    translocoConfig: {
      availableLangs: ['ca', 'es', 'en'],
      defaultLang: 'en',
      reRenderOnLangChange: true,
    },
    preloadLangs: true,
    ...options,
  });
}
