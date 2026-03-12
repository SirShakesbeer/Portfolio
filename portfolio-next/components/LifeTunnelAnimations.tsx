'use client';

import { useEffect } from 'react';

/**
 * ScrollTrigger setup for the /life tunnel page.
 * Uses dedicated selectors so it does not interfere with the homepage tunnel.
 */
type LifeTunnelAnimationsProps = {
  totalSlides?: number;
};

export default function LifeTunnelAnimations({ totalSlides }: LifeTunnelAnimationsProps) {
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

        const resolvedSlides = Math.max(totalSlides ?? sections.length, 1);
        const scrollSteps = Math.max(resolvedSlides - 1, 1);
        const getScrollDistance = () => {
          const navHeight = document.querySelector<HTMLElement>('nav.navbar')?.offsetHeight ?? 0;
          const baseDistance = resolvedSlides * window.innerHeight;
          return baseDistance + navHeight;
        };

        tunnelContent.style.height = `${resolvedSlides * 100}vh`;

        gsap.set(tunnelCanvas, { opacity: 1 });

        gsap.to(sections, {
          yPercent: -100 * Math.max(resolvedSlides - 1, 0),
          ease: 'none',
          scrollTrigger: {
            id: 'portfolio-life-page-slides',
            trigger: tunnelContent,
            start: 'top top',
            pin: true,
            scrub: 0.2,
            invalidateOnRefresh: true,
            snap: {
              snapTo: 1 / scrollSteps,
              duration: { min: 0.2, max: 0.45 },
              ease: 'power1.inOut',
            },
            end: () => `+=${getScrollDistance()}`,
          },
        });

        ScrollTrigger.create({
          id: 'portfolio-life-page-canvas-pin',
          trigger: tunnelContent,
          start: 'top top',
          end: () => `+=${getScrollDistance()}`,
          pin: tunnelCanvas,
          pinSpacing: false,
          invalidateOnRefresh: true,
        });
      });

      ScrollTrigger.refresh();
      cleanup = () => ctx.revert();
    })();

    return () => cleanup?.();
  }, [totalSlides]);

  return null;
}
