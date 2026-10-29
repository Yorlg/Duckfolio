'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

export function ModeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    const isInteracting = button.matches(':hover, :focus-visible');

    button.querySelectorAll('svg').forEach((icon) => {
      icon.querySelectorAll<SVGElement>('circle, path, line').forEach((shape, index) => {
        shape.setAttribute('pathLength', '1');
        shape.setAttribute('data-theme-toggle-stroke', '');
        shape.toggleAttribute('data-theme-toggle-stroke-entry', !isInteracting);
        shape.style.setProperty('--theme-toggle-stroke-delay', `${index * 70}ms`);
      });
    });
  }, [resolvedTheme]);

  const cancelEntryAnimation = () => {
    buttonRef.current?.querySelectorAll('[data-theme-toggle-stroke-entry]').forEach((shape) => {
      shape.removeAttribute('data-theme-toggle-stroke-entry');
    });
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const label = t(resolvedTheme === 'dark' ? 'theme.switchToLight' : 'theme.switchToDark');

  return (
    <Button
      ref={buttonRef}
      aria-label={label}
      title={label}
      type="button"
      variant="ghost"
      size="icon"
      disabled={!mounted}
      onClick={toggleTheme}
      onPointerEnter={cancelEntryAnimation}
      onFocus={cancelEntryAnimation}
      onAnimationEnd={(event) => {
        if (event.target instanceof SVGElement) {
          event.target.removeAttribute('data-theme-toggle-stroke-entry');
        }
      }}
      className="theme-toggle size-11 shrink-0 rounded-lg text-[#121212]/65 transition-colors duration-150 hover:text-[#121212] dark:text-white/65 dark:hover:text-white"
    >
      <Sun aria-hidden="true" className="hidden size-5 dark:block" />
      <Moon aria-hidden="true" className="size-5 dark:hidden" />
    </Button>
  );
}
