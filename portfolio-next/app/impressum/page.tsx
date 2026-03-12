import type { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import { getPostsByType } from '@/lib/db';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Impressum - Paul Thomasius',
  description: 'Impressum der Portfolio-Website von Paul Thomasius',
};

type ImpressumPost = {
  id: number;
  content_html: string;
  content_markdown: string;
};

export default function ImpressumPage() {
  const impressumPosts = getPostsByType('impressum') as ImpressumPost[];
  const current = impressumPosts[0];

  return (
    <div>
      <Navigation />
      <main className="container py-5" style={{ maxWidth: '1000px' }}>
        <h1 className="mt-4">Impressum</h1>

        {current ? (
          <section className="mt-4" dangerouslySetInnerHTML={{ __html: current.content_html }} />
        ) : (
          <p className="mt-4" style={{ opacity: 0.7 }}>
            Noch kein Impressum-Post vorhanden. Erstelle im Studio einen Post vom Typ <code>impressum</code>.
          </p>
        )}
      </main>
      <Footer />
    </div>
    
  );
}
