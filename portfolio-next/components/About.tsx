import { getPostsByType } from '@/lib/db';

type AboutPost = {
  content_html: string;
};

export default function About() {
  const aboutPosts = getPostsByType('about') as AboutPost[];
  const fallbackAboutHtml =
    'Hi! Mein Name ist Paul. Ich bin Student der Medieninformatik mit Fokus auf Web und UX. Wenn du Fragen hast und Hinweise, <a href="/contact">schreib mich gerne an</a>. Viel Spaß auf meiner Seite! :)';
  const rawAboutHtml = aboutPosts[0]?.content_html?.trim() || fallbackAboutHtml;
  const paragraphMatch = rawAboutHtml.match(/^<p[^>]*>([\s\S]*)<\/p>\s*$/i);
  const aboutParagraphHtml = paragraphMatch?.[1] || rawAboutHtml;

  return (
    <section className="content-item row justify-content-md-center" id="about">
      <article className="col col-lg-9 col-md-10 col-sm-12">
        <h1>About</h1>
        <p dangerouslySetInnerHTML={{ __html: aboutParagraphHtml }} />
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
