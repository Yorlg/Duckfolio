'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

export function ModeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const label = t(resolvedTheme === 'dark' ? 'theme.switchToLight' : 'theme.switchToDark');

  return (
    <Button
      aria-label={label}
      title={label}
      type="button"
      variant="ghost"
      size="icon"
      disabled={!mounted}
      onClick={toggleTheme}
      className="size-11 shrink-0 rounded-lg text-[#121212]/65 transition-colors duration-150 hover:text-[#121212] dark:text-white/65 dark:hover:text-white"
    >
      <Sun aria-hidden="true" className="hidden size-5 dark:block" />
      <Moon aria-hidden="true" className="size-5 dark:hidden" />
    </Button>
  );
}