import { getConfig } from "@/lib/config";
import { HomePage } from '@/components/features/profile';

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