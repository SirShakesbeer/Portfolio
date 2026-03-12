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
    const title = String(body.title || '').trim();
    const slugInput = String(body.slug || '').trim();
    const postType = String(body.postType || '').trim().toLowerCase();
    const excerpt = String(body.excerpt || '').trim();
    const markdown = String(body.markdown || '');
    const coverImage = body.coverImage ? String(body.coverImage) : null;
    const status = body.status === 'draft' ? 'draft' : 'published';
    const tagsJson = tagsToJson(String(body.tags || ''));

    if (!title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }

    const slug = slugify(slugInput || title);
    if (!slug) {
      return NextResponse.json({ error: 'invalid slug' }, { status: 400 });
    }

    const contentHtml = markdownToHtml(markdown);

    const result = updatePostById(numericId, {
      title,
      slug,
      post_type: postType,
      excerpt,
      content_markdown: markdown,
      content_html: contentHtml,
      cover_image: coverImage,
      tags: tagsJson,
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
