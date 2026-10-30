import { Routes } from '@angular/router';

import { Shell } from './layout/shell/shell';

/** Lazy stand-in page for the screens that are not built yet. */
const comingSoon = () => import('./features/coming-soon/coming-soon').then((m) => m.ComingSoon);

const authLayout = () => import('./layout/auth-layout/auth-layout').then((m) => m.AuthLayout);

/**
 * Route `title`s are translation keys (see TranslatedTitleStrategy).
 * Stand-in pages get the same key as `titleKey`, used as their heading.
 */
export const routes: Routes = [
  // Login and sign-up: no app navigation, always in the visitor look.
  {
    path: 'login',
    loadComponent: authLayout,
    children: [
      {
        path: '',
        title: 'shell.logIn',
        loadComponent: comingSoon,
        data: { titleKey: 'shell.logIn' },
      },
    ],
  },
  {
    path: 'signup',
    loadComponent: authLayout,
    children: [
      {
        path: '',
        title: 'shell.signUp',
        loadComponent: comingSoon,
        data: { titleKey: 'shell.signUp' },
      },
    ],
  },
  // Everything else lives inside the app shell.
  {
    path: '',
    component: Shell,
    children: [
      {
        // Home: the content plus the side column on wide screens (`aside` outlet).
        path: '',
        pathMatch: 'full',
        children: [
          {
            path: '',
            title: 'nav.home',
            loadComponent: comingSoon,
            data: { titleKey: 'nav.home' },
          },
          {
            path: '',
            outlet: 'aside',
            loadComponent: () => import('./features/home/home-aside').then((m) => m.HomeAside),
          },
        ],
      },
      {
        path: 'explore',
        title: 'nav.explore',
        loadComponent: () => import('./features/explore/explore').then((m) => m.Explore),
      },
      {
        // Anime page (#12).
        path: 'anime/:id',
        title: 'pages.anime',
        loadComponent: comingSoon,
        data: { titleKey: 'pages.anime' },
      },
      {
        path: 'season',
        title: 'nav.season',
        loadComponent: comingSoon,
        data: { titleKey: 'nav.season' },
      },
      {
        path: 'kura',
        title: 'nav.kura',
        loadComponent: comingSoon,
        data: { titleKey: 'nav.kura' },
      },
      {
        path: 'settings',
        title: 'nav.settings',
        loadComponent: () => import('./features/settings/settings').then((m) => m.Settings),
      },
      {
        // Temporary page to check the design tokens of every role. Not in the navigation.
        path: 'design',
        title: 'pages.design',
        loadComponent: () =>
          import('./features/theme-preview/theme-preview').then((m) => m.ThemePreview),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
