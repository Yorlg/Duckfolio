import { getConfig } from '@/lib/config';
import { Links } from '@/components/features/links';

export default async function LinksPage() {
  const config = await getConfig();

  return <Links websiteLinks={config.websiteLinks} />;
}
