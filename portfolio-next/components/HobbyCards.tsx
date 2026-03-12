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

export default function HobbyCards() {
  const hobbyPosts = getPostsByType('hobby') as HobbyPost[];

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
      : [];

  return (
    <section className="content-item row justify-content-md-center" id="hobbys">
      <div className="col col-lg-9 col-md-10 col-sm-12">
        <h1>Hobbies</h1>
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
