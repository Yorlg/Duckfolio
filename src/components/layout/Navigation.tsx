'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';

const navItems = [
  { name: 'profile', href: '/' },
  { name: 'links', href: '/links' },
  { name: 'blog', href: '/posts' },
  { name: 'projects', href: '/projects' },
  { name: 'photos', href: '/photos' },
];

export function Navigation({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { t } = useTranslation();

  const getActiveSection = () => {
    if (pathname === '/') return 'profile';
    if (pathname.startsWith('/links')) return 'links';
    if (pathname.startsWith('/posts') || pathname.startsWith('/blog'))
      return 'blog';
    if (pathname.startsWith('/projects')) return 'projects';
    if (pathname.startsWith('/photos')) return 'photos';
    return 'profile';
  };

  const activeSection = getActiveSection();

  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-1 sm:gap-x-6">
      <div className="text-xl font-medium">
        <Link href="/">
          <Image src="/logo.png" alt="Logo" width={40} height={40} priority />
        </Link>
      </div>

      <nav className="order-last col-span-3 flex min-w-0 items-center justify-center gap-6 sm:order-0 sm:col-span-1 sm:justify-end sm:gap-7">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            aria-current={activeSection === item.name ? 'page' : undefined}
            className={`relative inline-flex h-8 shrink-0 items-center whitespace-nowrap text-sm font-medium tracking-wide transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground sm:h-11 sm:text-[15px] ${
              activeSection === item.name
                ? 'text-[#121212] dark:text-white'
                : 'text-[#121212]/60 dark:text-white/60 hover:text-[#121212] dark:hover:text-white'
            }`}
          >
            {t('nav.' + item.name)}
            {activeSection === item.name && (
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0.5 h-0.5 bg-[#121212] dark:bg-white sm:bottom-1"
              />
            )}
          </Link>
        ))}
      </nav>
      <div className="col-start-3">{children}</div>
    </div>
  );
}
