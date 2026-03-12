import Link from 'next/link';
import { getPostsByType } from '@/lib/db';

type Post = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string | null;
  created_at: string;
};

type Props = { params: Promise<{ type: string }> };

export default async function PostTypeListPage({ params }: Props) {
  const { type } = await params;
  const posts = getPostsByType(type) as Post[];

  return (
    <main className="container py-5" style={{ maxWidth: 1000 }}>
      <Link href="/" className="btn btn-outline-light mb-4">Back to home</Link>
      <h1>{type} posts</h1>

      {posts.length === 0 ? (
        <p className="mt-4" style={{ opacity: 0.7 }}>No published posts yet.</p>
      ) : (
        <div className="project-card-grid mt-4">
          {posts.map((post) => (
            <Link key={post.id} href={`/posts/${type}/${post.slug}`} className="project-card-link">
              <div className="card h-100">
                {post.cover_image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.cover_image} className="card-img-top" alt={post.title} />
                )}
                <div className="card-body">
                  <h5 className="card-title">{post.title}</h5>
                  <p className="card-text">{post.excerpt}</p>
                  <small style={{ opacity: 0.7 }}>
                    {new Date(post.created_at).toLocaleDateString('de-DE')}
                  </small>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
