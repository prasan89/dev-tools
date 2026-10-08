'use client';

import { usePathname } from 'next/navigation';
import { AdSenseScript } from './AdSenseScript';

export function AdSenseConditional() {
  const pathname = usePathname();
  if (pathname === '/') return null;
  return <AdSenseScript />;
}
