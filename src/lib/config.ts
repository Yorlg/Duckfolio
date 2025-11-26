import {ProfileConfig} from '@/types/platform-config';
import {ConfigProvider} from "@/types/platform-interfaces";

export async function getConfig(): Promise<ProfileConfig> {
    let provider: ConfigProvider;
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const providerModule = await import("@/lib/platform/nodeConfigProvider");
        provider = providerModule.provider;
    } else {
        const providerModule = await import("@/lib/platform/edgeConfigProvider");
        provider = providerModule.provider;
    }

    return await provider.reloadConfig();
}
