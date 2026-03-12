import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import Script from 'next/script';
import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['100', '300', '400', '500', '700', '900'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.imn.htwk-leipzig.de/~pthomasi'),
  title: 'Paul - Portfolio',
  description:
    'Portfolio von Paul Thomasius. Hier finden Sie Informationen über mich, meine Projekte und meine Hobbys.',
  keywords: ['Portfolio', 'web design', 'web development', 'HTWK Leipzig', 'Medieninformatik', 'Paul Thomasius'],
  authors: [{ name: 'Paul Thomasius' }],
  openGraph: {
    title: 'Paul Thomasius - Portfolio',
    description:
      'Portfolio von Paul Thomasius. Hier finden Sie Informationen über mich, meine Projekte und meine Hobbys.',
    url: 'https://www.imn.htwk-leipzig.de/~pthomasi',
    type: 'website',
    images: [{ url: '/assets/icons/letter-uppercase-circle-p-svgrepo-com.svg' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        <link
          rel="icon"
          href="/assets/icons/letter-uppercase-circle-p-svgrepo-com.svg"
          type="image/svg+xml"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: 'Paul Thomasius',
              url: 'https://www.imn.htwk-leipzig.de/~pthomasi',
              image: '/assets/icons/letter-uppercase-circle-p-svgrepo-com.svg',
              jobTitle: 'Student',
              worksFor: { '@type': 'Organization', name: 'HTWK Leipzig' },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Paul Thomasius - Portfolio',
              url: 'https://www.imn.htwk-leipzig.de/~pthomasi',
            }),
          }}
        />
      </head>
      <body className={roboto.className}>
        {children}
        {/* Bootstrap JS bundle (includes Popper) – loaded after page is interactive */}
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
