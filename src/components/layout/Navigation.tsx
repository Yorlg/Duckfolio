'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';

const navItems = [
  { name: 'profile', href: '/' },
  { name: 'links', href: '/links' },
  { name: 'blog', href: '/posts' },
  { name: 'projects', href: '/projects' },
];

export function Navigation() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion();

  const getActiveSection = () => {
    if (pathname === '/') return 'profile';
    if (pathname.startsWith('/links')) return 'links';
    if (pathname.startsWith('/posts') || pathname.startsWith('/blog'))
      return 'blog';
    if (pathname.startsWith('/projects')) return 'projects';
    return 'profile';
  };

  const activeSection = getActiveSection();

  return (
    <nav className="fixed top-0 left-0 w-full z-40 p-4 sm:px-8  sm:py-6 flex justify-between items-center">
      <motion.div
        initial={{ opacity: 1, x: reducedMotion ? 0 : -20 }}
        animate={{
          opacity: 1,
          x: 0,
          rotate: reducedMotion ? 0 : [0, -10, 0],
        }}
        transition={{
          duration: 0.6,
          ease: 'easeOut',
          rotate: {
            duration: 2,
            ease: 'easeInOut',
            repeat: reducedMotion ? 0 : Infinity,
            repeatType: 'loop',
          },
        }}
        className="text-xl font-medium"
      >
        <Link href="/">
          <Image src="/logo.png" alt="Logo" width={40} height={40} priority />
        </Link>
      </motion.div>

      <motion.div
        className="flex space-x-4 sm:space-x-7"
        initial={{ opacity: 1, y: reducedMotion ? 0 : -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
      >
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            aria-current={activeSection === item.name ? 'page' : undefined}
            className={`text-[15px] font-medium tracking-wide transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground ${
              activeSection === item.name
                ? 'text-[#121212] dark:text-white'
                : 'text-[#121212]/60 dark:text-white/60 hover:text-[#121212] dark:hover:text-white'
            }`}
          >
            {t('nav.' + item.name)}
            {activeSection === item.name && (
              <motion.div
                aria-hidden="true"
                className="mt-1 h-0.5 bg-[#121212] dark:bg-white"
                layoutId="activeSection"
                transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </Link>
        ))}
      </motion.div>
    </nav>
  );
}
