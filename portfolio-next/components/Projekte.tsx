import Link from 'next/link';
import { getProjects } from '@/lib/db';

type Project = {
  id: number;
  title: string;
  slug: string;
  description: string;
  cover_image: string | null;
  tags: string;
  created_at: string;
};

// Server component – directly queries SQLite, no API round-trip needed.
export default async function Projekte() {
  const dbProjects = getProjects() as Project[];

  return (
    <section className="content-item row justify-content-md-center" id="projekte">
      <section className="col col-lg-9 col-md-10 col-sm-12">
        <h1>Projekte</h1>

        {/* ── Dynamic projects from the database ── */}
        {dbProjects.length > 0 && (
          <>
            <h2 className="mt-4">Neue Projekte</h2>
            <div className="project-card-grid">
              {dbProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.slug}`}
                  className="project-card-link"
                >
                  <div className="card h-100">
                    {project.cover_image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={project.cover_image}
                        className="card-img-top"
                        alt={project.title}
                      />
                    )}
                    <div className="card-body">
                      <h5 className="card-title">{project.title}</h5>
                      <p className="card-text">{project.description}</p>
                      <small style={{ opacity: 0.7 }}>
                        {new Date(project.created_at).toLocaleDateString('de-DE')}
                      </small>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>
    </section>
  );
}
