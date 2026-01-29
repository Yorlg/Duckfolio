'use client';

import { useProfileStore } from '@/lib/store';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/packages/ui/card';

export function WebsiteLinks() {
  const { websiteLinks } = useProfileStore();

  if (websiteLinks.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-3">
      {websiteLinks.map((link) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block transition-all hover:translate-y-[-2px] hover:shadow-md"
        >
          <Card className="border border-border bg-card text-card-foreground">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{link.title}</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-muted-foreground"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              {link.description && (
                <CardDescription>{link.description}</CardDescription>
              )}
            </CardHeader>
          </Card>
        </a>
      ))}
    </div>
  );
}
