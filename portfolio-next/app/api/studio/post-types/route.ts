import { NextRequest, NextResponse } from 'next/server';
import { ensurePostType, getPostTypes } from '@/lib/db';

export async function GET() {
  try {
    return NextResponse.json(getPostTypes());
  } catch (error) {
    console.error('[GET /api/studio/post-types]', error);
    return NextResponse.json({ error: 'Failed to fetch post types' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const slug = String(body.slug || '').trim().toLowerCase();
    const label = String(body.label || '').trim();

    if (!slug || !label) {
      return NextResponse.json({ error: 'slug and label are required' }, { status: 400 });
    }

    ensurePostType(slug, label);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[POST /api/studio/post-types]', error);
    return NextResponse.json({ error: 'Failed to create post type' }, { status: 500 });
  }
}
