import 'server-only';

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

export interface Messages {
  admin: Record<string, string>;
  nav: { profile: string; links: string; blog: string; projects: string };
  profile: { greeting: string; introduction: string };
  links: { heading: string };
  projects: { heading: string; description: string; categories: string };
  blog: { empty: string; create: string };
  post: { back: string };
  language: { select: string };
  theme: { switchToLight: string; switchToDark: string };
}

export function getMessages(): { 'zh-CN': Messages; en: Messages } {
  return {
    'zh-CN': parse(readFileSync(join(process.cwd(), 'locales', 'zh-CN.yaml'), 'utf8')) as Messages,
    en: parse(readFileSync(join(process.cwd(), 'locales', 'en.yaml'), 'utf8')) as Messages,
  };
}
