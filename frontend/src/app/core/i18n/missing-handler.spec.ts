import { TestBed } from '@angular/core/testing';
import { TranslocoMissingHandlerData, TranslocoService } from '@jsverse/transloco';

import { provideTranslocoTesting } from '../../../testing/transloco';
import { genreKey } from './genre-key';
import { FallbackTextMissingHandler } from './missing-handler';

const data = (prodMode: boolean) =>
  ({ prodMode, activeLang: 'ca' }) as unknown as TranslocoMissingHandlerData;

describe('FallbackTextMissingHandler', () => {
  const handler = new FallbackTextMissingHandler();

  afterEach(() => vi.restoreAllMocks());

  it('shows the fallback text when one is given', () => {
    expect(handler.handle('genres.space-opera', data(false), { fallback: 'Space Opera' })).toBe(
      'Space Opera',
    );
  });

  it('shows the key and warns in development when there is no fallback', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    expect(handler.handle('nav.nope', data(false))).toBe('nav.nope');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('nav.nope'));
  });

  it('ignores an empty fallback', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    expect(handler.handle('nav.nope', data(false), { fallback: '  ' })).toBe('nav.nope');
  });

  it('stays quiet in production', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    handler.handle('nav.nope', data(true));

    expect(warn).not.toHaveBeenCalled();
  });

  describe('with Transloco', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({ imports: [provideTranslocoTesting()] });
    });

    it('translates a known genre', () => {
      const transloco = TestBed.inject(TranslocoService);
      transloco.setActiveLang('es');

      expect(transloco.translate(genreKey('Fantasy'), { fallback: 'Fantasy' })).toBe('Fantasía');
    });

    it('shows the English name of a genre missing from the table', () => {
      const transloco = TestBed.inject(TranslocoService);
      transloco.setActiveLang('ca');

      expect(transloco.translate(genreKey('Space Opera'), { fallback: 'Space Opera' })).toBe(
        'Space Opera',
      );
    });
  });
});
