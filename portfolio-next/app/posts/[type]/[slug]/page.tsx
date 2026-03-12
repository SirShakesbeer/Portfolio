import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPostByTypeAndSlug, getPostsByType } from '@/lib/db';

type Post = {
  id: number;
  title: string;
  slug: string;
  post_type: string;
  excerpt: string;
  content_html: string;
  cover_image: string | null;
  tags: string;
  created_at: string;
};

type Props = { params: Promise<{ type: string; slug: string }> };

export async function generateStaticParams() {
  const postTypes = ['note', 'experiment'];
  const params: Array<{ type: string; slug: string }> = [];

  for (const type of postTypes) {
    const posts = getPostsByType(type) as Post[];
    posts.forEach((post) => params.push({ type, slug: post.slug }));
  }

  return params;
}

export default async function GenericPostPage({ params }: Props) {
  const { type, slug } = await params;
  const post = getPostByTypeAndSlug(type, slug) as Post | null;
  if (!post) notFound();

  const tags = JSON.parse(post.tags || '[]') as string[];

  return (
    <main className="container py-5" style={{ maxWidth: 860 }}>
      {post.cover_image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.cover_image}
          alt={post.title}
          className="img-fluid mb-4"
          style={{ borderRadius: 8, maxHeight: 400, width: '100%', objectFit: 'cover' }}
        />
      )}

      <h1>{post.title}</h1>
      <p style={{ opacity: 0.6 }}>{new Date(post.created_at).toLocaleDateString('de-DE')}</p>

      {tags.length > 0 && (
        <div className="mb-4">
          {tags.map((tag) => (
            <span
              key={tag}
              className="badge me-1"
              style={{ background: 'var(--highlight-text-color)', color: '#000' }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="project-body" dangerouslySetInnerHTML={{ __html: post.content_html }} />

      <div className="mt-5">
        <Link href={`/posts/${type}`} className="btn btn-outline-light">Back to {type}</Link>
      </div>
    </main>
  );
}
