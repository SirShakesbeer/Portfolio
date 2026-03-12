import Link from 'next/link';
import type { Metadata } from 'next';
import { getPostsByType } from '@/lib/db';

export const metadata: Metadata = {
  title: 'Life History – Paul Thomasius',
  description: 'Stationen aus meinem Lebenslauf',
};

type LifeHistoryPost = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string | null;
  created_at: string;
};

export default function LifeHistoryPage() {
  const entries = getPostsByType('lifehistory') as LifeHistoryPost[];

  return (
    <main className="container py-5" style={{ maxWidth: '1000px' }}>
      <Link href="/" className="btn btn-outline-light mb-4">← Zurueck zur Startseite</Link>
      <h1>Life History</h1>

      {entries.length === 0 ? (
        <p className="mt-4" style={{ opacity: 0.7 }}>
          Noch keine Life-History-Eintraege vorhanden.
        </p>
      ) : (
        <div className="project-card-grid mt-4">
          {entries.map((entry) => (
            <Link key={entry.id} href={`/lifehistory/${entry.slug}`} className="project-card-link">
              <div className="card h-100">
                {entry.cover_image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={entry.cover_image} className="card-img-top" alt={entry.title} />
                )}
                <div className="card-body">
                  <h5 className="card-title">{entry.title}</h5>
                  <p className="card-text">{entry.excerpt}</p>
                  <small style={{ opacity: 0.6 }}>
                    {new Date(entry.created_at).toLocaleDateString('de-DE')}
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
