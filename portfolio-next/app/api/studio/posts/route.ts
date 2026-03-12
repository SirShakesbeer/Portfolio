import { NextRequest, NextResponse } from 'next/server';
import { createPost, getStudioPosts } from '@/lib/db';
import { markdownToHtml, slugify, tagsToJson } from '@/lib/markdown';

export async function GET(req: NextRequest) {
  try {
    const type = req.nextUrl.searchParams.get('type')?.trim() || undefined;
    const statusParam = req.nextUrl.searchParams.get('status');
    const status =
      statusParam === 'published' || statusParam === 'draft' || statusParam === 'all'
        ? statusParam
        : 'all';

    const posts = getStudioPosts(type, status);
    return NextResponse.json(posts);
  } catch (error) {
    console.error('[GET /api/studio/posts]', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const postType = String(body.postType || 'project').trim().toLowerCase();
    const contactMode = postType === 'contact';
    const impressumMode = postType === 'impressum';

    const title = impressumMode ? 'Impressum' : String(body.title || '').trim();
    const slugInput = impressumMode ? 'impressum' : String(body.slug || '').trim();
    const rawSortOrder = body.sortOrder;
    const sortOrder =
      postType === 'life' && rawSortOrder !== undefined && rawSortOrder !== null && String(rawSortOrder).trim() !== ''
        ? Number(rawSortOrder)
        : null;
    const excerpt = contactMode || impressumMode ? '' : String(body.excerpt || '').trim();
    const markdown = contactMode ? '' : String(body.markdown || '');
    const typeWithoutMediaMeta = new Set(['life', 'about', 'reference', 'skill', 'impressum', 'contact']);
    const coverImage = typeWithoutMediaMeta.has(postType) ? null : body.coverImage ? String(body.coverImage) : null;
    const status = contactMode || impressumMode ? 'published' : body.status === 'draft' ? 'draft' : 'published';
    const tagsJson = typeWithoutMediaMeta.has(postType) ? '[]' : tagsToJson(String(body.tags || ''));
    const contactLink = contactMode ? String(body.contactLink || '').trim() : '';
    const contactLogo = contactMode ? String(body.contactLogo || '').trim() : '';

    const metaJson = contactMode
      ? JSON.stringify({ link: contactLink, logo: contactLogo })
      : '{}';

    if (!title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }

    if (contactMode && (!contactLink || !contactLogo)) {
      return NextResponse.json({ error: 'contact posts require contactLink and contactLogo' }, { status: 400 });
    }

    const slug = slugify(slugInput || title);
    if (!slug) {
      return NextResponse.json({ error: 'invalid slug' }, { status: 400 });
    }

    if (sortOrder !== null && !Number.isFinite(sortOrder)) {
      return NextResponse.json({ error: 'sortOrder must be a valid number' }, { status: 400 });
    }

    const contentHtml = markdownToHtml(markdown);

    createPost({
      title,
      slug,
      post_type: postType,
      sort_order: sortOrder,
      excerpt,
      content_markdown: markdown,
      content_html: contentHtml,
      cover_image: coverImage,
      tags: tagsJson,
      meta_json: metaJson,
      status,
    });

    return NextResponse.json({ ok: true, slug, postType });
  } catch (error) {
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ error: 'slug already exists' }, { status: 409 });
    }

    console.error('[POST /api/studio/posts]', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
