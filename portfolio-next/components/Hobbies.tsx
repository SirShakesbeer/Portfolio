import { getPostsByType } from '@/lib/db';

type HobbyPost = {
  id: number;
  title: string;
  excerpt: string;
  content_html: string;
  cover_image: string | null;
};

type HobbyCard = {
  id: number;
  title: string;
  bodyHtml: string;
  image: string;
  alt: string;
};

export default function Hobbys() {
  const hobbyPosts = getPostsByType('hobby') as HobbyPost[];

  const fallbackCards: HobbyCard[] = [
    {
      id: 1,
      title: 'DnD',
      bodyHtml:
        'Dank Mr. Biggar und Mr. Goodman bin ich seit Jahren Fan von Dungeons&nbsp;and&nbsp;Dragons und treffe mich regelmäßig mit Freunden um gemeinsam Geschichten zu erzählen.',
      image: '/assets/img/dice-dice-d20-d20-d-d-dungeons-dragons-roll-dnd-role-playing.webp',
      alt: 'DnD Würfel',
    },
    {
      id: 2,
      title: 'Chor',
      bodyHtml:
        'Mit meinem Chor wird jede Woche geübt. Normalerweise treten wir in meiner ehemaligen Schule auf - wir waren aber auch schon im Gewandhaus.',
      image: 'https://www.saechsischer-chorverband.de/_Resources/Persistent/88c59472aaab2a8dc34cf55d262b7725552c6f77/gewandhaus_DSC2454-1900x832.jpg',
      alt: 'Gewandhaussingen Chor',
    },
    {
      id: 3,
      title: 'Instrumente',
      bodyHtml:
        'Ich habe aus meiner Kindheit viele Jahre Schlagzeug-Erfahrung und habe mir seit ein paar Jahren versucht selbst Ukulele, Gitarre und Bass beizubringen.',
      image: '/assets/img/guitar-acoustic-guitar-instrument-musical-instrument-close-up-violin-101197-pxhere.com.webp',
      alt: 'Gitarre',
    },
    {
      id: 4,
      title: 'Gaming',
      bodyHtml:
        'Ich wäre kein Informatik-Student, wenn ich nicht auch Interesse an Computerspielen hätte ;)',
      image: '/assets/img/maus.webp',
      alt: 'Kurzohrrüsselspringer',
    },
  ];

  const orderedHobbyPosts = [...hobbyPosts].sort((a, b) => a.id - b.id);

  const cards: HobbyCard[] =
    hobbyPosts.length > 0
      ? orderedHobbyPosts.map((post) => {
        const rawBody = post.content_html?.trim() || post.excerpt;
        const bodyMatch = rawBody.match(/^<p[^>]*>([\s\S]*)<\/p>\s*$/i);
        return {
          id: post.id,
          title: post.title,
          bodyHtml: bodyMatch?.[1] || rawBody,
          image: post.cover_image || '/assets/img/portrait.webp',
          alt: post.title,
        };
      })
      : fallbackCards;

  return (
    <section className="content-item row justify-content-md-center" id="hobbys">
      <div className="col col-lg-9 col-md-10 col-sm-12">
        <h1>Hobbys</h1>
        <div className="container">
          <div className="row row-cols-auto row-gap-3">
            {cards.map((card) => (
              <div className="col-sm-12 col-md-6 col-lg-4" key={card.id}>
                <div className="card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={card.image}
                    loading="lazy"
                    className="card-img-top"
                    alt={card.alt}
                  />
                  <div className="card-body">
                    <h5 className="card-title">{card.title}</h5>
                    <p className="card-text" dangerouslySetInnerHTML={{ __html: card.bodyHtml }} />
                  </div>
                </div>
              </div>
            ))}

          </div>
        </div>
      </div>
    </section>
  );
}
