import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPostByTypeAndSlug, getPostsByType } from '@/lib/db';

type SkillPost = {
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
  const skills = getPostsByType('skill') as SkillPost[];
  return skills.map((skill) => ({ slug: skill.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const skill = getPostByTypeAndSlug('skill', slug) as SkillPost | null;
  if (!skill) return {};

  return {
    title: `${skill.title} – Skills`,
    description: skill.excerpt,
    openGraph: skill.cover_image ? { images: [{ url: skill.cover_image }] } : undefined,
  };
}

export default async function SkillDetailPage({ params }: Props) {
  const { slug } = await params;
  const skill = getPostByTypeAndSlug('skill', slug) as SkillPost | null;
  if (!skill) notFound();

  const tags = JSON.parse(skill.tags || '[]') as string[];

  return (
    <main className="container py-5" style={{ maxWidth: '860px' }}>
      {skill.cover_image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={skill.cover_image}
          alt={skill.title}
          className="img-fluid mb-4"
          style={{ borderRadius: '8px', maxHeight: '400px', width: '100%', objectFit: 'cover' }}
        />
      )}

      <h1>{skill.title}</h1>
      <p style={{ opacity: 0.6, marginTop: '0.25rem', marginBottom: '0.75rem' }}>
        {new Date(skill.created_at).toLocaleDateString('de-DE')}
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

      <div className="project-body" dangerouslySetInnerHTML={{ __html: skill.content_html }} />

      <div className="mt-5">
        <Link href="/skills" className="btn btn-outline-light">← Alle Skills</Link>
      </div>
    </main>
  );
}
