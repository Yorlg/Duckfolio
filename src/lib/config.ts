import { ProfileConfig } from '@/types/platform-config';
import profileConfig from '@/public/platform-config.json';

export function getConfig(): ProfileConfig {
  return profileConfig;
}
