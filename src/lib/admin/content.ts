import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import type { ProfileConfig } from '@/types/platform-config';

type WriteMode = 'github' | 'local';

type RepositoryTarget =
  | {
      branch: string;
      mode: 'github';
      repo: string;
      token: string;
    }
  | {
      branch: string;
      mode: 'local';
    };

interface WriteFileOptions {
  content: string;
  filePath: string;
  message: string;
}

interface WriteFileResult {
  branch?: string;
  commitUrl?: string;
  mode: WriteMode;
  path: string;
  repo?: string;
}

interface WriteBinaryFileOptions {
  content: Buffer;
  filePath: string;
  message: string;
}

interface DeleteFileOptions {
  filePath: string;
  message: string;
}

export interface RepositoryMediaFile {
  content: Buffer;
  contentType: string;
}

export interface MediaFileSummary {
  name: string;
  path: string;
  size: number;
  type: string;
  url: string;
}

export interface AdminStatus {
  branch: string;
  hasAdminPassword: boolean;
  hasGitHubConfig: boolean;
  mode: WriteMode;
  repo?: string;
}

export interface AdminPostSummary {
  date: string;
  description: string;
  draft: boolean;
  path: string;
  slug: string;
  tags: string[];
  title: string;
  updatedAt?: string;
}

export interface AdminPostDetail extends AdminPostSummary {
  content: string;
}

const allowedLocalFiles = new Set([
  'public/platform-config.json',
  'public/avatar.png',
  'public/logo.png',
]);
const mediaPathPattern =
  /^content\/media\/(photos|videos|audio|files)\/\d{4}\/[a-z0-9][a-z0-9.-]*\.[a-z0-9]+$/;

function getRepositoryTarget(): RepositoryTarget {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'deploy';

  if (token && repo) {
    return {
      branch,
      mode: 'github',
      repo,
      token,
    };
  }

  return {
    branch,
    mode: 'local',
  };
}

export function getAdminStatus(): AdminStatus {
  const target = getRepositoryTarget();
  const hasGitHubConfig = target.mode === 'github';

  return {
    branch: target.branch,
    hasAdminPassword: Boolean(process.env.ADMIN_PASSWORD),
    hasGitHubConfig,
    mode: target.mode,
    repo: hasGitHubConfig ? target.repo : undefined,
  };
}

export function isAdminAuthorized(request: Request): boolean {
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    return false;
  }

  return request.headers.get('x-admin-token') === password;
}

export function createUnauthorizedResponse() {
  return Response.json(
    { message: '管理员口令未配置或不正确。' },
    { status: 401 },
  );
}

export function normalizePostSlug(slug: string): string {
  return slug
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

export function createPostMarkdown(input: {
  content: string;
  date: string;
  description?: string;
  draft?: boolean;
  tags?: string[];
  title: string;
}): string {
  const fields: string[] = [
    `title: ${toYamlString(input.title)}`,
    `date: ${toYamlString(input.date)}`,
  ];

  if (input.description) {
    fields.push(`description: ${toYamlString(input.description)}`);
  }

  if (input.tags?.length) {
    fields.push('tags:');
    input.tags.forEach((tag) => {
      fields.push(`  - ${toYamlString(tag)}`);
    });
  }

  if (input.draft) {
    fields.push('draft: true');
  }

  return `---\n${fields.join('\n')}\n---\n\n${input.content.trim()}\n`;
}

export function validatePlatformConfig(config: ProfileConfig): ProfileConfig {
  return {
    profile: {
      avatar: String(config.profile?.avatar || ''),
      bio: String(config.profile?.bio || ''),
      name: String(config.profile?.name || ''),
    },
    projectSections: (config.projectSections || []).map((section) => ({
      id: String(section.id || ''),
      projects: (section.projects || []).map((project) => ({
        description: project.description
          ? String(project.description)
          : undefined,
        icon: project.icon ? String(project.icon) : undefined,
        id: String(project.id || ''),
        title: String(project.title || ''),
        url: String(project.url || ''),
      })),
      title: String(section.title || ''),
    })),
    socialLinks: (config.socialLinks || []).map((link) => ({
      icon: String(link.icon || ''),
      id: String(link.id || ''),
      platform: String(link.platform || ''),
      url: String(link.url || ''),
    })),
    websiteLinks: (config.websiteLinks || []).map((link) => ({
      description: link.description ? String(link.description) : undefined,
      id: String(link.id || ''),
      title: String(link.title || ''),
      url: String(link.url || ''),
    })),
  };
}

export async function listRepositoryPosts(): Promise<AdminPostSummary[]> {
  const target = getRepositoryTarget();

  if (target.mode === 'github') {
    return listGitHubPosts(target);
  }

  return listLocalPosts();
}

export async function readRepositoryPost(
  slug: string,
): Promise<AdminPostDetail | null> {
  const normalizedSlug = normalizePostSlug(slug);

  if (!normalizedSlug) {
    return null;
  }

  const filePath = `posts/${normalizedSlug}.md`;
  const target = getRepositoryTarget();

  if (target.mode === 'github') {
    const content = await readGitHubTextFile(target, filePath);

    return content === null ? null : parsePostDetail(filePath, content);
  }

  return readLocalPost(filePath);
}

export async function writeRepositoryFile(
  options: WriteFileOptions,
): Promise<WriteFileResult> {
  const target = getRepositoryTarget();

  if (target.mode === 'github') {
    return writeGitHubFile(target, options);
  }

  return writeLocalFile(options);
}

export async function deleteRepositoryPost(
  slug: string,
): Promise<WriteFileResult> {
  const normalizedSlug = normalizePostSlug(slug);

  if (!normalizedSlug) {
    throw new Error('请输入有效的文章路径。');
  }

  const filePath = `posts/${normalizedSlug}.md`;
  const target = getRepositoryTarget();

  if (target.mode === 'github') {
    return deleteGitHubFile(target, {
      filePath,
      message: `chore: delete post "${normalizedSlug}"`,
    });
  }

  throw new Error(
    '未配置 GitHub 写入，已阻止在本地 main 工作区删除 posts 文件。',
  );
}

export async function updateRepositoryPostDraft(
  slug: string,
  draft: boolean,
): Promise<WriteFileResult> {
  const post = await readRepositoryPost(slug);

  if (!post) {
    throw new Error('文章不存在。');
  }

  return writeRepositoryFile({
    content: createPostMarkdown({
      content: post.content,
      date: post.date || new Date().toISOString(),
      description: post.description,
      draft,
      tags: post.tags,
      title: post.title,
    }),
    filePath: post.path,
    message: draft
      ? `chore: hide post "${post.title}"`
      : `chore: publish post "${post.title}"`,
  });
}

export async function writeRepositoryBinaryFile(
  options: WriteBinaryFileOptions,
): Promise<WriteFileResult> {
  const target = getRepositoryTarget();

  if (target.mode === 'github') {
    return writeGitHubBinaryFile(target, options);
  }

  return writeLocalBinaryFile(options);
}

export async function readRepositoryMediaFile(
  mediaPath: string,
): Promise<RepositoryMediaFile | null> {
  const filePath = toContentMediaPath(mediaPath);
  const target = getRepositoryTarget();

  if (target.mode === 'github') {
    return readGitHubMediaFile(target, filePath);
  }

  return readLocalMediaFile(filePath);
}

export async function listRepositoryMedia(): Promise<MediaFileSummary[]> {
  const target = getRepositoryTarget();

  if (target.mode === 'github') {
    return listGitHubMedia(target);
  }

  return listLocalMedia();
}

export async function deleteRepositoryMediaFile(
  mediaPath: string,
): Promise<WriteFileResult> {
  const filePath = toContentMediaPath(mediaPath);
  const target = getRepositoryTarget();

  if (target.mode === 'github') {
    return deleteGitHubFile(target, {
      filePath,
      message: `chore: delete media ${path.basename(filePath)}`,
    });
  }

  throw new Error('未配置 GitHub 写入，已阻止在本地模式下删除媒体文件。');
}

async function writeLocalFile({
  content,
  filePath,
}: WriteFileOptions): Promise<WriteFileResult> {
  if (isPostPath(filePath)) {
    throw new Error(
      '未配置 GitHub 写入，已阻止在本地 main 工作区创建 posts 目录。',
    );
  }

  const absolutePath = getLocalWritePath(filePath);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, content, 'utf8');

  return {
    mode: 'local',
    path: filePath,
  };
}

async function writeLocalBinaryFile({
  content,
  filePath,
}: WriteBinaryFileOptions): Promise<WriteFileResult> {
  const absolutePath = getLocalWritePath(filePath);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, content);

  return {
    mode: 'local',
    path: filePath,
  };
}

async function readLocalPost(
  filePath: string,
): Promise<AdminPostDetail | null> {
  try {
    const absolutePath = getLocalPostReadPath(filePath);
    const content = await fs.readFile(absolutePath, 'utf8');

    return parsePostDetail(filePath, content);
  } catch {
    return null;
  }
}

async function writeGitHubFile(
  target: Extract<RepositoryTarget, { mode: 'github' }>,
  { content, filePath, message }: WriteFileOptions,
): Promise<WriteFileResult> {
  assertAllowedPath(filePath);

  const encodedPath = filePath.split('/').map(encodeURIComponent).join('/');
  const existing = await githubRequest<{ sha?: string } | null>(
    target,
    `/contents/${encodedPath}?ref=${encodeURIComponent(target.branch)}`,
    { allowNotFound: true },
  );

  const result = await githubRequest<{
    commit?: {
      html_url?: string;
    };
  }>(target, `/contents/${encodedPath}`, {
    body: JSON.stringify({
      branch: target.branch,
      content: Buffer.from(content, 'utf8').toString('base64'),
      message,
      sha: existing?.sha,
    }),
    method: 'PUT',
  });

  return {
    branch: target.branch,
    commitUrl: result.commit?.html_url,
    mode: 'github',
    path: filePath,
    repo: target.repo,
  };
}

async function deleteGitHubFile(
  target: Extract<RepositoryTarget, { mode: 'github' }>,
  { filePath, message }: DeleteFileOptions,
): Promise<WriteFileResult> {
  assertAllowedPath(filePath);

  const encodedPath = filePath.split('/').map(encodeURIComponent).join('/');
  const existing = await githubRequest<GitHubContentItem | null>(
    target,
    `/contents/${encodedPath}?ref=${encodeURIComponent(target.branch)}`,
    { allowNotFound: true },
  );

  if (!existing?.sha) {
    throw new Error('文章不存在。');
  }

  const result = await githubRequest<{
    commit?: {
      html_url?: string;
    };
  }>(target, `/contents/${encodedPath}`, {
    body: JSON.stringify({
      branch: target.branch,
      message,
      sha: existing.sha,
    }),
    method: 'DELETE',
  });

  return {
    branch: target.branch,
    commitUrl: result.commit?.html_url,
    mode: 'github',
    path: filePath,
    repo: target.repo,
  };
}

async function writeGitHubBinaryFile(
  target: Extract<RepositoryTarget, { mode: 'github' }>,
  { content, filePath, message }: WriteBinaryFileOptions,
): Promise<WriteFileResult> {
  assertAllowedPath(filePath);

  const encodedPath = filePath.split('/').map(encodeURIComponent).join('/');
  const existing = await githubRequest<{ sha?: string } | null>(
    target,
    `/contents/${encodedPath}?ref=${encodeURIComponent(target.branch)}`,
    { allowNotFound: true },
  );

  const result = await githubRequest<{
    commit?: {
      html_url?: string;
    };
  }>(target, `/contents/${encodedPath}`, {
    body: JSON.stringify({
      branch: target.branch,
      content: content.toString('base64'),
      message,
      sha: existing?.sha,
    }),
    method: 'PUT',
  });

  return {
    branch: target.branch,
    commitUrl: result.commit?.html_url,
    mode: 'github',
    path: filePath,
    repo: target.repo,
  };
}

async function readGitHubTextFile(
  target: Extract<RepositoryTarget, { mode: 'github' }>,
  filePath: string,
): Promise<string | null> {
  assertAllowedPath(filePath);

  const encodedPath = filePath.split('/').map(encodeURIComponent).join('/');
  const file = await githubRequest<GitHubContentItem | null>(
    target,
    `/contents/${encodedPath}?ref=${encodeURIComponent(target.branch)}`,
    { allowNotFound: true },
  );

  if (!file?.content) {
    return null;
  }

  return decodeGitHubContent(file.content);
}

async function readLocalMediaFile(
  filePath: string,
): Promise<RepositoryMediaFile | null> {
  try {
    const absolutePath = getLocalWritePath(filePath);

    return {
      content: await fs.readFile(absolutePath),
      contentType: getContentType(filePath),
    };
  } catch {
    return null;
  }
}

async function readGitHubMediaFile(
  target: Extract<RepositoryTarget, { mode: 'github' }>,
  filePath: string,
): Promise<RepositoryMediaFile | null> {
  const encodedPath = filePath.split('/').map(encodeURIComponent).join('/');
  const file = await githubRequest<GitHubContentItem | null>(
    target,
    `/contents/${encodedPath}?ref=${encodeURIComponent(target.branch)}`,
    { allowNotFound: true },
  );

  if (!file?.content) {
    return null;
  }

  return {
    content: Buffer.from(file.content.replace(/\n/g, ''), 'base64'),
    contentType: getContentType(filePath),
  };
}

async function listLocalPosts(): Promise<AdminPostSummary[]> {
  const postsDirectory = path.join(process.cwd(), 'posts');

  try {
    const fileNames = await fs.readdir(postsDirectory);
    const posts = await Promise.all(
      fileNames
        .filter((fileName) => isPostFileName(fileName))
        .map(async (fileName) => {
          const filePath = path.join(postsDirectory, fileName);
          const content = await fs.readFile(filePath, 'utf8');

          return parsePostSummary(`posts/${fileName}`, content);
        }),
    );

    return sortPosts(posts);
  } catch {
    return [];
  }
}

async function listGitHubPosts(
  target: Extract<RepositoryTarget, { mode: 'github' }>,
): Promise<AdminPostSummary[]> {
  const items = await githubRequest<GitHubContentItem[] | null>(
    target,
    `/contents/posts?ref=${encodeURIComponent(target.branch)}`,
    { allowNotFound: true },
  );

  if (!Array.isArray(items)) {
    return [];
  }

  const markdownFiles = items.filter(
    (item) => item.type === 'file' && isPostFileName(item.name),
  );

  const postResults = await Promise.allSettled(
    markdownFiles.map(async (item) => {
      const encodedPath = item.path
        .split('/')
        .map(encodeURIComponent)
        .join('/');
      const file = await githubRequest<GitHubContentItem>(
        target,
        `/contents/${encodedPath}?ref=${encodeURIComponent(target.branch)}`,
      );

      return parsePostSummary(
        file.path,
        decodeGitHubContent(file.content),
        file.updated_at,
      );
    }),
  );

  return sortPosts(
    postResults
      .filter(
        (result): result is PromiseFulfilledResult<AdminPostSummary> =>
          result.status === 'fulfilled',
      )
      .map((result) => result.value),
  );
}

const mediaCategories = ['photos', 'videos', 'audio', 'files'] as const;

async function listGitHubMedia(
  target: Extract<RepositoryTarget, { mode: 'github' }>,
): Promise<MediaFileSummary[]> {
  const results: MediaFileSummary[] = [];

  for (const category of mediaCategories) {
    const categoryPath = `content/media/${category}`;
    const yearDirs = await githubRequest<GitHubContentItem[] | null>(
      target,
      `/contents/${categoryPath}?ref=${encodeURIComponent(target.branch)}`,
      { allowNotFound: true },
    );

    if (!Array.isArray(yearDirs)) continue;

    for (const yearDir of yearDirs) {
      if (yearDir.type !== 'dir') continue;

      const encodedYear = yearDir.path
        .split('/')
        .map(encodeURIComponent)
        .join('/');
      const files = await githubRequest<GitHubContentItem[] | null>(
        target,
        `/contents/${encodedYear}?ref=${encodeURIComponent(target.branch)}`,
        { allowNotFound: true },
      );

      if (!Array.isArray(files)) continue;

      for (const file of files) {
        if (file.type !== 'file') continue;

        const mediaPath = `${category}/${yearDir.name}/${file.name}`;

        results.push({
          name: file.name,
          path: mediaPath,
          size: file.size ?? 0,
          type: getContentType(file.name),
          url: `/media/${mediaPath}`,
        });
      }
    }
  }

  return results.sort((a, b) => b.name.localeCompare(a.name));
}

async function listLocalMedia(): Promise<MediaFileSummary[]> {
  const results: MediaFileSummary[] = [];
  const mediaRoot = path.join(process.cwd(), 'content', 'media');

  for (const category of mediaCategories) {
    const categoryDir = path.join(mediaRoot, category);

    let yearDirs: string[];

    try {
      yearDirs = await fs.readdir(categoryDir);
    } catch {
      continue;
    }

    for (const year of yearDirs) {
      const yearDir = path.join(categoryDir, year);

      let files: string[];

      try {
        files = await fs.readdir(yearDir);
      } catch {
        continue;
      }

      for (const fileName of files) {
        const filePath = path.join(yearDir, fileName);
        const stat = await fs.stat(filePath).catch(() => null);

        if (!stat?.isFile()) continue;

        const mediaPath = `${category}/${year}/${fileName}`;

        results.push({
          name: fileName,
          path: mediaPath,
          size: stat.size,
          type: getContentType(fileName),
          url: `/media/${mediaPath}`,
        });
      }
    }
  }

  return results.sort((a, b) => b.name.localeCompare(a.name));
}

async function githubRequest<T>(
  target: Extract<RepositoryTarget, { mode: 'github' }>,
  endpoint: string,
  options: RequestInit & { allowNotFound?: boolean } = {},
): Promise<T> {
  const response = await fetch(
    `https://api.github.com/repos/${target.repo}${endpoint}`,
    {
      ...options,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${target.token}`,
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...options.headers,
      },
    },
  );

  if (options.allowNotFound && response.status === 404) {
    return null as T;
  }

  const responseText = await response.text();
  const data = responseText ? JSON.parse(responseText) : {};

  if (!response.ok) {
    throw new Error(data.message || 'GitHub 写入失败。');
  }

  return data as T;
}

interface GitHubContentItem {
  content?: string;
  encoding?: string;
  name: string;
  path: string;
  sha?: string;
  size?: number;
  type: string;
  updated_at?: string;
}

function decodeGitHubContent(content?: string) {
  return Buffer.from(content?.replace(/\n/g, '') || '', 'base64').toString(
    'utf8',
  );
}

function parsePostSummary(
  filePath: string,
  fileContent: string,
  updatedAt?: string,
): AdminPostSummary {
  const fileName = path.basename(filePath);
  const slug = fileName.replace(/\.md$/, '');
  const { data } = matter(fileContent);

  return {
    date: normalizeDate(data.date),
    description: String(data.description || ''),
    draft: Boolean(data.draft),
    path: filePath,
    slug,
    tags: normalizeTags(data.tags),
    title: String(data.title || slug),
    updatedAt,
  };
}

function parsePostDetail(
  filePath: string,
  fileContent: string,
  updatedAt?: string,
): AdminPostDetail {
  const summary = parsePostSummary(filePath, fileContent, updatedAt);
  const { content } = matter(fileContent);

  return {
    ...summary,
    content: content.trimEnd(),
  };
}

function normalizeDate(value: unknown) {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return value ? String(value) : '';
}

function normalizeTags(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((tag) => String(tag)).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
}

function sortPosts(posts: AdminPostSummary[]) {
  return posts.sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;

    return a.date < b.date ? 1 : -1;
  });
}

function isPostFileName(fileName: string) {
  return fileName.endsWith('.md') && fileName !== '404.md';
}

function assertAllowedPath(filePath: string) {
  const normalized = filePath.replace(/\\/g, '/');

  if (
    !isPostPath(normalized) &&
    !allowedLocalFiles.has(normalized) &&
    !isMediaPath(normalized)
  ) {
    throw new Error('不允许写入该路径。');
  }

  if (normalized.includes('..')) {
    throw new Error('不允许写入该路径。');
  }
}

function getLocalWritePath(filePath: string) {
  assertAllowedPath(filePath);

  const normalized = filePath.replace(/\\/g, '/');

  if (allowedLocalFiles.has(normalized)) {
    return path.join(process.cwd(), 'public', path.basename(normalized));
  }

  if (isMediaPath(normalized)) {
    const [, , mediaType, year, fileName] = normalized.split('/');

    return path.join(
      process.cwd(),
      'content',
      'media',
      mediaType,
      year,
      fileName,
    );
  }

  throw new Error('本地模式只允许保存站点配置和媒体文件。');
}

function getLocalPostReadPath(filePath: string) {
  assertAllowedPath(filePath);

  const normalized = filePath.replace(/\\/g, '/');

  if (!isPostPath(normalized)) {
    throw new Error('不允许读取该路径。');
  }

  return path.join(process.cwd(), 'posts', path.basename(normalized));
}

function isPostPath(filePath: string) {
  const normalized = filePath.replace(/\\/g, '/');

  return normalized.startsWith('posts/') && normalized.endsWith('.md');
}

function isMediaPath(filePath: string) {
  const normalized = filePath.replace(/\\/g, '/');

  return mediaPathPattern.test(normalized);
}

function toContentMediaPath(mediaPath: string) {
  const normalized = mediaPath.replace(/\\/g, '/').replace(/^\/+/, '');
  const filePath = `content/media/${normalized}`;

  if (!isMediaPath(filePath)) {
    throw new Error('不允许读取该路径。');
  }

  return filePath;
}

function getContentType(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();

  switch (extension) {
    case '.avif':
      return 'image/avif';
    case '.gif':
      return 'image/gif';
    case '.jpeg':
    case '.jpg':
      return 'image/jpeg';
    case '.mp3':
      return 'audio/mpeg';
    case '.mp4':
      return 'video/mp4';
    case '.ogg':
      return 'audio/ogg';
    case '.pdf':
      return 'application/pdf';
    case '.png':
      return 'image/png';
    case '.svg':
      return 'image/svg+xml';
    case '.txt':
      return 'text/plain; charset=utf-8';
    case '.webm':
      return 'video/webm';
    case '.webp':
      return 'image/webp';
    default:
      return 'application/octet-stream';
  }
}

function toYamlString(value: string): string {
  return JSON.stringify(value);
}
