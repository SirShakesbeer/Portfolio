'use client';

import { useEffect } from 'react';

/**
 * ScrollTrigger setup for the /life tunnel page.
 * Uses dedicated selectors so it does not interfere with the homepage tunnel.
 */
export default function LifeTunnelAnimations() {
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    (async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');

      gsap.registerPlugin(ScrollTrigger);

      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.id?.toString().startsWith('portfolio-life-page-')) {
          trigger.kill();
        }
      });

      const ctx = gsap.context(() => {
        const sections = gsap.utils.toArray<HTMLElement>('.life-tunnel-slide');
        const tunnelContent = document.querySelector<HTMLElement>('.life-tunnel-content');
        const tunnelCanvas = document.querySelector<HTMLElement>('#lifeTunnelCanvas');

        if (!tunnelContent || !tunnelCanvas || sections.length === 0) return;

        tunnelContent.style.height = `${sections.length * 100}vh`;

        gsap.to(sections, {
          yPercent: -100 * Math.max(sections.length - 1, 0),
          ease: 'none',
          scrollTrigger: {
            id: 'portfolio-life-page-slides',
            trigger: tunnelContent,
            pin: true,
            scrub: 0.2,
            invalidateOnRefresh: true,
            snap: {
              snapTo: 1 / Math.max(sections.length - 1, 1),
              duration: { min: 0.2, max: 0.45 },
              ease: 'power1.inOut',
            },
            end: () => `+=${tunnelContent.offsetHeight}`,
          },
        });

        ScrollTrigger.create({
          id: 'portfolio-life-page-canvas-pin',
          trigger: tunnelContent,
          start: 'top top',
          end: () => `+=${tunnelContent.offsetHeight}`,
          pin: tunnelCanvas,
          pinSpacing: false,
          invalidateOnRefresh: true,
        });

        gsap.fromTo(
          '#lifeTunnelCanvas',
          { opacity: 0.95 },
          {
            opacity: 0,
            scrollTrigger: {
              id: 'portfolio-life-page-canvas-fade',
              trigger: '#life-tunnel-end',
              start: 'top bottom',
              end: 'top top',
              scrub: 0.8,
              invalidateOnRefresh: true,
            },
          }
        );
      });

      ScrollTrigger.refresh();
      cleanup = () => ctx.revert();
    })();

    return () => cleanup?.();
  }, []);

  return null;
}
