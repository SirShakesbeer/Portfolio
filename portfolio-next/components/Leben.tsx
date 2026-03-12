import Link from 'next/link';
import { getPostsByType } from '@/lib/db';

type LifeHistoryPost = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string | null;
  created_at: string;
};

// Server component – SVG markup remains for existing GSAP motion path animations.
export default function Leben() {
  const posts = getPostsByType('life') as LifeHistoryPost[];

  return (
    <section className="content-item row justify-content-md-center" id="leben">
      {/* Invisible path that GSAP uses to animate the ball */}
      <svg width="100%" height="100%" viewBox="0 0 800 2000" preserveAspectRatio="none" id="pathSVG">
        <path
          id="path"
          d="M 0 50 Q 150 125 250 625 Q 275 750 300 1125 Q 350 1375 400 1125 C 400 875 250 1000 300 1375 C 350 1625 400 1750 250 2000 C 150 2250 350 2250 300 2500 C 250 2750 100 2750 400 3125 C 550 3375 550 3750 800 3750"
        />
      </svg>

      {/* Ball that follows the path */}
      <svg width="100%" height="100%" viewBox="0 0 800 1400" id="ballSVG">
        <defs>
          <linearGradient
            gradientTransform="rotate(156, 0.5, 0.5)"
            x1="50%" y1="0%" x2="50%" y2="100%"
            id="ffflux-gradient"
          >
            <stop stopColor="#0b4f6c" stopOpacity="1" offset="0%" />
            <stop stopColor="#88ce02" stopOpacity="1" offset="100%" />
          </linearGradient>
          <filter
            id="ffflux-filter"
            x="-20%" y="-20%" width="140%" height="140%"
            filterUnits="objectBoundingBox"
            primitiveUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.004 0.003"
              numOctaves={2}
              seed={2}
              stitchTiles="stitch"
              x="0%" y="0%" width="100%" height="100%"
              result="turbulence"
            />
            <feGaussianBlur
              stdDeviation="21 12"
              x="0%" y="0%" width="100%" height="100%"
              in="turbulence"
              edgeMode="duplicate"
              result="blur"
            />
            <feBlend
              mode="screen"
              x="0%" y="0%" width="100%" height="100%"
              in="SourceGraphic"
              in2="blur"
              result="blend"
            />
          </filter>
        </defs>
        <circle id="pathBall" cx={0} cy={0} r={100} fill="url(#ffflux-gradient)" />
      </svg>

      <section className="col col-lg-9 col-md-10 col-sm-12">
        <h1>Life</h1>

        {posts.length === 0 ? (
          <article className="row py-3">
            <h3>Noch keine Life-History-Eintraege</h3>
            <p>
              Erstelle in <Link href="/studio">Studio</Link> einen Post mit dem Typ <code>life</code>,
              um diese Sektion dynamisch zu fuellen.
            </p>
          </article>
        ) : (
          <>
            {posts.map((post) => (
              <article className="row py-3" key={post.id}>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
              </article>
            ))}

            <article className="row py-3">
              <p>
                <Link href="/life">Alle Stationen ansehen</Link>
              </p>
            </article>
          </>
        )}
      </section>
    </section>
  );
}
