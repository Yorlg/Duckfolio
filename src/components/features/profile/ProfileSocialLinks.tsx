'use client';

import { useEffect, useRef } from 'react';
import { Circle } from 'lucide-react';
import { ConfigIcon } from '@/lib/icon-registry';
import type { SocialLink } from '@/types/platform-config';

const STROKEABLE_SHAPES = 'path, line, polyline, polygon, circle, ellipse, rect';

export function ProfileSocialLinks({ links, centered = false }: { links: SocialLink[]; centered?: boolean }) {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const animatedShapes: Array<{
      element: SVGElement;
      pathLength: string | null;
      delay: string;
      onEntryAnimationEnd: (event: AnimationEvent) => void;
    }> = [];
    const removeEntryAnimationListeners: Array<() => void> = [];

    nav.querySelectorAll<HTMLAnchorElement>('.profile-social-link').forEach((socialLink, linkIndex) => {
      let strokeIndex = 0;
      const entryShapes: SVGElement[] = [];

      socialLink.querySelectorAll<SVGElement>(STROKEABLE_SHAPES).forEach((shape) => {
        const style = window.getComputedStyle(shape);

        if (style.stroke === 'none' || style.fill !== 'none' || style.strokeDasharray !== 'none') return;

        const onEntryAnimationEnd = (event: AnimationEvent) => {
          if (event.animationName === 'profile-social-stroke-entry') {
            shape.removeAttribute('data-profile-social-stroke-entry');
          }
        };

        animatedShapes.push({
          element: shape,
          pathLength: shape.getAttribute('pathLength'),
          delay: shape.style.getPropertyValue('--profile-social-stroke-delay'),
          onEntryAnimationEnd,
        });
        shape.setAttribute('pathLength', '1');
        shape.setAttribute('data-profile-social-stroke', '');
        shape.style.setProperty('--profile-social-stroke-delay', `${linkIndex * 120 + strokeIndex * 70}ms`);
        shape.addEventListener('animationend', onEntryAnimationEnd);
        entryShapes.push(shape);
        strokeIndex += 1;
      });

      const cancelEntryAnimation = () => {
        entryShapes.forEach((shape) => shape.removeAttribute('data-profile-social-stroke-entry'));
      };
      socialLink.addEventListener('pointerenter', cancelEntryAnimation);
      socialLink.addEventListener('focusin', cancelEntryAnimation);
      removeEntryAnimationListeners.push(() => {
        socialLink.removeEventListener('pointerenter', cancelEntryAnimation);
        socialLink.removeEventListener('focusin', cancelEntryAnimation);
      });
      entryShapes.forEach((shape) => shape.setAttribute('data-profile-social-stroke-entry', ''));
    });

    return () => {
      removeEntryAnimationListeners.forEach((removeListener) => removeListener());
      animatedShapes.forEach(({ element, pathLength, delay, onEntryAnimationEnd }) => {
        element.removeEventListener('animationend', onEntryAnimationEnd);
        if (pathLength === null) element.removeAttribute('pathLength');
        else element.setAttribute('pathLength', pathLength);
        element.removeAttribute('data-profile-social-stroke');
        element.removeAttribute('data-profile-social-stroke-entry');
        if (delay) element.style.setProperty('--profile-social-stroke-delay', delay);
        else element.style.removeProperty('--profile-social-stroke-delay');
      });
    };
  }, [links]);

  if (!links.length) return null;

  return (
    <nav
      ref={navRef}
      aria-label="Social links"
      className={`profile-social-links flex flex-wrap gap-2 ${centered ? 'justify-center md:justify-start' : '-ml-1 justify-start'}`}
    >
      {links.map((link) => (
        <a
          key={link.id}
          href={link.url}
          target={link.url.startsWith('mailto:') ? undefined : '_blank'}
          rel={link.url.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
          aria-label={link.platform}
          title={link.platform}
          className="profile-social-link inline-flex size-11 items-center justify-center rounded-full text-[#121212]/55 transition-colors hover:bg-[#121212]/5 hover:text-(--theme-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-(--theme-secondary)"
        >
          <ConfigIcon className="size-5" fallback={Circle} icon={link.icon} svgClassName="[&_svg]:size-5" />
        </a>
      ))}
    </nav>
  );
}
