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
    CREATE TABLE IF NOT EXISTS projects (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT    NOT NULL,
      slug        TEXT    NOT NULL UNIQUE,
      description TEXT    NOT NULL,
      body        TEXT    NOT NULL DEFAULT '',
      cover_image TEXT,
      tags        TEXT    NOT NULL DEFAULT '[]',
      created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TRIGGER IF NOT EXISTS projects_updated_at
    AFTER UPDATE ON projects
    BEGIN
      UPDATE projects SET updated_at = datetime('now') WHERE id = NEW.id;
    END;
  `);
}

// ── Query helpers ─────────────────────────────────────────────────────────────

export function getProjects() {
  return getDb()
    .prepare('SELECT * FROM projects ORDER BY created_at DESC')
    .all();
}

export function getProjectBySlug(slug: string) {
  return (
    getDb().prepare('SELECT * FROM projects WHERE slug = ?').get(slug) ?? null
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
  return getDb()
    .prepare(
      `INSERT INTO projects (title, slug, description, body, cover_image, tags)
       VALUES (@title, @slug, @description, @body, @cover_image, @tags)`
    )
    .run({ cover_image: null, tags: '[]', ...data });
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
  const sets = Object.keys(data)
    .map((k) => `${k} = @${k}`)
    .join(', ');
  return getDb()
    .prepare(`UPDATE projects SET ${sets} WHERE id = @id`)
    .run({ id, ...data });
}

export function deleteProject(id: number) {
  return getDb().prepare('DELETE FROM projects WHERE id = ?').run(id);
}
