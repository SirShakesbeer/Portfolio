'use client';
import { useEffect } from 'react';

/**
 * Runs all GSAP ScrollTrigger animations after hydration.
 * Replaces the original animations.js / animations.min.js.
 * Renders nothing – purely a side-effect component.
 */
export default function AnimationsInit() {
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    (async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      const { MotionPathPlugin } = await import('gsap/MotionPathPlugin');

      gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

      // Ensure hot reload or route transitions do not stack duplicate triggers.
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.id?.toString().startsWith('portfolio-')) {
          trigger.kill();
        }
      });

      const ctx = gsap.context(() => {
        // ── Tunnel slides scroll stack ─────────────────────────────────────
        const sections = gsap.utils.toArray<HTMLElement>('.tunnel-slide');
        const tunnelContent = document.querySelector<HTMLElement>('.tunnel-content');
        const tunnelCanvas = document.querySelector<HTMLElement>('#tunnelCanvas');
        if (!tunnelContent || !tunnelCanvas || sections.length === 0) return;

        tunnelContent.style.height = `${sections.length * 100}vh`;

        gsap.to(sections, {
          yPercent: -100 * Math.max(sections.length - 1, 0),
          ease: 'none',
          scrollTrigger: {
            id: 'portfolio-tunnel-slides',
            trigger: tunnelContent,
            pin: true,
            scrub: 0,
            invalidateOnRefresh: true,
            snap: {
              snapTo: 1 / Math.max(sections.length - 1, 1),
              duration: { min: 0.2, max: 0.5 },
              ease: 'power1.inOut',
            },
            end: () => `+=${tunnelContent.offsetHeight}`,
          },
        });

        // Keep the WebGL canvas pinned for the same span as the slide stack.
        ScrollTrigger.create({
          id: 'portfolio-tunnel-canvas-pin',
          trigger: tunnelContent,
          start: 'top top',
          end: () => `+=${tunnelContent.offsetHeight}`,
          pin: tunnelCanvas,
          pinSpacing: false,
          invalidateOnRefresh: true,
        });

        // ── Tunnel canvas fade out (on scroll past) ───────────────────────
        gsap.fromTo(
          '#tunnelCanvas',
          { opacity: 1 },
          {
            opacity: 0,
            duration: 5,
            ease: 'power2.inOut',
            scrollTrigger: {
              id: 'portfolio-tunnel-canvas-fade-out',
              trigger: '#tunnel-end',
              start: 'top bottom',
              end: 'top top',
              scrub: 1,
              invalidateOnRefresh: true,
            },
          }
        );

        // ── Tunnel canvas fade in (on scroll into) ────────────────────────
        gsap.fromTo(
          '#tunnelCanvas',
          { opacity: 0 },
          {
            opacity: 1,
            duration: 5,
            scrollTrigger: {
              id: 'portfolio-tunnel-canvas-fade-in',
              trigger: '#tunnel-title',
              start: 'bottom bottom',
              end: 'bottom top',
              scrub: true,
              invalidateOnRefresh: true,
            },
          }
        );

        // ── SVG ball follows path on scroll through #leben ────────────────
        gsap.to('#pathBall', {
          scrollTrigger: {
            id: 'portfolio-lifehistory-pathball',
            trigger: '#leben',
            start: 'top 30%',
            end: () => `+=${Math.max((document.getElementById('leben')?.offsetHeight ?? 0) - 100, 200)}px`,
            scrub: 2,
            invalidateOnRefresh: true,
          },
          motionPath: {
            path: '#path',
            align: '#path',
            alignOrigin: [0.5, 0.5],
          },
          ease: 'none',
        });
      });

      ScrollTrigger.refresh();
      cleanup = () => ctx.revert();
    })();

    return () => {
      cleanup?.();
    };
  }, []);

  return null;
}
