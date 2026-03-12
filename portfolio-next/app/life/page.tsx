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
  
  // Create card data for 3D tunnel
  const cards = posts.map((post, index) => ({
    id: post.id,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content_html,
  }));

  // Add start card
  cards.unshift({
    id: 0,
    title: 'Life',
    excerpt: 'Take a journey through the time slide.',
    content: 'Take a journey through the time slide.',
  });

  // Add end card
  cards.push({
    id: -1,
    title: 'What\'s next?',
    excerpt: 'Back to Home',
    content: 'Back to Home',
  });

  const cardCount = cards.length;

  return (
    <>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
        <Navigation />
      </div>

      <main className="tunnel row justify-content-md-center" id="life">
        <div className="px-0" id="lifeTunnelCanvas">
          <TunnelScene 
            scrollTriggerSelector="#life" 
            scrollDistanceSlides={cardCount}
            cards={cards}
          />
        </div>

        <div className="col life-tunnel-content col-lg-9 col-md-10 col-sm-12">
          {/* Hidden content container - kept for scroll distance */}
        </div>
      </main>

      <LifeTunnelAnimations cardCount={cardCount} />
    </>
  );
}
