import { ModuleWithProviders } from '@angular/core';
import {
  TRANSLOCO_MISSING_HANDLER,
  TranslocoTestingModule,
  TranslocoTestingOptions,
} from '@jsverse/transloco';

import ca from '../../public/i18n/ca.json';
import en from '../../public/i18n/en.json';
import es from '../../public/i18n/es.json';
import { FallbackTextMissingHandler } from '../app/core/i18n/missing-handler';

/**
 * Transloco for unit tests, with the real translation files already loaded
 * and the same missing-key handler as the app.
 */
export function provideTranslocoTesting(
  options: TranslocoTestingOptions = {},
): ModuleWithProviders<TranslocoTestingModule> {
  const testing = TranslocoTestingModule.forRoot({
    langs: { ca, es, en },
    translocoConfig: {
      availableLangs: ['ca', 'es', 'en'],
      defaultLang: 'en',
      reRenderOnLangChange: true,
    },
    preloadLangs: true,
    ...options,
  });
  return {
    ngModule: testing.ngModule,
    providers: [
      ...(testing.providers ?? []),
      { provide: TRANSLOCO_MISSING_HANDLER, useClass: FallbackTextMissingHandler },
    ],
  };
}
