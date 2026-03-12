import type { Metadata } from 'next';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'Impressum - Paul Thomasius',
  description: 'Impressum der Portfolio-Website von Paul Thomasius',
};

export default function ImpressumPage() {
  return (
    <main className="container py-5" style={{ maxWidth: '1000px' }}>
      <Navigation />

      <h1 className="mt-4">Impressum</h1>

      <section className="mt-4">
        <h2>Angaben gemäß Paragraph 5 DDG</h2>
        <p>
          Paul Thomasius
          <br />
          Studienprojekt / privates Portfolio
          <br />
          Leipzig, Deutschland
        </p>
      </section>

      <section className="mt-4">
        <h2>Kontakt</h2>
        <p>
          E-Mail:{' '}
          <a href="mailto:paul.thomasius@stud.htwk-leipzig.de">
            paul.thomasius@stud.htwk-leipzig.de
          </a>
        </p>
      </section>

      <section className="mt-4">
        <h2>Inhaltlich verantwortlich</h2>
        <p>Paul Thomasius</p>
      </section>

      <section className="mt-4">
        <h2>Haftungshinweis</h2>
        <p>
          Trotz sorgfaeltiger inhaltlicher Kontrolle uebernehme ich keine Haftung fuer die
          Inhalte externer Links. Fuer den Inhalt der verlinkten Seiten sind ausschliesslich
          deren Betreiber verantwortlich.
        </p>
      </section>
    </main>
  );
}
