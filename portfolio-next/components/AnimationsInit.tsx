'use client';
import { useEffect } from 'react';

/**
 * Runs all GSAP ScrollTrigger animations after hydration.
 * Replaces the original animations.js / animations.min.js.
 * Renders nothing – purely a side-effect component.
 */
export default function AnimationsInit() {
  useEffect(() => {
    (async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      const { MotionPathPlugin } = await import('gsap/MotionPathPlugin');

      gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

      // ── Tunnel slides scroll stack ───────────────────────────────────────
      const sections = gsap.utils.toArray<HTMLElement>('.tunnel-slide');
      const tunnelContent = document.querySelector<HTMLElement>('.tunnel-content');
      if (!tunnelContent) return;

      tunnelContent.style.height = `${sections.length * 100}vh`;

      gsap.to(sections, {
        yPercent: -100 * sections.length,
        ease: 'none',
        scrollTrigger: {
          trigger: '.tunnel-content',
          pin: true,
          scrub: 0,
          snap: {
            snapTo: 1 / sections.length,
            duration: { min: 0.2, max: 0.5 },
            ease: 'power1.inOut',
          },
          end: () => '+=' + tunnelContent.offsetHeight,
        },
      });

      // ── Tunnel canvas fade out (on scroll past) ──────────────────────────
      gsap.fromTo(
        '#tunnelCanvas',
        { opacity: 1 },
        {
          opacity: 0,
          duration: 5,
          ease: 'power2.inOut',
          scrollTrigger: {
            trigger: '#tunnel-end',
            start: 'top bottom',
            end: 'top top',
            scrub: 1,
          },
        }
      );

      // ── Tunnel canvas fade in (on scroll into) ───────────────────────────
      gsap.fromTo(
        '#tunnelCanvas',
        { opacity: 0 },
        {
          opacity: 1,
          duration: 5,
          scrollTrigger: {
            trigger: '#tunnel-title',
            start: 'bottom bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );

      // ── SVG ball follows path on scroll through #leben ───────────────────
      gsap.to('#pathBall', {
        scrollTrigger: {
          trigger: '#leben',
          start: 'top 30%',
          end: () => `+=${(document.getElementById('leben')?.offsetHeight ?? 0) - 100}px`,
          scrub: 2,
        },
        motionPath: {
          path: '#path',
          align: '#path',
          alignOrigin: [0.5, 0.5],
        },
        ease: 'none',
      });
    })();
  }, []);

  return null;
}
