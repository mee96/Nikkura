import { Injectable } from '@angular/core';
import { TranslocoMissingHandler, TranslocoMissingHandlerData } from '@jsverse/transloco';

/**
 * What to show when a key exists in no language (not even English, the fallback).
 *
 * Texts that come from outside, like Jikan genre names, pass their original
 * value as `fallback`: `{{ genreKey(name) | transloco: { fallback: name } }}`.
 * A genre Jikan adds tomorrow then shows its English name instead of
 * `genres.new-genre`. Any other missing key is shown as the key and, in
 * development, logged so it gets added (the translations test catches it too).
 */
@Injectable()
export class FallbackTextMissingHandler implements TranslocoMissingHandler {
  handle(key: string, data: TranslocoMissingHandlerData, params?: Record<string, unknown>): string {
    const fallback = params?.['fallback'];
    if (typeof fallback === 'string' && fallback.trim() !== '') {
      return fallback;
    }
    if (!data.prodMode) {
      console.warn(`[i18n] Missing translation "${key}" (${data.activeLang})`);
    }
    return key;
  }
}
