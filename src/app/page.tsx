import {getConfig} from "@/lib/config";
import {HomePage} from "@/components/pages/HomePage";

/*
 * When the runtime is "edge", please remove revalidate.
 * When the runtime is "nodejs", please set revalidate to 30~90 sec.
 */
export const runtime = 'edge';
// export const revalidate = 60;

export default async function Home() {
    const config = await getConfig();

    return (
      <HomePage
        profile={config.profile}
        socialLinks={config.socialLinks}
        websiteLinks={config.websiteLinks}
      />
    );
}
