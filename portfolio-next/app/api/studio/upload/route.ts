import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { addMediaRecord } from '@/lib/db';

const MB = 1024 * 1024;
const MAX_FILE_SIZE = 25 * MB;

function extensionFromName(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  return ext || '';
}

function mediaKindFromMime(mime: string): 'image' | 'video' | 'audio' | 'document' | 'other' {
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  if (mime.includes('pdf') || mime.includes('text') || mime.includes('application/')) return 'document';
  return 'other';
}

function markdownForFile(url: string, mime: string, altText: string): string {
  if (mime.startsWith('image/')) return `![${altText}](${url})`;
  if (mime.startsWith('video/')) return `<video controls src="${url}"></video>`;
  if (mime.startsWith('audio/')) return `<audio controls src="${url}"></audio>`;
  return `[${altText}](${url})`;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files').filter((f): f is File => f instanceof File);

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    const now = new Date();
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1).padStart(2, '0');

    const relativeDir = path.join('uploads', year, month);
    const absoluteDir = path.join(process.cwd(), 'public', relativeDir);
    await mkdir(absoluteDir, { recursive: true });

    const uploaded: Array<{ url: string; markdown: string; mime: string; size: number }> = [];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File too large: ${file.name} (max 25MB)` },
          { status: 400 }
        );
      }

      const ext = extensionFromName(file.name);
      const safeName = `${randomUUID()}${ext}`;
      const absFilePath = path.join(absoluteDir, safeName);
      const relFilePath = `/${relativeDir.replaceAll('\\\\', '/')}/${safeName}`;

      const bytes = Buffer.from(await file.arrayBuffer());
      await writeFile(absFilePath, bytes);

      const altText = path.parse(file.name).name;
      const markdown = markdownForFile(relFilePath, file.type || '', altText);

      addMediaRecord({
        original_name: file.name,
        file_path: relFilePath,
        media_kind: mediaKindFromMime(file.type || ''),
        mime_type: file.type || 'application/octet-stream',
        size_bytes: file.size,
      });

      uploaded.push({
        url: relFilePath,
        markdown,
        mime: file.type || 'application/octet-stream',
        size: file.size,
      });
    }

    return NextResponse.json({ uploaded });
  } catch (error) {
    console.error('[POST /api/studio/upload]', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
