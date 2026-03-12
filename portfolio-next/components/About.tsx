export default function About() {
  return (
    <section className="content-item row justify-content-md-center" id="about">
      <article className="col col-lg-9 col-md-10 col-sm-12">
        <h1>About</h1>
        <p>
          Hey! Mein Name ist Paul und ich studiere Medieninformatik an der HTWK Leipzig. Bei Fragen
          und Hinweisen, <a href="#footer">schreib mich gerne an</a>. Viel Spaß auf meiner Seite! :)
        </p>
        <div className="row justify-content-center">
          <div className="col-lg-10 col-md-10 col-sm-12">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/img/portrait.webp"
              alt="Portrait von Paul Thomasius"
              className="portrait"
            />
          </div>
        </div>
      </article>
    </section>
  );
}
