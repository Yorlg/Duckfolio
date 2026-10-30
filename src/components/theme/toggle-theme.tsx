'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { flushSync } from 'react-dom';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

export function ModeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isTransitioning = useRef(false);

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

  const toggleTheme = async (event: MouseEvent<HTMLButtonElement>) => {
    if (isTransitioning.current) return;

    const isDark = resolvedTheme === 'dark';
    const nextTheme = isDark ? 'light' : 'dark';

    if (
      typeof document.startViewTransition !== 'function' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setTheme(nextTheme);
      return;
    }

    const { left, top, width, height } = event.currentTarget.getBoundingClientRect();
    const x = event.detail === 0 ? left + width / 2 : event.clientX;
    const y = event.detail === 0 ? top + height / 2 : event.clientY;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );
    const clipPath = [
      `circle(0px at ${x}px ${y}px)`,
      `circle(${endRadius}px at ${x}px ${y}px)`,
    ];

    isTransitioning.current = true;

    try {
      const transition = document.startViewTransition(() => {
        flushSync(() => setTheme(nextTheme));
      });

      await Promise.all([
        transition.ready.then(() => {
          document.documentElement.animate(
            { clipPath: isDark ? [...clipPath].reverse() : clipPath },
            {
              duration: 400,
              easing: 'ease-out',
              fill: 'forwards',
              pseudoElement: isDark
                ? '::view-transition-old(root)'
                : '::view-transition-new(root)',
            },
          );
        }),
        transition.finished,
      ]);
    } catch {
      // A skipped or unsupported transition must still switch the theme.
      setTheme(nextTheme);
    } finally {
      isTransitioning.current = false;
    }
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