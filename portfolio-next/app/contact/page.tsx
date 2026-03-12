import type { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import { getPostsByType } from '@/lib/db';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Kontakt & Links - Paul Thomasius',
  description: 'Kontaktinformationen und wichtige Links von Paul Thomasius',
};

type ContactPost = {
  id: number;
  title: string;
  meta_json: string;
};

type ContactCard = {
  id: number;
  title: string;
  link: string;
  logo: string;
};

export default function ContactPage() {
  const contactPosts = getPostsByType('contact') as ContactPost[];

  const links: ContactCard[] = contactPosts
    .map((post) => {
      try {
        const meta = JSON.parse(post.meta_json || '{}') as { link?: string; logo?: string };
        const link = String(meta.link || '').trim();
        const logo = String(meta.logo || '').trim();
        if (!link || !logo) return null;
        return {
          id: post.id,
          title: post.title,
          link,
          logo,
        };
      } catch {
        return null;
      }
    })
    .filter((entry): entry is ContactCard => entry !== null);

  return (
    <div>
      <Navigation />
      <main className="container py-5" style={{ maxWidth: '1000px' }}>
        <h1 className="mt-4">Kontakt & Links</h1>
        <p>Kontakt-Links werden im Studio als eigene Posts gepflegt.</p>

        {links.length === 0 ? (
          <p className="mt-4" style={{ opacity: 0.7 }}>
            Noch keine Kontakt-Links vorhanden.
          </p>
        ) : (
          <div className="row g-3 mt-2">
            {links.map((entry) => {
              const isExternal = /^https?:\/\//i.test(entry.link);
              return (
                <div className="col-12 col-md-6" key={entry.id}>
                  <a
                    href={entry.link}
                    className="card h-100 text-decoration-none"
                    target={isExternal ? '_blank' : undefined}
                    rel={isExternal ? 'noreferrer noopener' : undefined}
                  >
                    <div className="card-body d-flex align-items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={entry.logo}
                        alt={entry.title}
                        style={{ width: '2.75rem', height: '2.75rem', objectFit: 'contain' }}
                      />
                      <div>
                        <h5 className="mb-1">{entry.title}</h5>
                        <small style={{ opacity: 0.7 }}>{entry.link}</small>
                      </div>
                    </div>
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
    
  );
}
