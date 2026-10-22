import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Nikkura',
    // Temporary: the theme preview stays as the start page until the layout (#10).
    loadComponent: () =>
      import('./features/theme-preview/theme-preview').then((m) => m.ThemePreview),
  },
  { path: '**', redirectTo: '' },
];
