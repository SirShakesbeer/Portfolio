export default function Hobbys() {
  return (
    <section className="content-item row justify-content-md-center" id="hobbys">
      <div className="col col-lg-9 col-md-10 col-sm-12">
        <h1>Hobbys</h1>
        <div className="container">
          <div className="row row-cols-auto row-gap-3">

            <div className="col-sm-12 col-md-6 col-lg-4">
              <div className="card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/img/dice-dice-d20-d20-d-d-dungeons-dragons-roll-dnd-role-playing.webp"
                  loading="lazy"
                  className="card-img-top"
                  alt="DnD Würfel"
                />
                <div className="card-body">
                  <h5 className="card-title">DnD</h5>
                  <p className="card-text">
                    Dank Mr. Biggar und Mr. Goodman bin ich seit Jahren Fan von Dungeons&nbsp;and&nbsp;Dragons
                    und treffe mich regelmäßig mit Freunden um gemeinsam Geschichten zu erzählen.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-sm-12 col-md-6 col-lg-4">
              <div className="card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://www.saechsischer-chorverband.de/_Resources/Persistent/88c59472aaab2a8dc34cf55d262b7725552c6f77/gewandhaus_DSC2454-1900x832.jpg"
                  loading="lazy"
                  className="card-img-top"
                  alt="Gewandhaussingen Chor"
                />
                <div className="card-body">
                  <h5 className="card-title">Chor</h5>
                  <p className="card-text">
                    Mit meinem Chor wird jede Woche geübt. Normalerweise treten wir in meiner
                    ehemaligen Schule auf – wir waren aber auch schon im Gewandhaus.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-sm-12 col-md-6 col-lg-4">
              <div className="card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/img/guitar-acoustic-guitar-instrument-musical-instrument-close-up-violin-101197-pxhere.com.webp"
                  loading="lazy"
                  className="card-img-top"
                  alt="Gitarre"
                />
                <div className="card-body">
                  <h5 className="card-title">Instrumente</h5>
                  <p className="card-text">
                    Ich habe aus meiner Kindheit viele Jahre Schlagzeug-Erfahrung und habe mir seit
                    ein paar Jahren versucht selbst Ukulele, Gitarre und Bass beizubringen.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-sm-12 col-md-6 col-lg-4">
              <div className="card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/img/maus.webp"
                  loading="lazy"
                  className="card-img-top"
                  alt="Kurzohrrüsselspringer"
                />
                <div className="card-body">
                  <h5 className="card-title">Gaming</h5>
                  <p className="card-text">
                    Ich wäre kein Informatik-Student, wenn ich nicht auch Interesse an
                    Computerspielen hätte ;)
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
