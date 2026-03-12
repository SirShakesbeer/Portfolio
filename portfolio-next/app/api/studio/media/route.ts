import { NextRequest, NextResponse } from 'next/server';
import { getMediaByPost, getAllMediaWithUsageSimple } from '@/lib/db';

const ITEMS_PER_PAGE = 50;

export async function GET(req: NextRequest) {
  try {
    const postId = req.nextUrl.searchParams.get('postId');
    const page = req.nextUrl.searchParams.get('page');
    const parsedPage = page ? Math.max(1, parseInt(page, 10)) : 1;

    if (postId) {
      // Get media for a specific post
      const parsedPostId = parseInt(postId, 10);
      if (isNaN(parsedPostId)) {
        return NextResponse.json({ error: 'Invalid postId' }, { status: 400 });
      }

      const media = getMediaByPost(parsedPostId);
      return NextResponse.json({ media });
    }

    // Get all media with usage counts (paginated)
    const allMedia = getAllMediaWithUsageSimple();
    const totalItems = allMedia.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const offset = (parsedPage - 1) * ITEMS_PER_PAGE;
    const media = allMedia.slice(offset, offset + ITEMS_PER_PAGE);

    return NextResponse.json({
      media,
      pagination: {
        page: parsedPage,
        perPage: ITEMS_PER_PAGE,
        total: totalItems,
        totalPages,
      },
    });
  } catch (error) {
    console.error('[GET /api/studio/media]', error);
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Future: endpoint for creating/associating media
    // For now, media is created only via the upload endpoint
    return NextResponse.json(
      { error: 'Use POST /api/studio/upload to upload media' },
      { status: 405 }
    );
  } catch (error) {
    console.error('[POST /api/studio/media]', error);
    return NextResponse.json({ error: 'Request failed' }, { status: 500 });
  }
}
