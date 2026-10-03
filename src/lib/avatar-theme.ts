import type { Profile } from '@/types/platform-config';

export type AvatarTheme = NonNullable<Profile['theme']>;

export function validAvatarTheme(theme: Profile['theme'], avatar: string): theme is AvatarTheme {
  return Boolean(theme && theme.avatar === avatar && /^#[\da-f]{6}$/i.test(theme.primary) && /^#[\da-f]{6}$/i.test(theme.secondary));
}

export async function extractAvatarTheme(source: string, avatar = source): Promise<AvatarTheme> {
  // This module is also imported by the server for validation; ColorThief requires browser globals.
  const { default: ColorThief } = await import('color-thief-browser');
  const { promise, resolve, reject } = Promise.withResolvers<AvatarTheme>();
  const image = new Image();
  image.crossOrigin = 'anonymous';
  const timer = window.setTimeout(() => finish(new Error('Avatar color extraction timed out.')), 15000);
  const finish = (error?: Error, theme?: AvatarTheme) => {
    window.clearTimeout(timer);
    image.onload = null;
    image.onerror = null;
    if (error) reject(error);
    else resolve(theme!);
  };
  image.onerror = () => finish(new Error('Unable to load avatar for color extraction.'));
  image.onload = () => {
    try {
      const thief = new ColorThief();
      const primary = thief.getColor(image);
      const secondary = thief.getPalette(image, 3)?.[1] || primary;
      const colors = [primary, secondary].map(rgb => '#' + rgb.map(value => value.toString(16).padStart(2, '0')).join(''));
      finish(undefined, { avatar, primary: colors[0], secondary: colors[1] });
    } catch {
      finish(new Error('Unable to read avatar colors. Check image CORS permissions.'));
    }
  };
  image.src = source;
  return promise;
}
