import Link from 'next/link';
import { getPostsByType } from '@/lib/db';
import TunnelScene from './TunnelScene';

type SkillPost = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
};

export default function Faehigkeiten() {
  const skills = getPostsByType('skill') as SkillPost[];

  return (
    <section className="tunnel row justify-content-md-center" id="fähigkeiten">
      {/* Absolute-positioned Three.js canvas – z-index 1, behind the slides */}
      <div className="px-0" id="tunnelCanvas">
        <TunnelScene />
      </div>

      <div className="col tunnel-content col-lg-9 col-md-10 col-sm-12">
        <div className="tunnel-slide row" id="tunnel-title">
          <div className="tunnel-card col-9">
            <h1>Fähigkeiten</h1>
          </div>
        </div>

        {skills.length === 0 ? (
          <div className="tunnel-slide row">
            <div className="tunnel-card col col-lg-9 col-md-10 col-sm-12">
              <div className="ms-2 me-auto row">
                <h3>Noch keine Skills vorhanden</h3>
                <p>
                  Erstelle in <Link href="/studio">Studio</Link> einen Post mit Typ <code>skill</code>,
                  um diese Slides dynamisch zu befuellen.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {skills.map((skill) => (
              <div className="tunnel-slide row" key={skill.id}>
                <div className="tunnel-card col col-lg-9 col-md-10 col-sm-12">
                  <div className="ms-2 me-auto row">
                    <div className="smallertext">Skill</div>
                    <h3>{skill.title}</h3>
                    <p>{skill.excerpt}</p>
                  </div>
                </div>
              </div>
            ))}
            <div className="tunnel-slide row">
              <div className="tunnel-card col col-lg-9 col-md-10 col-sm-12">
                <div className="ms-2 me-auto row">
                  <h3>Alle Skills</h3>
                  <p>
                    <Link href="/skills">Zur Skills-Uebersicht</Link>
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Empty slide needed as GSAP scroll end marker */}
        <div className="tunnel-slide row" id="tunnel-end" />
      </div>
    </section>
  );
}
