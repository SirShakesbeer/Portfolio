import type { Metadata } from 'next';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import TunnelScene from '@/components/TunnelScene';
import LifeTunnelAnimations from '@/components/LifeTunnelAnimations';
import { getPostsByType } from '@/lib/db';

export const metadata: Metadata = {
  title: 'Life - Paul Thomasius',
  description: 'Stationen aus meinem Lebensweg im Tunnel-Format',
};

type LifePost = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content_html: string;
  created_at: string;
};

export default function LifePage() {
  const posts = getPostsByType('life') as LifePost[];

  return (
    <>
      <Navigation />

      <main className="tunnel row justify-content-md-center" id="life">
        <div className="px-0" id="lifeTunnelCanvas">
          <TunnelScene scrollTriggerSelector=".life-tunnel-content" />
        </div>

        <div className="col life-tunnel-content col-lg-9 col-md-10 col-sm-12">
          <section className="life-tunnel-slide row" id="life-tunnel-title">
            <div className="col-10 col-lg-8">
              <h1 className="display-4 fw-bold">Life</h1>
              <p className="lead">
                Take a journey through the time slide.
              </p>
            </div>
          </section>

          {posts.length === 0 ? (
            <section className="life-tunnel-slide row">
              <div className="col-10 col-lg-8">
                <h2>Noch keine Eintraege</h2>
                <p>
                  Lege in <Link href="/studio">Studio</Link> Posts mit Typ <code>life</code> an.
                </p>
              </div>
            </section>
          ) : (
            posts.map((post, index) => (
              <section className="life-tunnel-slide row" key={post.id}>
                <div className="col-10 col-lg-8">
                  <p className="smallertext mb-1">Station {index + 1}</p>
                  <h2>{post.title}</h2>
                  <p>{post.excerpt}</p>
                  <p>
                    <Link href={`/life/${post.slug}`}>Details</Link>
                  </p>
                </div>
              </section>
            ))
          )}

          <section className="life-tunnel-slide row" id="life-tunnel-end">
            <div className="col-10 col-lg-8">
              <p>
                <Link href="/">Zurueck zur Startseite</Link>
              </p>
            </div>
          </section>
        </div>
      </main>

      <LifeTunnelAnimations />
    </>
  );
}
