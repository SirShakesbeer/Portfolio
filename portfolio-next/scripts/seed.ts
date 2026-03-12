/**
 * Seed script – populates the DB with initial posts.
 * Run once with:  npx tsx scripts/seed.ts
 */
import Database from 'better-sqlite3';
import { marked } from 'marked';
import path from 'path';

const db = new Database(path.join(process.cwd(), 'portfolio.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS post_types (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    slug        TEXT    NOT NULL UNIQUE,
    label       TEXT    NOT NULL,
    description TEXT    NOT NULL DEFAULT '',
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS posts (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    title             TEXT    NOT NULL,
    slug              TEXT    NOT NULL UNIQUE,
    post_type         TEXT    NOT NULL,
    excerpt           TEXT    NOT NULL DEFAULT '',
    content_markdown  TEXT    NOT NULL DEFAULT '',
    content_html      TEXT    NOT NULL DEFAULT '',
    cover_image       TEXT,
    tags              TEXT    NOT NULL DEFAULT '[]',
    status            TEXT    NOT NULL DEFAULT 'published',
    meta_json         TEXT    NOT NULL DEFAULT '{}',
    created_at        TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at        TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (post_type) REFERENCES post_types(slug)
  );
`);

db.exec(`
  INSERT OR IGNORE INTO post_types (slug, label, description) VALUES
    ('project', 'Project', 'Portfolio project with technical details'),
    ('skill', 'Skill', 'Skill profile entry such as tools, languages, strengths'),
    ('lifehistory', 'Life History', 'Timeline-style milestone or biography section'),
    ('note', 'Note', 'Short update or thought'),
    ('experiment', 'Experiment', 'Prototype, trial, or concept post');
`);

const insert = db.prepare(
  `INSERT OR IGNORE INTO posts
   (title, slug, post_type, excerpt, content_markdown, content_html, cover_image, tags, status)
   VALUES (@title, @slug, @post_type, @excerpt, @content_markdown, @content_html, @cover_image, @tags, 'published')`
);

const projects = [
  {
    title: 'WiFi-Thermometer',
    slug: 'wifi-thermometer',
    excerpt:
      'Pool-Temperatur-Sensor mit WeMos S2 Mini und DS18B20, der Messwerte per WLAN überträgt.',
    post_type: 'project',
    content_markdown: [
      'Fuer dieses Projekt benutzte ich die [PlatformIO IDE](https://platformio.org/platformio-ide).',
      'Das Ziel: Pool-Temperatur auf einem vorhandenen Familien-Display anzeigen.',
      '',
      'Ich verwendete einen wasserdichten **DS18B20**-Sensor und einen',
      '[WeMos S2 Mini](https://www.wemos.cc/en/latest/s2/s2_mini.html) (ESP32-basiert)',
      'fuer die WLAN-Funktionalitaet. Nach einigen USB-Port-Problemen unter Windows lief das Projekt',
      'zum ersten Mal erfolgreich.',
    ].join('\n'),
    cover_image: '/assets/img/lolin_s2_mini.webp',
    tags: JSON.stringify(['Arduino', 'ESP32', 'IoT', 'C++']),
  },
  {
    title: 'Bilder-Display',
    slug: 'bilder-display',
    excerpt:
      'Miniatur-Display auf Basis des Seeed Studio XIAO RP2040, das Bilder und GIFs anzeigt.',
    post_type: 'project',
    content_markdown: [
      'Mein erstes privates Hardware-Projekt: ein kleines Display, welches Bilder',
      '(eine spaetere Version auch GIFs) darstellen sollte.',
      '',
      'Dafuer habe ich einen',
      '[Seeed Studio XIAO RP2040](https://wiki.seeedstudio.com/XIAO-RP2040/) verwendet -',
      'wortwoertlich so gross wie ein Thumbnail. Loeten, die Arduino IDE und verschiedene Libraries',
      'wurden hier erstmals ausgiebig geuebt.',
    ].join('\n'),
    cover_image: '/assets/img/seeeduino_xiao_rp2040.webp',
    tags: JSON.stringify(['Arduino', 'Hardware', 'MicroPython']),
  },
];

for (const project of projects) {
  const result = insert.run({
    ...project,
    content_html: marked.parse(project.content_markdown) as string,
  });
  console.log(
    result.changes > 0
      ? `✓ Inserted:  ${project.title}`
      : `– Skipped (already exists): ${project.title}`
  );
}

const extraPosts = [
  {
    title: 'Web Development',
    slug: 'web-development-skill',
    excerpt: 'HTML, CSS, JavaScript, Bootstrap, GSAP und moderne Frontend-Workflows.',
    post_type: 'skill',
    content_markdown: [
      'Ich arbeite regelmaessig mit **HTML**, **CSS** und **JavaScript**.',
      '',
      'Frameworks/Tools:',
      '- Bootstrap',
      '- GSAP',
      '- Next.js',
      '',
      'Fokus: performante, interaktive und wartbare Interfaces.',
    ].join('\n'),
    cover_image: '/assets/img/portrait.webp',
    tags: JSON.stringify(['frontend', 'javascript', 'nextjs']),
  },
  {
    title: 'Programmiersprachen',
    slug: 'programmiersprachen-skill',
    excerpt: 'Erfahrung mit C/C++, Java, C# und JavaScript.',
    post_type: 'skill',
    content_markdown: [
      'Im Studium und in Projekten habe ich mit folgenden Sprachen gearbeitet:',
      '- C/C++',
      '- Java',
      '- C#',
      '- JavaScript',
    ].join('\n'),
    cover_image: '/assets/img/portrait.webp',
    tags: JSON.stringify(['c++', 'java', 'csharp', 'javascript']),
  },
  {
    title: 'Sprachen: Englisch und Franzoesisch',
    slug: 'sprachen-englisch-franzoesisch',
    excerpt: 'Englisch C1.1 und praktische Alltagserfahrung aus dem Auslandsjahr.',
    post_type: 'skill',
    content_markdown: [
      '## Englisch',
      'Im Bereich Informatik: Englisch Level C1.1.',
      '',
      'Durch mein Auslandsjahr kann ich mich alltaeglich und professionell fluessig ausdruecken.',
      '',
      '## Franzoesisch',
      'Grundlagen sind vorhanden durch viele Jahre Unterricht in Deutschland und Kanada.',
    ].join('\n'),
    cover_image: '/assets/img/portrait.webp',
    tags: JSON.stringify(['english', 'french', 'communication']),
  },
  {
    title: 'Tools und Medienproduktion',
    slug: 'tools-und-medienproduktion',
    excerpt: 'Microsoft Office, Unity und DaVinci Resolve aus Schule und Projekten.',
    post_type: 'skill',
    content_markdown: [
      '## Microsoft Office',
      'An der THSS absolvierte ich mehrere Office-Zertifikate.',
      '',
      '## Unity',
      'In Kanada belegte ich den Kurs Game Design und programmierte ein Spiel in Unity mit C#.',
      '',
      '## DaVinci Resolve',
      'Durch den Medienkurs meiner Schule habe ich mehrere Filme gedreht und geschnitten.',
    ].join('\n'),
    cover_image: '/assets/img/back.webp',
    tags: JSON.stringify(['office', 'unity', 'davinci-resolve', 'media']),
  },
  {
    title: 'Teamfaehigkeit und Engagement',
    slug: 'teamfaehigkeit-und-engagement',
    excerpt: 'Schuelerrat, Schuelersprecher und Teamarbeit in Produktionen.',
    post_type: 'skill',
    content_markdown: [
      'An der Oberschule Wiederitzsch war ich mehrere Jahre im Schuelerrat taetig.',
      '',
      'Am Leibniz-Gymnasium Leipzig wurde ich zum Schuelersprecher gewaehlt und war Teil des Stadtschuelerrats Leipzig.',
      '',
      'Events wie VMUN oder Streamteam-Produktionen haben meine Teamfaehigkeit weiter gestaerkt.',
    ].join('\n'),
    cover_image: '/assets/img/back.webp',
    tags: JSON.stringify(['teamwork', 'leadership', 'school']),
  },
  {
    title: 'Der Ursprung',
    slug: 'leben-der-ursprung',
    excerpt: 'Geboren in Schkeuditz, aufgewachsen in Leipzig.',
    post_type: 'lifehistory',
    content_markdown: [
      'Offiziell wurde ich in Schkeuditz geboren, aber ich lebe schon mein ganzes Leben in Leipzig.',
    ].join('\n'),
    cover_image: '/assets/img/back.webp',
    tags: JSON.stringify(['leipzig', 'kindheit']),
  },
  {
    title: 'Schulzeit und Praktika',
    slug: 'leben-schulzeit-und-praktika',
    excerpt: 'Weg von der Grundschule bis zum Gymnasium inklusive erster Praktika.',
    post_type: 'lifehistory',
    content_markdown: [
      'Ich begann an der Grundschule Wiederitzsch und wechselte danach auf die Oberschule in Wiederitzsch.',
      '',
      'Dort war ich im Schuelerrat taetig und spielte neben der Schule Schlagzeug.',
      '',
      'Nach der zehnten Klasse folgte der Wechsel Richtung Gymnasium, davor aber ein Auslandsjahr in Kanada.',
      '',
      'Waehrend meiner Schulzeit absolvierte ich Praktika bei Augenoptik Findeisen und im Familien-Info-Buero Leipzig.',
    ].join('\n'),
    cover_image: '/assets/img/back.webp',
    tags: JSON.stringify(['schule', 'praktikum']),
  },
  {
    title: 'Auslandsjahr in Kanada',
    slug: 'kanada-auslandsjahr',
    excerpt: 'Schuljahr in Vancouver mit Fokus auf Sprache, Teamarbeit und Selbstorganisation.',
    post_type: 'lifehistory',
    content_markdown: [
      'Im Herbst 2019 flog ich nach Vancouver, um dort zehn Monate eine kanadische Schule zu besuchen.',
      '',
      'Diese Zeit hat mir besonders geholfen bei:',
      '- Englisch im Alltag',
      '- Selbstorganisation',
      '- Interkultureller Zusammenarbeit',
    ].join('\n'),
    cover_image: '/assets/img/back.webp',
    tags: JSON.stringify(['kanada', 'schule', 'sprache']),
  },
  {
    title: 'Kanada: VMUN und Lockdown',
    slug: 'kanada-vmun-und-lockdown',
    excerpt: 'DISEC-Delegation bei VMUN und Erfahrungen waehrend der Corona-Zeit.',
    post_type: 'lifehistory',
    content_markdown: [
      'Bei den Vancouver Model United Nations uebernahm ich im DISEC-Komitee die Delegation von Zypern.',
      '',
      'Die Veranstaltung gab mir einen Einblick in strukturierte Debatten, Teamarbeit und internationale Perspektiven.',
      '',
      '2020 wurden viele weitere Events durch den Corona-Lockdown eingeschraenkt oder abgesagt.',
    ].join('\n'),
    cover_image: '/assets/img/back.webp',
    tags: JSON.stringify(['kanada', 'vmun', 'lockdown']),
  },
  {
    title: 'Abitur und Schleifenjahr',
    slug: 'abitur-und-schleifenjahr',
    excerpt: 'Rueckkehr nach Deutschland und Abschluss am Leibniz-Gymnasium Leipzig.',
    post_type: 'lifehistory',
    content_markdown: [
      'Nach meiner Rueckkehr aus Kanada machte ich mein Abitur am Leibniz-Gymnasium Leipzig.',
      '',
      'Durch den Wechsel von der Oberschule und das Auslandsjahr verlaengerte sich meine Schullaufbahn um zwei Jahre.',
      '',
      'Direkt nach dem Abschluss begann ich zu studieren.',
    ].join('\n'),
    cover_image: '/assets/img/back.webp',
    tags: JSON.stringify(['abitur', 'leipzig']),
  },
  {
    title: 'Studium Medieninformatik',
    slug: 'studium-medieninformatik-htwk',
    excerpt: 'Studium an der HTWK Leipzig und Mitarbeit im Streamteam.',
    post_type: 'lifehistory',
    content_markdown: [
      'Aufgrund meines Interesses an Computern entschied ich mich fuer Medieninformatik an der HTWK Leipzig.',
      '',
      'Nebenbei bin ich Teil des Streamteams und habe bei mehreren Produktionen mitgewirkt.',
    ].join('\n'),
    cover_image: '/assets/img/portrait.webp',
    tags: JSON.stringify(['studium', 'htwk', 'streamteam']),
  },
];

for (const post of extraPosts) {
  const result = insert.run({
    ...post,
    content_html: marked.parse(post.content_markdown) as string,
  });
  console.log(
    result.changes > 0
      ? `✓ Inserted:  ${post.title}`
      : `– Skipped (already exists): ${post.title}`
  );
}

db.close();
console.log('\nSeeding done.');
