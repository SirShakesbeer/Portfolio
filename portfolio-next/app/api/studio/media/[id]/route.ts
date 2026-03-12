import { NextRequest, NextResponse } from 'next/server';
import { getPostsByMedia, getMediaRecord, updateMediaAltText, deleteMediaRecord } from '@/lib/db';
import * as fs from 'fs/promises';
import path from 'path';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const mediaId = parseInt(id, 10);

    if (isNaN(mediaId)) {
      return NextResponse.json({ error: 'Invalid media ID' }, { status: 400 });
    }

    const media = getMediaRecord(mediaId);

    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    // Get all posts using this media
    const posts = getPostsByMedia(mediaId);

    return NextResponse.json({
      media,
      usedBy: posts,
    });
  } catch (error) {
    console.error('[GET /api/studio/media/[id]]', error);
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const mediaId = parseInt(id, 10);

    if (isNaN(mediaId)) {
      return NextResponse.json({ error: 'Invalid media ID' }, { status: 400 });
    }

    const body = await req.json();
    const { alt_text } = body;

    if (typeof alt_text !== 'string') {
      return NextResponse.json(
        { error: 'alt_text must be a string' },
        { status: 400 }
      );
    }

    const result = updateMediaAltText(mediaId, alt_text);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[PATCH /api/studio/media/[id]]', error);
    return NextResponse.json({ error: 'Failed to update media' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const mediaId = parseInt(id, 10);

    if (isNaN(mediaId)) {
      return NextResponse.json({ error: 'Invalid media ID' }, { status: 400 });
    }

    const media = getMediaRecord(mediaId);

    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    // Delete database record
    deleteMediaRecord(mediaId);

    // Delete physical file if it exists
    try {
      const filePath = path.join(process.cwd(), 'public', media.file_path);
      await fs.unlink(filePath);
      console.log(`Deleted file: ${filePath}`);
    } catch (fileError) {
      // File may not exist or already deleted; log but don't fail
      console.warn(`Could not delete file ${media.file_path}:`, fileError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/studio/media/[id]]', error);
    return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 });
  }
}
