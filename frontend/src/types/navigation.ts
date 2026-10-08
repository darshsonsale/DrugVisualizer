export interface NavItem {
  label: string;
  path: string;
  icon?: string;
  isExternal?: boolean;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  { label: 'Home', path: '/' },
  { label: 'Explore', path: '/explore' },
  { label: 'Learn', path: '/learn' },
  { label: 'Quiz', path: '/quiz' },
  { label: 'Progress', path: '/progress' },
];

export const FOOTER_QUICK_LINKS: NavItem[] = [
  { label: 'Pathway Stages', path: '/explore' },
  { label: 'Bioavailability Docs', path: '/learn' },
  { label: 'Assessment Center', path: '/quiz' },
];
