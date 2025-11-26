import {ConfigProvider} from "@/types/platform-interfaces";
import {ProfileConfig} from "@/types/platform-config";
import profileConfig from '@/public/platform-config.json';

class EdgeConfigProvider implements ConfigProvider {
  async reloadConfig(): Promise<ProfileConfig> {
    return profileConfig;
  }
}

export const provider = new EdgeConfigProvider();
