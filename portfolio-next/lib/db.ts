import Database from 'better-sqlite3';
import path from 'path';

// Singleton connection – Next.js may hot-reload so we cache on globalThis in dev.
const g = globalThis as typeof globalThis & { __db?: Database.Database };

function getDb(): Database.Database {
  if (!g.__db) {
    const dbPath = path.join(process.cwd(), 'portfolio.db');
    const db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema(db);
    g.__db = db;
  }
  return g.__db;
}

function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS post_types (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      slug        TEXT    NOT NULL UNIQUE,
      label       TEXT    NOT NULL,
      description TEXT    NOT NULL DEFAULT '',
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS posts (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      title             TEXT    NOT NULL,
      slug              TEXT    NOT NULL UNIQUE,
      post_type         TEXT    NOT NULL,
      excerpt           TEXT    NOT NULL DEFAULT '',
      content_markdown  TEXT    NOT NULL DEFAULT '',
      content_html      TEXT    NOT NULL DEFAULT '',
      cover_image       TEXT,
      tags              TEXT    NOT NULL DEFAULT '[]',
      status            TEXT    NOT NULL DEFAULT 'published',
      meta_json         TEXT    NOT NULL DEFAULT '{}',
      created_at        TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at        TEXT    NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (post_type) REFERENCES post_types(slug)
    );

    CREATE INDEX IF NOT EXISTS idx_posts_post_type ON posts(post_type);
    CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);

    CREATE TABLE IF NOT EXISTS post_media (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id      INTEGER,
      original_name TEXT   NOT NULL,
      file_path    TEXT    NOT NULL,
      media_kind   TEXT    NOT NULL,
      mime_type    TEXT    NOT NULL,
      size_bytes   INTEGER NOT NULL,
      alt_text     TEXT    NOT NULL DEFAULT '',
      created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE SET NULL
    );

    CREATE TRIGGER IF NOT EXISTS posts_updated_at
    AFTER UPDATE ON posts
    BEGIN
      UPDATE posts SET updated_at = datetime('now') WHERE id = NEW.id;
    END;
  `);

  // Seed default post types so the editor can support multiple content kinds.
  db.prepare(
    `INSERT OR IGNORE INTO post_types (slug, label, description) VALUES
      ('project', 'Project', 'Portfolio project with technical details'),
      ('skill', 'Skill', 'Skill profile entry such as tools, languages, strengths'),
      ('life', 'Life', 'Timeline-style milestone or biography section'),
      ('about', 'About', 'About section content for the homepage'),
      ('hobby', 'Hobby', 'Hobby cards for the homepage'),
      ('reference', 'Reference', 'Reference entries for the homepage'),
      ('lifehistory', 'Life History (legacy)', 'Legacy alias for life content'),
      ('note', 'Note', 'Short update or thought'),
      ('experiment', 'Experiment', 'Prototype, trial, or concept post')`
  ).run();

  // Normalize legacy type naming so URLs and Studio terminology use "life" consistently.
  db.prepare("UPDATE posts SET post_type = 'life' WHERE post_type = 'lifehistory'").run();

  migrateLegacyProjects(db);
}

function migrateLegacyProjects(db: Database.Database): void {
  const hasLegacyTable = db
    .prepare(`SELECT 1 as present FROM sqlite_master WHERE type = 'table' AND name = 'projects'`)
    .get() as { present?: number } | undefined;

  if (!hasLegacyTable?.present) return;

  db.prepare(
    `INSERT OR IGNORE INTO posts (title, slug, post_type, excerpt, content_markdown, content_html, cover_image, tags, status)
     SELECT
       p.title,
       p.slug,
       'project',
       p.description,
       '',
       p.body,
       p.cover_image,
       p.tags,
       'published'
     FROM projects p`
  ).run();
}

// ── Query helpers ─────────────────────────────────────────────────────────────

export type PostType = {
  id: number;
  slug: string;
  label: string;
  description: string;
  created_at: string;
};

export type PostRecord = {
  id: number;
  title: string;
  slug: string;
  post_type: string;
  excerpt: string;
  content_markdown: string;
  content_html: string;
  cover_image: string | null;
  tags: string;
  status: string;
  meta_json: string;
  created_at: string;
  updated_at: string;
};

export type StudioPostSummary = {
  id: number;
  title: string;
  slug: string;
  post_type: string;
  status: string;
  updated_at: string;
};

export function getPostTypes() {
  return getDb().prepare('SELECT * FROM post_types ORDER BY label ASC').all() as PostType[];
}

export function ensurePostType(slug: string, label?: string) {
  const cleanSlug = slug.trim().toLowerCase();
  if (!cleanSlug) throw new Error('post_type is required');
  getDb()
    .prepare('INSERT OR IGNORE INTO post_types (slug, label) VALUES (?, ?)')
    .run(cleanSlug, label?.trim() || cleanSlug);
}

export function getPostsByType(postType: string, status: 'published' | 'draft' | 'all' = 'published') {
  if (status === 'all') {
    return getDb()
      .prepare('SELECT * FROM posts WHERE post_type = ? ORDER BY created_at DESC')
      .all(postType) as PostRecord[];
  }

  return getDb()
    .prepare('SELECT * FROM posts WHERE post_type = ? AND status = ? ORDER BY created_at DESC')
    .all(postType, status) as PostRecord[];
}

export function getPostByTypeAndSlug(postType: string, slug: string, includeDraft = false) {
  const row = includeDraft
    ? getDb()
      .prepare('SELECT * FROM posts WHERE post_type = ? AND slug = ?')
      .get(postType, slug)
    : getDb()
      .prepare('SELECT * FROM posts WHERE post_type = ? AND slug = ? AND status = ?')
      .get(postType, slug, 'published');

  return (row as PostRecord | undefined) ?? null;
}

export function getStudioPosts(postType?: string, status: 'published' | 'draft' | 'all' = 'all') {
  const filters: string[] = [];
  const values: Array<string> = [];

  if (postType) {
    filters.push('post_type = ?');
    values.push(postType);
  }

  if (status !== 'all') {
    filters.push('status = ?');
    values.push(status);
  }

  const where = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
  const sql = `
    SELECT id, title, slug, post_type, status, updated_at
    FROM posts
    ${where}
    ORDER BY updated_at DESC
  `;

  return getDb().prepare(sql).all(...values) as StudioPostSummary[];
}

export function getPostById(id: number) {
  return (getDb().prepare('SELECT * FROM posts WHERE id = ?').get(id) as PostRecord | undefined) ?? null;
}

export function createPost(data: {
  title: string;
  slug: string;
  post_type: string;
  excerpt?: string;
  content_markdown?: string;
  content_html?: string;
  cover_image?: string | null;
  tags?: string;
  status?: 'published' | 'draft';
  meta_json?: string;
}) {
  ensurePostType(data.post_type);

  return getDb()
    .prepare(
      `INSERT INTO posts
      (title, slug, post_type, excerpt, content_markdown, content_html, cover_image, tags, status, meta_json)
      VALUES (@title, @slug, @post_type, @excerpt, @content_markdown, @content_html, @cover_image, @tags, @status, @meta_json)`
    )
    .run({
      excerpt: '',
      content_markdown: '',
      content_html: '',
      cover_image: null,
      tags: '[]',
      status: 'published',
      meta_json: '{}',
      ...data,
    });
}

export function addMediaRecord(data: {
  post_id?: number | null;
  original_name: string;
  file_path: string;
  media_kind: 'image' | 'video' | 'audio' | 'document' | 'other';
  mime_type: string;
  size_bytes: number;
  alt_text?: string;
}) {
  return getDb()
    .prepare(
      `INSERT INTO post_media (post_id, original_name, file_path, media_kind, mime_type, size_bytes, alt_text)
       VALUES (@post_id, @original_name, @file_path, @media_kind, @mime_type, @size_bytes, @alt_text)`
    )
    .run({ post_id: null, alt_text: '', ...data });
}

export function updatePostById(
  id: number,
  data: Partial<{
    title: string;
    slug: string;
    post_type: string;
    excerpt: string;
    content_markdown: string;
    content_html: string;
    cover_image: string | null;
    tags: string;
    status: 'published' | 'draft';
  }>
) {
  const keys = Object.keys(data);
  if (keys.length === 0) return { changes: 0 };

  if (data.post_type) {
    ensurePostType(data.post_type);
  }

  const sets = keys.map((k) => `${k} = @${k}`).join(', ');
  return getDb().prepare(`UPDATE posts SET ${sets} WHERE id = @id`).run({ id, ...data });
}

export function deletePostById(id: number) {
  return getDb().prepare('DELETE FROM posts WHERE id = ?').run(id);
}

export function getProjects() {
  return getDb().prepare(
    `SELECT
      id,
      title,
      slug,
      excerpt AS description,
      content_html AS body,
      cover_image,
      tags,
      created_at,
      updated_at
    FROM posts
    WHERE post_type = 'project' AND status = 'published'
    ORDER BY created_at DESC`
  ).all();
}

export function getProjectBySlug(slug: string) {
  return (
    getDb().prepare(
      `SELECT
        id,
        title,
        slug,
        excerpt AS description,
        content_html AS body,
        cover_image,
        tags,
        created_at,
        updated_at
      FROM posts
      WHERE post_type = 'project' AND status = 'published' AND slug = ?`
    ).get(slug) ?? null
  );
}

export function createProject(data: {
  title: string;
  slug: string;
  description: string;
  body: string;
  cover_image?: string | null;
  tags?: string;
}) {
  return createPost({
    title: data.title,
    slug: data.slug,
    post_type: 'project',
    excerpt: data.description,
    content_html: data.body,
    cover_image: data.cover_image,
    tags: data.tags,
    status: 'published',
  });
}

export function updateProject(
  id: number,
  data: Partial<{
    title: string;
    description: string;
    body: string;
    cover_image: string | null;
    tags: string;
  }>
) {
  const mapped: Record<string, unknown> = {};
  if (data.title !== undefined) mapped.title = data.title;
  if (data.description !== undefined) mapped.excerpt = data.description;
  if (data.body !== undefined) mapped.content_html = data.body;
  if (data.cover_image !== undefined) mapped.cover_image = data.cover_image;
  if (data.tags !== undefined) mapped.tags = data.tags;

  const keys = Object.keys(mapped);
  if (keys.length === 0) return { changes: 0 };

  const sets = keys.map((k) => `${k} = @${k}`).join(', ');
  return getDb().prepare(`UPDATE posts SET ${sets} WHERE id = @id`).run({ id, ...mapped });
}

export function deleteProject(id: number) {
  return getDb().prepare("DELETE FROM posts WHERE id = ? AND post_type = 'project'").run(id);
}

// ── Media & Post Association Queries ────────────────────────────────────────

export type MediaRecord = {
  id: number;
  post_id: number | null;
  original_name: string;
  file_path: string;
  media_kind: 'image' | 'video' | 'audio' | 'document' | 'other';
  mime_type: string;
  size_bytes: number;
  alt_text: string;
  created_at: string;
};

export type MediaWithUsage = MediaRecord & {
  usage_count: number;
};

export type PostSummaryWithStats = {
  id: number;
  title: string;
  slug: string;
  post_type: string;
  status: string;
  cover_image: string | null;
  updated_at: string;
  created_at: string;
};

export type PostWithMediaUsage = {
  id: number;
  title: string;
  slug: string;
  post_type: string;
};

/**
 * Get all media records associated with a specific post.
 */
export function getMediaByPost(postId: number) {
  return getDb()
    .prepare(
      `SELECT
        id,
        post_id,
        original_name,
        file_path,
        media_kind,
        mime_type,
        size_bytes,
        alt_text,
        created_at
      FROM post_media
      WHERE post_id = ?
      ORDER BY created_at DESC`
    )
    .all(postId) as MediaRecord[];
}

/**
 * Get all posts that use a specific media file.
 */
export function getPostsByMedia(mediaId: number) {
  return getDb()
    .prepare(
      `SELECT
        p.id,
        p.title,
        p.slug,
        p.post_type
      FROM posts p
      INNER JOIN post_media pm ON p.id = pm.post_id
      WHERE pm.id = ?
      ORDER BY p.updated_at DESC`
    )
    .all(mediaId) as PostWithMediaUsage[];
}

/**
 * Get all media files with their usage count (number of posts using them).
 */
export function getAllMediaWithUsage() {
  return getDb()
    .prepare(
      `SELECT
        pm.id,
        pm.post_id,
        pm.original_name,
        pm.file_path,
        pm.media_kind,
        pm.mime_type,
        pm.size_bytes,
        pm.alt_text,
        pm.created_at,
        COUNT(DISTINCT p.id) as usage_count
      FROM post_media pm
      LEFT JOIN posts p ON pm.file_path IN (
        SELECT SUBSTR(
          pm2.file_path,
          1,
          LENGTH(pm2.file_path)
        ) FROM post_media pm2
      )
      GROUP BY pm.id
      ORDER BY pm.created_at DESC`
    )
    .all() as Array<MediaWithUsage>;
}

/**
 * Alternative simpler version: Get all media with basic usage tracking via post_id association.
 * This only counts direct post_id associations, not URLs embedded in markdown.
 */
export function getAllMediaWithUsageSimple() {
  return getDb()
    .prepare(
      `SELECT
        pm.id,
        pm.post_id,
        pm.original_name,
        pm.file_path,
        pm.media_kind,
        pm.mime_type,
        pm.size_bytes,
        pm.alt_text,
        pm.created_at,
        COUNT(*) OVER (PARTITION BY pm.file_path) as usage_count
      FROM post_media pm
      GROUP BY pm.id
      ORDER BY pm.created_at DESC`
    )
    .all() as Array<MediaWithUsage>;
}

/**
 * Count how many posts reference a specific media file.
 */
export function countMediaUsage(mediaId: number): number {
  const row = getDb()
    .prepare(
      `SELECT COUNT(*) as count
      FROM posts p
      INNER JOIN post_media pm ON p.id = pm.post_id
      WHERE pm.id = ?`
    )
    .get(mediaId) as { count: number };

  return row.count;
}

/**
 * Get all posts with summary statistics (for dashboard overview).
 */
export function getPostsWithStats() {
  return getDb()
    .prepare(
      `SELECT
        id,
        title,
        slug,
        post_type,
        status,
        cover_image,
        updated_at,
        created_at
      FROM posts
      ORDER BY updated_at DESC`
    )
    .all() as PostSummaryWithStats[];
}

/**
 * Get a single media record by ID.
 */
export function getMediaRecord(mediaId: number) {
  return getDb()
    .prepare(
      `SELECT
        id,
        post_id,
        original_name,
        file_path,
        media_kind,
        mime_type,
        size_bytes,
        alt_text,
        created_at
      FROM post_media
      WHERE id = ?`
    )
    .get(mediaId) as MediaRecord | undefined;
}

/**
 * Update alt_text for a media record.
 */
export function updateMediaAltText(mediaId: number, altText: string) {
  return getDb()
    .prepare('UPDATE post_media SET alt_text = ? WHERE id = ?')
    .run(altText, mediaId);
}

/**
 * Delete a media record from the database.
 */
export function deleteMediaRecord(mediaId: number) {
  return getDb()
    .prepare('DELETE FROM post_media WHERE id = ?')
    .run(mediaId);
}
