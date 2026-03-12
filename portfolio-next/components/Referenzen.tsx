import { getPostsByType } from '@/lib/db';

type ReferencePost = {
  id: number;
  title: string;
  excerpt: string;
  content_html: string;
};

type ReferenceItem = {
  id: number;
  title: string;
  bodyHtml: string;
};

export default function Referenzen() {
  const referencePosts = getPostsByType('reference') as ReferencePost[];
  const fallbackReferences: ReferenceItem[] = [
    {
      id: 1,
      title: 'Politische Arbeit',
      bodyHtml: 'Für meine Dienste als Friedensbotschafter der UN erhielt ich schon 47 Friedensnobelpreise.',
    },
    {
      id: 2,
      title: 'Arbeitgeber',
      bodyHtml: 'Arbeitgeber sagten über mich: <q>Er ist okay.</q>',
    },
    {
      id: 3,
      title: 'Freunde',
      bodyHtml: 'Freunde sagten über mich: <q>Er ist okay.</q>',
    },
  ];

  const orderedReferencePosts = [...referencePosts].sort((a, b) => a.id - b.id);

  const references: ReferenceItem[] =
    referencePosts.length > 0
      ? orderedReferencePosts.map((post) => {
        const rawBody = post.content_html?.trim() || post.excerpt;
        const bodyMatch = rawBody.match(/^<p[^>]*>([\s\S]*)<\/p>\s*$/i);
        return {
          id: post.id,
          title: post.title,
          bodyHtml: bodyMatch?.[1] || rawBody,
        };
      })
      : fallbackReferences;

  return (
    <section className="content-item row justify-content-md-center" id="referenzen">
      <div className="col col-lg-9 col-md-10 col-sm-12">
        <h1>Referenzen</h1>
        <ul className="list-group list-group-flush">
          {references.map((reference) => (
            <li className="list-group-item" key={reference.id}>
              <h4>{reference.title}</h4>
              <p dangerouslySetInnerHTML={{ __html: reference.bodyHtml }} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
