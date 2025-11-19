import {ConfigProvider} from "@/types/platform-interfaces";
import {ProfileConfig} from "@/types/platform-config";
import path from "path";
import fs from "fs";
import {readFile} from "fs/promises";

class NodeConfigProvider implements ConfigProvider {
  async reloadConfig(): Promise<ProfileConfig> {
    const configPath = path.join(process.cwd(), 'public/platform-config.json');

    if (!fs.existsSync(configPath)) {
      throw new Error("Cannot read config file: file not exists.");
    }

    const json = await readFile(configPath, {encoding: 'utf-8', flag: 'r'});
    return JSON.parse(json);
  }
}

export const provider = new NodeConfigProvider();
