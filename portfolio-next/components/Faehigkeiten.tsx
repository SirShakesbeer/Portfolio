import TunnelScene from './TunnelScene';

export default function Faehigkeiten() {
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

        <div className="tunnel-slide row">
          <div className="tunnel-card col col-lg-9 col-md-10 col-sm-12">
            <div className="ms-2 me-auto row">
              <h3>Programmiersprachen</h3>
              <ul className="list-group list-group-horizontal">
                <li className="list-group-item">C/C++</li>
                <li className="list-group-item">Java</li>
                <li className="list-group-item">C#</li>
                <li className="list-group-item">JavaScript</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="tunnel-slide row">
          <div className="tunnel-card col col-lg-9 col-md-10 col-sm-12">
            <div className="ms-2 me-auto">
              <h3>Web-Design</h3>
              <p>
                Durch die Module &quot;Multimedia I&quot; und &quot;Multimediale Webprogrammierung&quot;
                habe ich sowohl <em>HTML</em>, <em>CSS</em> und <em>JavaScript</em> als auch viele
                weitere Tools und Frameworks, wie <em>Bootstrap</em> und <em>GSAP</em> kennengelernt
                und ausführlich genutzt.
              </p>
            </div>
          </div>
        </div>

        <div className="tunnel-slide row">
          <div className="tunnel-card col col-lg-9 col-md-10 col-sm-12">
            <div className="ms-2 me-auto row">
              <div className="smallertext">Sprachen</div>
              <h3>Englisch</h3>
              <p>Im Bereich Informatik: Englisch Level C1.1 – <a href="/docs/Englisch_C1.1.pdf">Zertifikat</a></p>
              <p>Durch mein Auslandsjahr kann ich mich alltäglich und professionell flüssig ausdrücken.</p>
            </div>
          </div>
        </div>

        <div className="tunnel-slide row">
          <div className="tunnel-card col col-lg-9 col-md-10 col-sm-12">
            <div className="ms-2 me-auto row">
              <div className="smallertext">Sprachen</div>
              <h3>Französisch</h3>
              <p>Grundlagen vorhanden durch viele Jahre Unterricht in Deutschland und Kanada.</p>
            </div>
          </div>
        </div>

        <div className="tunnel-slide row">
          <div className="tunnel-card col col-lg-9 col-md-10 col-sm-12">
            <div className="ms-2 me-auto">
              <div className="smallertext">Tools</div>
              <h3>Microsoft Office</h3>
              <ul>
                <li><a href="/docs/Microsoft_Office.pdf">Microsoft Office Specialist Certification</a></li>
                <li><a href="/docs/word.pdf">Microsoft Office Word</a></li>
                <li><a href="/docs/excel.pdf">Microsoft Office Excel</a></li>
                <li><a href="/docs/powerpoint.pdf">Microsoft Office PowerPoint</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="tunnel-slide row">
          <div className="tunnel-card col col-lg-9 col-md-10 col-sm-12">
            <div className="ms-2 me-auto">
              <div className="smallertext">Tools</div>
              <h3>Unity</h3>
              <p>
                Während meines Aufenthalts in Kanada belegte ich den Kurs Game Design und
                programmierte ein Spiel in der Unity Game Engine mit C#.
              </p>
            </div>
          </div>
        </div>

        <div className="tunnel-slide row">
          <div className="tunnel-card col col-lg-9 col-md-10 col-sm-12">
            <div className="ms-2 me-auto">
              <div className="smallertext">Tools</div>
              <h3>DaVinci Resolve</h3>
              <p>
                Durch den Medienkurs meiner Schule hab ich einige Filme gedreht und geschnitten.
                Dafür habe ich DaVinci Resolve verwendet.
              </p>
            </div>
          </div>
        </div>

        <div className="tunnel-slide row">
          <div className="tunnel-card col col-lg-9 col-md-10 col-sm-12">
            <div className="ms-2 me-auto">
              <h3>Teamfähigkeit</h3>
              <p>
                An der Oberschule Wiederitzsch war ich mehrere Jahre im Schülerrat tätig, am
                Leibniz-Gymnasium Leipzig wurde ich zum Schülersprecher gewählt und war somit auch
                Teil des <a href="https://ssrleipzig.de">Stadtschülerrat Leipzig</a>.
              </p>
              <p>
                Events wie Vancouver Model United Nations 2020 oder Streamteam-Produktionen haben mir
                geholfen meine Teamfähigkeit zu stärken.
              </p>
            </div>
          </div>
        </div>

        {/* Empty slide needed as GSAP scroll end marker */}
        <div className="tunnel-slide row" id="tunnel-end" />
      </div>
    </section>
  );
}
