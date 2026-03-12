# Portfolio Workspace

This workspace now contains two versions of the portfolio:

- `frontend/`: Original static site (HTML/CSS/JS build).
- `portfolio-next/`: New Next.js + SQLite version (recommended for ongoing work).

## Run The New Site

```bash
cd portfolio-next
npm install
npm run seed
npm run dev
```

Open `http://localhost:3000`.

Main pages:

- `http://localhost:3000/` -> portfolio homepage
- `http://localhost:3000/studio` -> post editor (markdown + upload)
- `http://localhost:3000/projects` -> public project list

Useful commands:

```bash
npm run build
npm start
npm run seed
```

## Database Overview

The Next.js app uses a local SQLite file:

- DB file: `portfolio-next/portfolio.db`
- Core tables: `post_types`, `posts`, `post_media`
- Access layer: `portfolio-next/lib/db.ts`

Main project routes:

- `GET /api/projects` -> JSON list of all projects
- `/projects` -> project listing page
- `/projects/[slug]` -> single project page

Studio routes:

- `POST /api/studio/upload` -> upload one or more files
- `POST /api/studio/posts` -> create post from markdown
- `GET /api/studio/post-types` -> list available post types
- `POST /api/studio/post-types` -> add new post type

## Studio Workflow (Recommended)

Create and publish content directly in the browser.

1. Open `http://localhost:3000/studio`.
2. Fill in title, post type, excerpt, tags, and markdown.
3. Use **Upload + Insert Markdown** to upload media files.
4. Click **Save Post**.
5. Open the generated URL:
- for `project`: `/projects/<slug>`
- for other post types: `/posts/<type>/<slug>`

Uploaded files are stored under:

- `portfolio-next/public/uploads/YYYY/MM/...`

Media upload returns markdown snippets automatically:

- image -> `![alt](/uploads/...)`
- video/audio -> HTML embed tags
- docs -> `[label](/uploads/...)`

## Expand With New Post Types

You can add new types (for example `article`, `case-study`, `devlog`) in Studio.

Data model is already generic:

- `post_types.slug` defines the content type
- `posts.post_type` references the type
- routing supports:
- `/projects/[slug]` for projects
- `/posts/[type]/[slug]` for all other types

This lets you introduce new content formats without schema changes.

## Optional CLI Seeding

For repeatable local setup, update `portfolio-next/scripts/seed.ts` and run:

```bash
cd portfolio-next
npm run seed
```

## Post Fields

- `title`: Display title
- `slug`: URL-safe unique identifier
- `post_type`: `project` or custom type
- `excerpt`: Short card preview text
- `content_markdown`: Source markdown
- `content_html`: Rendered HTML (generated server-side)
- `cover_image`: Path in `/public` (for example `/uploads/2026/03/example.webp`)
- `tags`: JSON array (stored as text in SQLite)
- `status`: `published` or `draft`

## Notes

- Slug must be unique.
- Markdown is stored and converted to HTML on save.
- Upload endpoint currently has no auth yet (add auth before public deployment).
