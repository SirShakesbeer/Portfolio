import Link from 'next/link';
import { getProjects } from '@/lib/db';

type Project = {
  id: number;
  title: string;
  slug: string;
  description: string;
  cover_image: string | null;
  tags: string;
  created_at: string;
};

// Server component – directly queries SQLite, no API round-trip needed.
export default async function Projekte() {
  const dbProjects = getProjects() as Project[];

  return (
    <section className="content-item row justify-content-md-center" id="projekte">
      <section className="col col-lg-9 col-md-10 col-sm-12">
        <h1>Projekte</h1>

        {/* ── Dynamic projects from the database ── */}
        {dbProjects.length > 0 && (
          <>
            <h2 className="mt-4">Neue Projekte</h2>
            <div className="project-card-grid">
              {dbProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.slug}`}
                  className="project-card-link"
                >
                  <div className="card h-100">
                    {project.cover_image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={project.cover_image}
                        className="card-img-top"
                        alt={project.title}
                      />
                    )}
                    <div className="card-body">
                      <h5 className="card-title">{project.title}</h5>
                      <p className="card-text">{project.description}</p>
                      <small style={{ opacity: 0.7 }}>
                        {new Date(project.created_at).toLocaleDateString('de-DE')}
                      </small>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* ── Legacy static projects ── */}
        <h2 className="mt-5">Frühere Arbeiten</h2>

        <article>
          <h3>Video-Bearbeitung</h3>
          <p>
            &quot;Wie wird Sauerkraut hergestellt?&quot; – Über mehrere Wochen erstreckte sich dieses
            Schulprojekt und belohnte mich mit einer okay-schmeckenden Beilage und einer sehr guten
            Note. Das Video wird auch heute noch neuen Schülern im Bionik-Kurs gezeigt.
          </p>
          <p className="py-2" id="video">
            <video controls>
              <source src="/vid/tutorial.webm" type="video/webm" />
              Ihr Browser unterstützt das Video-Tag nicht.
            </video>
          </p>
        </article>

        <article>
          <h3>Arduino-Schmarduino</h3>
          <p>
            Im ersten Semester nimmt man am Modul Digitaltechnik I teil. In zwei Praktika muss man im
            Hardware-Labor verschiedene Aufgaben bewältigen – von Hardware-Software-Interaktion bis
            zur Lichtshow auf einem Arduino.
          </p>

          <h3>Bilder-Display</h3>
          <p>
            Mein erstes privates Projekt: ein kleines Display, das Bilder (eine spätere Version auch
            GIFs) darstellt. Dafür verwendete ich einen{' '}
            <a href="https://wiki.seeedstudio.com/XIAO-RP2040/">Seeed Studio XIAO RP2040</a>.
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/img/seeeduino_xiao_rp2040.webp"
            alt="Seeed Studio XIAO RP2040"
            className="img-fluid"
          />

          <h3 className="mt-4">WiFi-Thermometer</h3>
          <p>
            Ein Geschenk-Projekt: Pool-Temperatur per{' '}
            <a href="https://www.wemos.cc/en/latest/s2/s2_mini.html">WeMos S2 Mini</a> (ESP32) und
            wasserdichtem DS18B20-Sensor auf ein vorhandenes Display übertragen.
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/img/lolin_s2_mini.webp"
            alt="WeMos S2 Mini"
            className="img-fluid"
          />
        </article>

        <article className="mt-4">
          <h3>Facharbeit</h3>
          <p>
            Facharbeit über mein Auslandsjahr in Kanada:{' '}
            <a href="/docs/Term Paper - An Exchange Year in Canada.pdf">
              Term Paper – An Exchange Year in Canada
            </a>
          </p>
        </article>
      </section>
    </section>
  );
}
