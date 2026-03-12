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
  const totalSlides = posts.length + 3;

  return (
    <>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
        <Navigation />
      </div>

      <main className="tunnel row justify-content-md-center" id="life">
        <div className="px-0" id="lifeTunnelCanvas">
          <TunnelScene scrollTriggerSelector="#life" scrollDistanceSlides={totalSlides} />
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
                <h2>Error 404</h2>
                <p>
                  Could not find any posts with type <code>life</code>.
                </p>
              </div>
            </section>
          ) : (
            posts.map((post, index) => (
              <section className="life-tunnel-slide row" key={post.id}>
                <div className="col-10 col-lg-8">
                  <p className="smallertext mb-1">Station {index + 1}</p>
                  <h2>{post.title}</h2>
                  <div className="project-body" dangerouslySetInnerHTML={{ __html: post.content_html }} />
                </div>
              </section>
            ))
          )}

          <section className="life-tunnel-slide row" id="life-tunnel-end">
            <div className="col-10 col-lg-8">
              <p>
                <Link href="/">Back to Home</Link>
              </p>
            </div>
          </section>
        </div>
      </main>

      <LifeTunnelAnimations totalSlides={totalSlides} />
    </>
  );
}
