import type { Metadata } from 'next';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'Kontakt & Links - Paul Thomasius',
  description: 'Kontaktinformationen und wichtige Links von Paul Thomasius',
};

export default function ContactPage() {
  return (
    <main className="container py-5" style={{ maxWidth: '1000px' }}>
      <Navigation />

      <h1 className="mt-4">Kontakt & Links</h1>
      <p>
        Fragen, Feedback oder Lust auf Austausch? Schreib mir gerne eine Nachricht.
      </p>

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
        <h2>Links</h2>
        <ul>
          <li>
            <a href="/">Startseite</a>
          </li>
          <li>
            <a href="/projects">Projekte</a>
          </li>
          <li>
            <a href="/skills">Skills</a>
          </li>
          <li>
            <a href="/life">Life</a>
          </li>
          <li>
            <a href="https://www.imn.htwk-leipzig.de/~pthomasi" target="_blank" rel="noreferrer">
              Hochschulprofil
            </a>
          </li>
        </ul>
      </section>
    </main>
  );
}
