import { Circle } from 'lucide-react';
import { ConfigIcon } from '@/lib/icon-registry';
import type { SocialLink } from '@/types/platform-config';

export function ProfileSocialLinks({ links, centered = false }: { links: SocialLink[]; centered?: boolean }) {
  if (!links.length) return null;

  return (
    <nav aria-label="Social links" className={`flex flex-wrap gap-2 ${centered ? 'justify-center md:justify-start' : '-ml-1 justify-start'}`}>
      {links.map((link) => (
        <a
          key={link.id}
          href={link.url}
          target={link.url.startsWith('mailto:') ? undefined : '_blank'}
          rel={link.url.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
          aria-label={link.platform}
          title={link.platform}
          className="inline-flex size-11 items-center justify-center rounded-full text-[#121212]/55 transition-colors hover:bg-[#121212]/5 hover:text-(--theme-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-(--theme-secondary)"
        >
          <ConfigIcon className="size-5" fallback={Circle} icon={link.icon} svgClassName="[&_svg]:size-5" />
        </a>
      ))}
    </nav>
  );
}
