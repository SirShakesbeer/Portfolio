'use client';

import { useEffect } from 'react';

/**
 * ScrollTrigger setup for the /life tunnel page with 3D card snapping.
 * Syncs scroll height with number of cards for proper scroll distance.
 */
type LifeTunnelAnimationsProps = {
  cardCount?: number;
};

export default function LifeTunnelAnimations({ cardCount = 1 }: LifeTunnelAnimationsProps) {
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    (async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');

      gsap.registerPlugin(ScrollTrigger);

      // Kill existing life page triggers
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.id?.toString().startsWith('portfolio-life-page-')) {
          trigger.kill();
        }
      });

      const ctx = gsap.context(() => {
        const tunnelContent = document.querySelector<HTMLElement>('.life-tunnel-content');
        const tunnelCanvas = document.querySelector<HTMLElement>('#lifeTunnelCanvas');

        if (!tunnelContent || !tunnelCanvas) return;

        // Set container height based on card count to enable scrolling
        const resolvedCardCount = Math.max(cardCount, 1);
        const scrollHeight = resolvedCardCount * window.innerHeight;
        tunnelContent.style.height = `${resolvedCardCount * 100}vh`;

        gsap.set(tunnelCanvas, { opacity: 1 });

        // Pin canvas during scroll
        const navHeight = document.querySelector<HTMLElement>('nav.navbar')?.offsetHeight ?? 0;
        const totalScrollDistance = scrollHeight + navHeight;

        ScrollTrigger.create({
          id: 'portfolio-life-page-canvas-pin',
          trigger: tunnelContent,
          start: 'top top',
          end: () => `+=${totalScrollDistance}`,
          pin: tunnelCanvas,
          pinSpacing: false,
          invalidateOnRefresh: true,
        });
      });

      ScrollTrigger.refresh();
      cleanup = () => ctx.revert();
    })();

    return () => cleanup?.();
  }, [cardCount]);

  return null;
}
