/** The three languages of Nikkura, each labelled in its own language. */
export const LANGUAGES = [
  { code: 'ca', label: 'Català' },
  { code: 'es', label: 'Castellano' },
  { code: 'en', label: 'English' },
] as const;

export type Lang = (typeof LANGUAGES)[number]['code'];

export const LANG_CODES: Lang[] = LANGUAGES.map((language) => language.code);

/** Used when the browser language is none of ours, and for missing keys. */
export const FALLBACK_LANG: Lang = 'en';

/** Where a visitor's choice is kept. Signed-in users will keep it in their profile (#27). */
export const LANG_STORAGE_KEY = 'nikkura.lang';

export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && (LANG_CODES as string[]).includes(value);
}
