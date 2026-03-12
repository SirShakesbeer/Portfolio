import Link from 'next/link';
import { getProjects } from '@/lib/db';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Projekte – Paul Thomasius',
  description: 'Alle Projekte von Paul Thomasius',
};

type Project = {
  id: number;
  title: string;
  slug: string;
  description: string;
  cover_image: string | null;
  tags: string;
  created_at: string;
};

export default function ProjectsPage() {
  const projects = getProjects() as Project[];

  return (
    <main className="container py-5" style={{ maxWidth: '1000px' }}>
      <Link href="/" className="btn btn-outline-light mb-4">← Zurück zur Startseite</Link>
      <h1>Alle Projekte</h1>

      {projects.length === 0 ? (
        <p className="mt-4" style={{ opacity: 0.7 }}>Noch keine Projekte vorhanden.</p>
      ) : (
        <div className="project-card-grid">
          {projects.map((p) => (
            <Link key={p.id} href={`/projects/${p.slug}`} className="project-card-link">
              <div className="card h-100">
                {p.cover_image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.cover_image} className="card-img-top" alt={p.title} />
                )}
                <div className="card-body">
                  <h5 className="card-title">{p.title}</h5>
                  <p className="card-text">{p.description}</p>
                  <small style={{ opacity: 0.6 }}>
                    {new Date(p.created_at).toLocaleDateString('de-DE')}
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
