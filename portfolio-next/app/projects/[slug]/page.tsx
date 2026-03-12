import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProjectBySlug, getProjects } from '@/lib/db';
import type { Metadata } from 'next';

type Project = {
  id: number;
  title: string;
  slug: string;
  description: string;
  body: string;
  cover_image: string | null;
  tags: string;
  created_at: string;
};

type Props = { params: Promise<{ slug: string }> };

// Pre-generate pages for all existing projects at build time.
export async function generateStaticParams() {
  const projects = getProjects() as Project[];
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug) as Project | null;
  if (!project) return {};
  return {
    title: `${project.title} – Paul Thomasius`,
    description: project.description,
    openGraph: project.cover_image
      ? { images: [{ url: project.cover_image }] }
      : undefined,
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = getProjectBySlug(slug) as Project | null;
  if (!project) notFound();

  const tags: string[] = JSON.parse(project.tags);

  return (
    <main className="container py-5" style={{ maxWidth: '860px' }}>
      {project.cover_image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={project.cover_image}
          alt={project.title}
          className="img-fluid mb-4"
          style={{ borderRadius: '8px', maxHeight: '400px', width: '100%', objectFit: 'cover' }}
        />
      )}

      <h1>{project.title}</h1>
      <p style={{ opacity: 0.6, marginTop: '0.25rem', marginBottom: '0.75rem' }}>
        {new Date(project.created_at).toLocaleDateString('de-DE', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </p>

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

      {/* Body is authored HTML stored in the DB – sanitization happens at write time (admin). */}
      <div
        className="project-body"
        dangerouslySetInnerHTML={{ __html: project.body }}
      />

      <div className="mt-5">
        <Link href="/projects" className="btn btn-outline-light">← Alle Projekte</Link>
      </div>
    </main>
  );
}
