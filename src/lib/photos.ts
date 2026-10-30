import fs from 'node:fs/promises';
import path from 'node:path';
import type { AdminPhoto, Photo } from '@/types/photos';

export const photosDirectory = path.join(process.cwd(), 'photos');
const photoNameCollator = new Intl.Collator('en', { numeric: true });
const imageTypes: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
};

export interface PhotoEntry {
  photo: AdminPhoto;
  metadataPath: string;
  metadata: Record<string, unknown>;
}

export function isSafePhotoPath(filePath: string): boolean {
  return filePath
    .split('/')
    .every(
      (part) =>
        Boolean(part) && !part.startsWith('.') && !/[\\\x00-\x1f:]/.test(part),
    );
}

export function photoContentType(filePath: string): string | undefined {
  return imageTypes[path.extname(filePath).toLowerCase()];
}

export function isPhotoPath(filePath: string): boolean {
  return isSafePhotoPath(filePath) && Boolean(photoContentType(filePath));
}

export function photoMetadataPath(filePath: string): string {
  return filePath.replace(/\.[^.]+$/, '.json');
}

export function createPhoto(
  id: string,
  metadata: Record<string, unknown>,
): AdminPhoto {
  return {
    id,
    src: `/photos/${id.split('/').map(encodeURIComponent).join('/')}`,
    alt:
      typeof metadata.alt === 'string'
        ? metadata.alt
        : typeof metadata.text === 'string'
          ? metadata.text
          : '',
    hidden: metadata.hidden === true,
  };
}

export async function createPhotoEntries(
  files: string[],
  readMetadata: (filePath: string) => Promise<string>,
  strict = false,
): Promise<PhotoEntry[]> {
  const fileSet = new Set(files);
  const images = files.filter(isPhotoPath);
  const entries: PhotoEntry[] = [];

  // Bound concurrent reads, including GitHub metadata requests.
  for (let start = 0; start < images.length; start += 12) {
    entries.push(
      ...(await Promise.all(
        images.slice(start, start + 12).map(async (id) => {
          // An extension-specific sidecar also supports lake.jpg and lake.png together.
          const metadataPath = fileSet.has(`${id}.json`)
            ? `${id}.json`
            : photoMetadataPath(id);
          let metadata: Record<string, unknown> = {};
          if (fileSet.has(metadataPath)) {
            const source = await readMetadata(metadataPath);
            try {
              const parsed: unknown = JSON.parse(source);
              if (
                !parsed ||
                typeof parsed !== 'object' ||
                Array.isArray(parsed)
              ) {
                throw new Error('Invalid photo metadata');
              }
              metadata = parsed as Record<string, unknown>;
            } catch {
              if (strict) throw new Error('photoMetadataInvalid');
              console.warn(
                `Ignoring invalid photo metadata: photos/${metadataPath}`,
              );
            }
          }
          return { photo: createPhoto(id, metadata), metadataPath, metadata };
        }),
      )),
    );
  }

  return entries.sort((a, b) => {
    const order = (entry: PhotoEntry) =>
      typeof entry.metadata.order === 'number' &&
      Number.isFinite(entry.metadata.order)
        ? entry.metadata.order
        : Infinity;
    return (
      order(a) - order(b) || photoNameCollator.compare(b.photo.id, a.photo.id)
    );
  });
}

export async function listLocalPhotoEntries(
  strict = false,
): Promise<PhotoEntry[]> {
  const files: string[] = [];
  async function walk(relativePath: string) {
    const directory = path.join(photosDirectory, relativePath);
    const entries = await fs
      .readdir(directory, { withFileTypes: true })
      .catch((error) => {
        if (error.code === 'ENOENT') return [];
        throw error;
      });
    for (const entry of entries) {
      const name = relativePath ? `${relativePath}/${entry.name}` : entry.name;
      if (!isSafePhotoPath(name)) continue;
      if (entry.isDirectory()) await walk(name);
      else if (entry.isFile()) files.push(name);
    }
  }
  await walk('');
  return createPhotoEntries(
    files,
    (filePath) => fs.readFile(path.join(photosDirectory, filePath), 'utf8'),
    strict,
  );
}

export async function getPhotos(): Promise<Photo[]> {
  return (await listLocalPhotoEntries())
    .filter((entry) => !entry.photo.hidden)
    .map((entry) => entry.photo);
}

export async function readLocalPhoto(filePath: string): Promise<Buffer | null> {
  if (!isPhotoPath(filePath)) return null;
  try {
    const [root, resolved] = await Promise.all([
      fs.realpath(photosDirectory),
      fs.realpath(path.join(photosDirectory, filePath)),
    ]);
    if (!resolved.startsWith(`${root}${path.sep}`)) return null;
    return await fs.readFile(resolved);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  }
}
