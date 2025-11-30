import {ProfileConfig} from "@/types/platform-config";

export interface ConfigProvider {
  reloadConfig(): Promise<ProfileConfig>
}
