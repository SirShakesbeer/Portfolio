/**
 * Seed script – populates the DB with the initial legacy projects.
 * Run once with:  npx tsx scripts/seed.ts
 */
import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(process.cwd(), 'portfolio.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT    NOT NULL,
    slug        TEXT    NOT NULL UNIQUE,
    description TEXT    NOT NULL,
    body        TEXT    NOT NULL DEFAULT '',
    cover_image TEXT,
    tags        TEXT    NOT NULL DEFAULT '[]',
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`);

const insert = db.prepare(`
  INSERT OR IGNORE INTO projects (title, slug, description, body, cover_image, tags)
  VALUES (@title, @slug, @description, @body, @cover_image, @tags)
`);

const projects = [
  {
    title: 'WiFi-Thermometer',
    slug: 'wifi-thermometer',
    description:
      'Pool-Temperatur-Sensor mit WeMos S2 Mini und DS18B20, der Messwerte per WLAN überträgt.',
    body: `
      <p>Für dieses Projekt benutzte ich die <a href="https://platformio.org/platformio-ide">PlatformIO IDE</a>.
      Das Ziel: Pool-Temperatur auf einem vorhandenen Familien-Display anzeigen.</p>
      <p>Ich verwendete einen wasserdichten <strong>DS18B20</strong>-Sensor und einen
      <a href="https://www.wemos.cc/en/latest/s2/s2_mini.html">WeMos S2 Mini</a> (ESP32-basiert)
      für die WLAN-Funktionalität. Nach einigen USB-Port-Problemen unter Windows lief das Projekt
      zum ersten Mal erfolgreich.</p>
    `,
    cover_image: '/assets/img/lolin_s2_mini.webp',
    tags: JSON.stringify(['Arduino', 'ESP32', 'IoT', 'C++']),
  },
  {
    title: 'Bilder-Display',
    slug: 'bilder-display',
    description:
      'Miniatur-Display auf Basis des Seeed Studio XIAO RP2040, das Bilder und GIFs anzeigt.',
    body: `
      <p>Mein erstes privates Hardware-Projekt: ein kleines Display, welches Bilder
      (eine spätere Version auch GIFs) darstellen sollte.</p>
      <p>Dafür habe ich einen
      <a href="https://wiki.seeedstudio.com/XIAO-RP2040/">Seeed Studio XIAO RP2040</a> verwendet –
      wortwörtlich so groß wie ein Thumbnail. Löten, die Arduino IDE und verschiedene Libraries
      wurden hier erstmals ausgiebig geübt.</p>
    `,
    cover_image: '/assets/img/seeeduino_xiao_rp2040.webp',
    tags: JSON.stringify(['Arduino', 'Hardware', 'MicroPython']),
  },
];

for (const project of projects) {
  const result = insert.run(project);
  console.log(
    result.changes > 0
      ? `✓ Inserted:  ${project.title}`
      : `– Skipped (already exists): ${project.title}`
  );
}

db.close();
console.log('\nSeeding done.');
