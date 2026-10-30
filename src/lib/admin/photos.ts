import fs from 'node:fs/promises';
import path from 'node:path';
import type { AdminPhoto } from '@/types/photos';
import {
  createPhoto,
  createPhotoEntries,
  isPhotoPath,
  isSafePhotoPath,
  listLocalPhotoEntries,
  photoMetadataPath,
  photosDirectory,
  readLocalPhoto,
  type PhotoEntry,
} from '@/lib/photos';
import {
  getRepositoryTarget,
  GitHubRequestError,
  githubRequest,
  readRepositoryMediaFile,
} from './content';

type Target = ReturnType<typeof getRepositoryTarget>;
type GitHubTarget = Extract<Target, { mode: 'github' }>;
interface CommitHead {
  sha: string;
  tree: { sha: string };
}
interface TreeItem {
  path: string;
  type: string;
  mode: string;
  sha: string;
}
interface GitTree {
  tree: TreeItem[];
  truncated: boolean;
}

export class PhotoRequestError extends Error {}
class PhotoWriteConflict extends Error {}

async function readHead(target: GitHubTarget): Promise<CommitHead> {
  const ref = await githubRequest<{ object: { sha: string } }>(
    target,
    `/git/ref/heads/${encodeURIComponent(target.branch)}`,
    { cache: 'no-store' },
  );
  return githubRequest<CommitHead>(target, `/git/commits/${ref.object.sha}`, {
    cache: 'no-store',
  });
}

async function readTree(
  target: GitHubTarget,
  sha: string,
): Promise<TreeItem[]> {
  const recursive = await githubRequest<GitTree>(
    target,
    `/git/trees/${sha}?recursive=1`,
  );
  if (!recursive.truncated) return recursive.tree;

  // Large albums can exceed the recursive tree response size.
  const tree = await githubRequest<GitTree>(target, `/git/trees/${sha}`);
  if (tree.truncated) throw new Error('photoDirectoryTooLarge');
  const items: TreeItem[] = [];
  for (const entry of tree.tree) {
    if (entry.type === 'tree') {
      items.push(
        ...(await readTree(target, entry.sha)).map((child) => ({
          ...child,
          path: `${entry.path}/${child.path}`,
        })),
      );
    } else items.push(entry);
  }
  return items;
}

async function readPhotoTree(
  target: GitHubTarget,
  head: CommitHead,
): Promise<TreeItem[]> {
  const root = await githubRequest<GitTree>(
    target,
    `/git/trees/${head.tree.sha}`,
  );
  const directory = root.tree.find(
    (entry) => entry.path === 'photos' && entry.type === 'tree',
  );
  return directory ? readTree(target, directory.sha) : [];
}

async function readGallery(
  target: Target,
): Promise<{ entries: PhotoEntry[]; head?: CommitHead }> {
  if (target.mode === 'local')
    return { entries: await listLocalPhotoEntries(true) };
  const head = await readHead(target);
  const files = (await readPhotoTree(target, head)).filter(
    (entry) =>
      entry.type === 'blob' && ['100644', '100755'].includes(entry.mode),
  );
  const byPath = new Map(files.map((file) => [file.path, file]));
  const entries = await createPhotoEntries(
    files.map((file) => file.path),
    async (filePath) => {
      const blob = await githubRequest<{ content: string; encoding: string }>(
        target,
        `/git/blobs/${byPath.get(filePath)!.sha}`,
      );
      return Buffer.from(blob.content, 'base64').toString('utf8');
    },
    true,
  );
  return { entries, head };
}

export async function listRepositoryPhotos(): Promise<AdminPhoto[]> {
  return (await readGallery(getRepositoryTarget())).entries.map(
    (entry) => entry.photo,
  );
}

async function writePhotoFiles(
  target: Target,
  files: Map<string, string | Buffer>,
  message: string,
  head?: CommitHead,
) {
  for (const filePath of files.keys()) {
    if (
      !isSafePhotoPath(filePath) ||
      (!isPhotoPath(filePath) && !filePath.endsWith('.json'))
    ) {
      throw new PhotoRequestError('invalidPhotoPath');
    }
  }
  if (target.mode === 'local') {
    for (const [filePath, content] of files) {
      const destination = path.join(photosDirectory, filePath);
      await fs.mkdir(path.dirname(destination), { recursive: true });
      const [root, parent] = await Promise.all([
        fs.realpath(photosDirectory),
        fs.realpath(path.dirname(destination)),
      ]);
      if (parent !== root && !parent.startsWith(`${root}${path.sep}`)) {
        throw new PhotoRequestError('invalidPhotoPath');
      }
      const temporary = `${destination}.${crypto.randomUUID()}.tmp`;
      try {
        await fs.writeFile(temporary, content);
        await fs.rename(temporary, destination);
      } finally {
        await fs.unlink(temporary).catch((error) => {
          if (error.code !== 'ENOENT') throw error;
        });
      }
    }
    return { mode: 'local', path: 'photos/' };
  }

  if (!files.size)
    return { mode: 'github', path: 'photos/', repo: target.repo };
  const base = head ?? (await readHead(target));
  const tree: {
    path: string;
    mode: string;
    type: string;
    content?: string;
    sha?: string;
  }[] = [];
  for (const [filePath, content] of files) {
    const entry = { path: `photos/${filePath}`, mode: '100644', type: 'blob' };
    if (typeof content === 'string') tree.push({ ...entry, content });
    else {
      const blob = await githubRequest<{ sha: string }>(target, '/git/blobs', {
        method: 'POST',
        body: JSON.stringify({
          content: content.toString('base64'),
          encoding: 'base64',
        }),
      });
      tree.push({ ...entry, sha: blob.sha });
    }
  }
  const nextTree = await githubRequest<{ sha: string }>(target, '/git/trees', {
    method: 'POST',
    body: JSON.stringify({ base_tree: base.tree.sha, tree }),
  });
  const commit = await githubRequest<{ sha: string; html_url: string }>(
    target,
    '/git/commits',
    {
      method: 'POST',
      body: JSON.stringify({
        message,
        tree: nextTree.sha,
        parents: [base.sha],
      }),
    },
  );
  // Publish all changed sidecars together, without overwriting concurrent commits.
  try {
    await githubRequest(
      target,
      `/git/refs/heads/${encodeURIComponent(target.branch)}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ sha: commit.sha, force: false }),
      },
    );
  } catch (error) {
    if (
      error instanceof GitHubRequestError &&
      [409, 422].includes(error.status)
    ) {
      throw new PhotoWriteConflict(error.message);
    }
    throw error;
  }
  return {
    mode: 'github',
    path: 'photos/',
    repo: target.repo,
    commitUrl: commit.html_url,
  };
}

export async function saveRepositoryPhotos(input: unknown) {
  if (!Array.isArray(input)) throw new PhotoRequestError('invalidPhotoList');
  const ids = new Set<string>();
  const edits = input.map((item: unknown) => {
    if (!item || typeof item !== 'object')
      throw new PhotoRequestError('invalidPhotoList');
    const { id, alt, hidden } = item as Record<string, unknown>;
    if (
      typeof id !== 'string' ||
      !isPhotoPath(id) ||
      ids.has(id) ||
      typeof alt !== 'string' ||
      alt.length > 10000 ||
      typeof hidden !== 'boolean'
    ) {
      throw new PhotoRequestError('invalidPhotoList');
    }
    ids.add(id);
    return { id, alt, hidden };
  });
  const target = getRepositoryTarget();
  const { entries, head } = await readGallery(target);
  const byId = new Map(entries.map((entry) => [entry.photo.id, entry]));
  const sidecarCounts = new Map<string, number>();
  entries.forEach((entry) =>
    sidecarCounts.set(
      entry.metadataPath,
      (sidecarCounts.get(entry.metadataPath) ?? 0) + 1,
    ),
  );
  const files = new Map<string, string>();
  edits.forEach((edit, order) => {
    const entry = byId.get(edit.id);
    if (!entry) throw new PhotoRequestError('photoNotFound');
    const metadata = {
      ...entry.metadata,
      alt: edit.alt,
      hidden: edit.hidden,
      order,
    };
    if (JSON.stringify(metadata) === JSON.stringify(entry.metadata)) return;
    const metadataPath =
      sidecarCounts.get(entry.metadataPath)! > 1
        ? `${edit.id}.json`
        : entry.metadataPath;
    files.set(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`);
  });
  return writePhotoFiles(
    target,
    files,
    'chore: update photo descriptions and order',
    head,
  );
}

function photoTimestamp(timestamp: unknown): Date {
  if (timestamp === undefined) return new Date();
  if (
    typeof timestamp !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(timestamp)
  ) {
    throw new PhotoRequestError('invalidPhotoTimestamp');
  }
  const date = new Date(timestamp);
  if (!Number.isFinite(date.getTime()) || date.toISOString() !== timestamp) {
    throw new PhotoRequestError('invalidPhotoTimestamp');
  }
  return date;
}

function nextPhotoSequence(prefix: string, names: string[]): bigint {
  const pattern = new RegExp(`^${prefix}-(\\d+)(?:\\.|$)`, 'i');
  let next = BigInt(1);
  for (const name of names) {
    const match = name.match(pattern);
    if (!match) continue;
    const sequence = BigInt(match[1]);
    if (sequence >= next) next = sequence + BigInt(1);
  }
  return next;
}

async function uploadLocalPhoto(
  prefix: string,
  extension: string,
  content: Buffer,
  metadata: Record<string, unknown>,
) {
  await fs.mkdir(photosDirectory, { recursive: true });
  let sequence = nextPhotoSequence(prefix, await fs.readdir(photosDirectory));
  const temporary = path.join(photosDirectory, `.${crypto.randomUUID()}.tmp`);
  try {
    await fs.writeFile(temporary, content, { flag: 'wx' });
    for (;;) {
      const id = `${prefix}-${sequence++}${extension}`;
      const metadataPath = path.join(photosDirectory, photoMetadataPath(id));
      let reservation;
      try {
        // The shared sidecar reserves the name across formats and server processes.
        reservation = await fs.open(metadataPath, 'wx');
        await reservation.writeFile(`${JSON.stringify(metadata, null, 2)}\n`);
        await reservation.close();
        // Publish the completed image without replacing an existing file.
        await fs.link(temporary, path.join(photosDirectory, id));
        return {
          photo: createPhoto(id, metadata),
          result: { mode: 'local', path: 'photos/' },
        };
      } catch (error) {
        if (reservation) {
          await reservation.close();
          await fs.unlink(metadataPath);
        }
        if ((error as NodeJS.ErrnoException).code === 'EEXIST') continue;
        throw error;
      }
    }
  } finally {
    await fs.unlink(temporary).catch((error) => {
      if (error.code !== 'ENOENT') throw error;
    });
  }
}

export async function uploadRepositoryPhoto(file: File, timestamp?: unknown) {
  const extension = path.extname(file.name).toLowerCase();
  if (!isPhotoPath(`image${extension}`))
    throw new PhotoRequestError('unsupportedFileType');
  if (file.size <= 0) throw new PhotoRequestError('fileCannotBeEmpty');
  if (file.size > 50 * 1024 * 1024)
    throw new PhotoRequestError('fileMustBe50MBOrSmaller');
  const date = photoTimestamp(timestamp);
  const prefix = `p-${date.toISOString().slice(0, -1).replace(/[T:.]/g, '-')}`;
  const metadata = {
    alt: file.name.replace(/\.[^.]+$/, ''),
    order: -date.getTime(),
  };
  const target = getRepositoryTarget();
  const content = Buffer.from(await file.arrayBuffer());
  if (target.mode === 'local')
    return uploadLocalPhoto(prefix, extension, content, metadata);

  for (let attempt = 0; ; attempt++) {
    const head = await readHead(target);
    const names = (await readPhotoTree(target, head)).map(
      (entry) => entry.path,
    );
    const id = `${prefix}-${nextPhotoSequence(prefix, names)}${extension}`;
    const files = new Map<string, string | Buffer>([
      [photoMetadataPath(id), `${JSON.stringify(metadata, null, 2)}\n`],
      [id, content],
    ]);
    try {
      const result = await writePhotoFiles(
        target,
        files,
        `feat: upload photo ${id}`,
        head,
      );
      return { photo: createPhoto(id, metadata), result };
    } catch (error) {
      // Another upload may have claimed this name after we read the branch.
      if (!(error instanceof PhotoWriteConflict) || attempt >= 4) throw error;
    }
  }
}

export async function importRepositoryPhoto(
  mediaPath: unknown,
  timestamp?: unknown,
) {
  if (
    typeof mediaPath !== 'string' ||
    !/^photos\/\d{4}\/[a-z0-9][a-z0-9.-]*\.[a-z0-9]+$/.test(mediaPath) ||
    !isPhotoPath(mediaPath)
  )
    throw new PhotoRequestError('invalidPhotoPath');
  const target = getRepositoryTarget();
  const content =
    target.mode === 'github'
      ? await readGitHubImage(target, `content/media/${mediaPath}`)
      : (await readRepositoryMediaFile(mediaPath))?.content;
  if (!content) throw new PhotoRequestError('photoNotFound');
  return uploadRepositoryPhoto(
    new File([new Uint8Array(content)], path.basename(mediaPath)),
    timestamp,
  );
}

export async function readRepositoryPhoto(
  filePath: string,
): Promise<Buffer | null> {
  if (!isPhotoPath(filePath)) return null;
  const local = await readLocalPhoto(filePath);
  if (local) return local;
  const target = getRepositoryTarget();
  if (target.mode === 'local') return null;
  return readGitHubImage(target, `photos/${filePath}`);
}

async function readGitHubImage(
  target: GitHubTarget,
  repositoryPath: string,
): Promise<Buffer | null> {
  // Raw responses support images larger than the Contents API's inline base64 limit.
  const encodedPath = repositoryPath
    .split('/')
    .map(encodeURIComponent)
    .join('/');
  const response = await fetch(
    `https://api.github.com/repos/${target.repo}/contents/${encodedPath}?ref=${encodeURIComponent(target.branch)}`,
    {
      headers: {
        Accept: 'application/vnd.github.raw+json',
        Authorization: `Bearer ${target.token}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
      cache: 'no-store',
    },
  );
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('photoReadFailed');
  return Buffer.from(await response.arrayBuffer());
}
