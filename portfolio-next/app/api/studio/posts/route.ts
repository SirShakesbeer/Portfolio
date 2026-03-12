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

    const title = String(body.title || '').trim();
    const slugInput = String(body.slug || '').trim();
    const postType = String(body.postType || 'project').trim().toLowerCase();
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

    createPost({
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

    return NextResponse.json({ ok: true, slug, postType });
  } catch (error) {
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ error: 'slug already exists' }, { status: 409 });
    }

    console.error('[POST /api/studio/posts]', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
