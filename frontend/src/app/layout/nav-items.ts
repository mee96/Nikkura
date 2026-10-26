import { IconName } from '../shared/icon/icon';

export interface NavItem {
  path: string;
  /** Translation key of the label. */
  label: string;
  /** Shorter label for the icon rail and the mobile tabs, when the full one is long. */
  shortLabel?: string;
  icon: IconName;
  /** Only active on this exact URL (needed for the home, which is the prefix of every page). */
  exact?: boolean;
  /** Shown in the mobile bottom navigation. Settings opens from the header there. */
  inBottomNav: boolean;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { path: '/', label: 'nav.home', icon: 'home', exact: true, inBottomNav: true },
  { path: '/explore', label: 'nav.explore', icon: 'compass', inBottomNav: true },
  { path: '/season', label: 'nav.season', icon: 'calendar', inBottomNav: true },
  {
    path: '/kura',
    label: 'nav.kura',
    shortLabel: 'nav.kuraShort',
    icon: 'folder',
    inBottomNav: true,
  },
  {
    path: '/settings',
    label: 'nav.settings',
    shortLabel: 'nav.settingsShort',
    icon: 'settings',
    inBottomNav: false,
  },
];
