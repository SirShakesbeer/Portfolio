import Link from 'next/link';
import { getPostsByType } from '@/lib/db';
import TunnelScene from './TunnelScene';

type SkillPost = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
};

export default function Faehigkeiten() {
  const skills = getPostsByType('skill') as SkillPost[];

  return (
    <section className="tunnel row justify-content-md-center" id="fähigkeiten">
      <main className="container py-5" style={{ maxWidth: '1000px' }}>
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
                  <div className="card-body">
                    <h5 className="card-title">{skill.title}</h5>
                    <p className="card-text">{skill.excerpt}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </section>
  );
}
