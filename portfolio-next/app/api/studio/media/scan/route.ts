import { NextRequest, NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import path from 'path';
import { addMediaRecord, getAllMediaWithUsageSimple } from '@/lib/db';

// Directories inside /public to scan, relative to the public folder
const SCAN_DIRS = [
  'assets/img',
  'assets/icons',
  'background',
  'docs',
  'vid',
  'uploads',
];

// Extensions mapped to media_kind
function mediaKindFromExt(ext: string): 'image' | 'video' | 'audio' | 'document' | 'other' {
  const lower = ext.toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.avif', '.bmp'].includes(lower))
    return 'image';
  if (['.mp4', '.webm', '.mov', '.avi', '.mkv'].includes(lower)) return 'video';
  if (['.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a'].includes(lower)) return 'audio';
  if (['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.csv'].includes(lower))
    return 'document';
  return 'other';
}

function mimeFromExt(ext: string): string {
  const lower = ext.toLowerCase();
  const map: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.avif': 'image/avif',
    '.bmp': 'image/bmp',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mov': 'video/quicktime',
    '.avi': 'video/x-msvideo',
    '.mkv': 'video/x-matroska',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.flac': 'audio/flac',
    '.aac': 'audio/aac',
    '.m4a': 'audio/mp4',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx':
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx':
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx':
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.txt': 'text/plain',
    '.csv': 'text/csv',
  };
  return map[lower] ?? 'application/octet-stream';
}

async function walkDir(dir: string): Promise<string[]> {
  const result: string[] = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const sub = await walkDir(full);
        result.push(...sub);
      } else if (entry.isFile()) {
        result.push(full);
      }
    }
  } catch {
    // Directory doesn't exist — skip silently
  }
  return result;
}

export async function POST(req: NextRequest) {
  try {
    const publicDir = path.join(process.cwd(), 'public');

    // Get all currently registered file_paths to skip duplicates
    const existingMedia = getAllMediaWithUsageSimple();
    const registeredPaths = new Set(existingMedia.map((m) => m.file_path));

    const added: string[] = [];
    const skipped: string[] = [];

    for (const scanDir of SCAN_DIRS) {
      const absDir = path.join(publicDir, scanDir);
      const files = await walkDir(absDir);

      for (const absFilePath of files) {
        // Compute the web-accessible path relative to /public
        const relPath = '/' + path.relative(publicDir, absFilePath).replaceAll('\\', '/');

        if (registeredPaths.has(relPath)) {
          skipped.push(relPath);
          continue;
        }

        // Skip very small helper files like SVGs that aren't media
        const ext = path.extname(absFilePath).toLowerCase();
        const kind = mediaKindFromExt(ext);

        try {
          const fileStat = await stat(absFilePath);
          const originalName = path.basename(absFilePath);

          addMediaRecord({
            post_id: null,
            original_name: originalName,
            file_path: relPath,
            media_kind: kind,
            mime_type: mimeFromExt(ext),
            size_bytes: fileStat.size,
            alt_text: path.parse(originalName).name,
          });

          added.push(relPath);
          registeredPaths.add(relPath);
        } catch (err) {
          console.warn(`Could not stat ${absFilePath}:`, err);
        }
      }
    }

    return NextResponse.json({ added, skipped });
  } catch (error) {
    console.error('[POST /api/studio/media/scan]', error);
    return NextResponse.json({ error: 'Scan failed' }, { status: 500 });
  }
}
