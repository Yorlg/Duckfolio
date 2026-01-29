'use client';

import { useProfileStore } from '@/lib/store';
import { Button } from '@/packages/ui/button';

export function SocialLinks() {
  const { socialLinks } = useProfileStore();

  if (socialLinks.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-2 flex-wrap justify-center">
      {socialLinks.map((link) => (
        <Button key={link.id} variant="outline" size="icon" asChild>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.platform}
          >
            <span className="sr-only">{link.platform}</span>
            <span
              className="h-4 w-4"
              dangerouslySetInnerHTML={{ __html: link.icon }}
            />
          </a>
        </Button>
      ))}
    </div>
  );
}
