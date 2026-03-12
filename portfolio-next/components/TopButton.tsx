'use client';
import { useEffect } from 'react';

export default function TopButton() {
  useEffect(() => {
    const btn = document.getElementById('topButton');
    if (!btn) return;

    const onScroll = () => {
      btn.style.display = document.documentElement.scrollTop > 20 ? 'block' : 'none';
    };
    const onClick = () => { document.documentElement.scrollTop = 0; };

    window.addEventListener('scroll', onScroll);
    btn.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('scroll', onScroll);
      btn.removeEventListener('click', onClick);
    };
  }, []);

  return (
    <button id="topButton" title="Go to top">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img id="topicon" src="/assets/icons/back-to-top-svgrepo-com.svg" alt="Back to Top" />
    </button>
  );
}
