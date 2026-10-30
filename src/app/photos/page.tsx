import type { Metadata } from 'next';
import { Photos } from '@/components/features/photos/Photos';
import { getConfig } from '@/lib/config';
import { getPhotos } from '@/lib/photos';

// Read the saved album on each visit, including local admin edits.
export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  return { title: `Photos · ${getConfig().profile.name}` };
}

export default async function PhotosPage() {
  return <Photos photos={await getPhotos()} />;
}
