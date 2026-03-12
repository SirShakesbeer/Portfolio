import Link from 'next/link';
import type { Metadata } from 'next';
import { getPostsByType } from '@/lib/db';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'Skills – Paul Thomasius',
  description: 'Komplette Skill-Uebersicht',
};

type SkillPost = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string | null;
  created_at: string;
};

export default function SkillsPage() {
  const skills = getPostsByType('skill') as SkillPost[];

  return (
    <main className="container py-5" style={{ maxWidth: '1000px' }}>
      <Navigation />
      <h1>Skills</h1>

      {skills.length === 0 ? (
        <p className="mt-4" style={{ opacity: 0.7 }}>
          Noch keine Skill-Posts vorhanden.
        </p>
      ) : (
        <div className="project-card-grid mt-4">
          {skills.map((skill) => (
            <Link key={skill.id} href={`/skills/${skill.slug}`} className="project-card-link">
              <div className="card h-100">
                {skill.cover_image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={skill.cover_image} className="card-img-top" alt={skill.title} />
                )}
                <div className="card-body">
                  <h5 className="card-title">{skill.title}</h5>
                  <p className="card-text">{skill.excerpt}</p>
                  <small style={{ opacity: 0.6 }}>
                    {new Date(skill.created_at).toLocaleDateString('de-DE')}
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
