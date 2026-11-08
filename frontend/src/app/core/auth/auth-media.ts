import { InjectionToken } from '@angular/core';

/**
 * The silent looping video behind login and sign-up. Change it here (or provide
 * another value in a test or an environment) and nothing else needs to change;
 * an empty string means "no video", and the pastel mesh stays on its own.
 */
export const AUTH_VIDEO_URL = new InjectionToken<string>('AUTH_VIDEO_URL', {
  providedIn: 'root',
  factory: () =>
    'https://media.kolpusites.com/norvale%20contacto/cherry_blossom_coast_compressed.mp4',
});
