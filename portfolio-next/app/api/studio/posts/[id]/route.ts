import { NextRequest, NextResponse } from 'next/server';
import { deletePostById, getPostById, updatePostById } from '@/lib/db';
import { markdownToHtml, slugify, tagsToJson } from '@/lib/markdown';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const numericId = Number(id);
    if (!Number.isInteger(numericId)) {
      return NextResponse.json({ error: 'Invalid post id' }, { status: 400 });
    }

    const post = getPostById(numericId);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('[GET /api/studio/posts/:id]', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const numericId = Number(id);
    if (!Number.isInteger(numericId)) {
      return NextResponse.json({ error: 'Invalid post id' }, { status: 400 });
    }

    const body = await req.json();
    const postType = String(body.postType || '').trim().toLowerCase();
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

    const result = updatePostById(numericId, {
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

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, slug, postType });
  } catch (error) {
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ error: 'slug already exists' }, { status: 409 });
    }

    console.error('[PATCH /api/studio/posts/:id]', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const numericId = Number(id);
    if (!Number.isInteger(numericId)) {
      return NextResponse.json({ error: 'Invalid post id' }, { status: 400 });
    }

    const result = deletePostById(numericId);
    if (result.changes === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[DELETE /api/studio/posts/:id]', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
