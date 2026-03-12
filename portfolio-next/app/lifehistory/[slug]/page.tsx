import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPostByTypeAndSlug, getPostsByType } from '@/lib/db';

type LifeHistoryPost = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content_html: string;
  cover_image: string | null;
  tags: string;
  created_at: string;
};

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const entries = getPostsByType('lifehistory') as LifeHistoryPost[];
  return entries.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = getPostByTypeAndSlug('lifehistory', slug) as LifeHistoryPost | null;
  if (!entry) return {};

  return {
    title: `${entry.title} – Life History`,
    description: entry.excerpt,
    openGraph: entry.cover_image ? { images: [{ url: entry.cover_image }] } : undefined,
  };
}

export default async function LifeHistoryDetailPage({ params }: Props) {
  const { slug } = await params;
  const entry = getPostByTypeAndSlug('lifehistory', slug) as LifeHistoryPost | null;
  if (!entry) notFound();

  const tags = JSON.parse(entry.tags || '[]') as string[];

  return (
    <main className="container py-5" style={{ maxWidth: '860px' }}>
      {entry.cover_image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={entry.cover_image}
          alt={entry.title}
          className="img-fluid mb-4"
          style={{ borderRadius: '8px', maxHeight: '400px', width: '100%', objectFit: 'cover' }}
        />
      )}

      <h1>{entry.title}</h1>
      <p style={{ opacity: 0.6, marginTop: '0.25rem', marginBottom: '0.75rem' }}>
        {new Date(entry.created_at).toLocaleDateString('de-DE')}
      </p>

      {tags.length > 0 && (
        <div className="mb-4">
          {tags.map((tag) => (
            <span key={tag} className="badge me-1" style={{ background: 'var(--highlight-text-color)', color: '#000' }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="project-body" dangerouslySetInnerHTML={{ __html: entry.content_html }} />

      <div className="mt-5">
        <Link href="/lifehistory" className="btn btn-outline-light">← Alle Stationen</Link>
      </div>
    </main>
  );
}
