/**
 * Backfill script: Associate existing media with posts based on markdown URLs
 * 
 * This script parses all post markdown content to find URLs matching
 * the uploaded media pattern (/uploads/YYYY/MM/filename), then links
 * those media records to their respective posts.
 * 
 * Run with: npx tsx scripts/backfill-media-associations.ts
 */

import Database from 'better-sqlite3';
import path from 'path';

type PostRecord = {
  id: number;
  content_markdown: string;
};

type MediaRecord = {
  id: number;
  file_path: string | null;
  post_id: number | null;
};

// Regex to match uploaded media URLs: /uploads/YYYY/MM/filename
const UPLOAD_URL_PATTERN = /\/uploads\/\d{4}\/\d{2}\/[^)\s"'`<>]+/g;

function getDb(): Database.Database {
  const dbPath = path.join(process.cwd(), 'portfolio.db');
  return new Database(dbPath);
}

async function backfillMediaAssociations(): Promise<void> {
  console.log('Starting media-post association backfill...\n');

  const db = getDb();
  let associatedCount = 0;
  let parsedCount = 0;

  try {
    // Fetch all posts with markdown content
    const posts = db
      .prepare("SELECT id, content_markdown FROM posts WHERE content_markdown != '' ORDER BY id ASC")
      .all() as PostRecord[];

    console.log(`Found ${posts.length} posts to scan.\n`);

    for (const post of posts) {
      parsedCount++;
      const urls = post.content_markdown.match(UPLOAD_URL_PATTERN);

      if (!urls || urls.length === 0) {
        continue;
      }

      console.log(`Post #${post.id}: Found ${urls.length} media URL(s)`);

      for (const url of urls) {
        // Normalize URL to match file_path format (ensure leading slash)
        const normalizedUrl = url.startsWith('/') ? url : `/${url}`;

        // Find media record by file_path
        const media = db
          .prepare('SELECT id, file_path, post_id FROM post_media WHERE file_path = ?')
          .get(normalizedUrl) as MediaRecord | undefined;

        if (media) {
          if (media.post_id === null) {
            // Update media record to associate with post
            db.prepare('UPDATE post_media SET post_id = ? WHERE id = ?').run(post.id, media.id);
            console.log(`  ✓ Linked media #${media.id} (${media.file_path}) → Post #${post.id}`);
            associatedCount++;
          } else if (media.post_id === post.id) {
            // Already associated with this post
            console.log(`  ℹ Media #${media.id} already linked to this post`);
          } else {
            // Already associated with a different post (media is reused)
            console.log(
              `  ℹ Media #${media.id} already linked to Post #${media.post_id} (reused in Post #${post.id})`
            );
          }
        } else {
          console.log(`  ✗ No media record found for: ${normalizedUrl}`);
        }
      }

      console.log('');
    }

    console.log(`\n✅ Backfill complete!`);
    console.log(`   Scanned: ${parsedCount} posts`);
    console.log(`   Associated: ${associatedCount} media records`);
  } catch (error) {
    console.error('❌ Backfill failed:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

// Run the backfill
backfillMediaAssociations().catch((error) => {
  console.error('Script error:', error);
  process.exit(1);
});
