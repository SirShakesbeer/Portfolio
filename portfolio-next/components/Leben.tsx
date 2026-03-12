// Server component – the SVG markup is static; GSAP animates it client-side via AnimationsInit.
export default function Leben() {
  return (
    <section className="content-item row justify-content-md-center" id="leben">
      {/* Invisible path that GSAP uses to animate the ball */}
      <svg width="100%" height="100%" viewBox="0 0 800 2000" preserveAspectRatio="none" id="pathSVG">
        <path
          id="path"
          d="M 0 50 Q 150 125 250 625 Q 275 750 300 1125 Q 350 1375 400 1125 C 400 875 250 1000 300 1375 C 350 1625 400 1750 250 2000 C 150 2250 350 2250 300 2500 C 250 2750 100 2750 400 3125 C 550 3375 550 3750 800 3750"
        />
      </svg>

      {/* Ball that follows the path */}
      <svg width="100%" height="100%" viewBox="0 0 800 1400" id="ballSVG">
        <defs>
          <linearGradient
            gradientTransform="rotate(156, 0.5, 0.5)"
            x1="50%" y1="0%" x2="50%" y2="100%"
            id="ffflux-gradient"
          >
            <stop stopColor="#0b4f6c" stopOpacity="1" offset="0%" />
            <stop stopColor="#88ce02" stopOpacity="1" offset="100%" />
          </linearGradient>
          <filter
            id="ffflux-filter"
            x="-20%" y="-20%" width="140%" height="140%"
            filterUnits="objectBoundingBox"
            primitiveUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.004 0.003"
              numOctaves={2}
              seed={2}
              stitchTiles="stitch"
              x="0%" y="0%" width="100%" height="100%"
              result="turbulence"
            />
            <feGaussianBlur
              stdDeviation="21 12"
              x="0%" y="0%" width="100%" height="100%"
              in="turbulence"
              edgeMode="duplicate"
              result="blur"
            />
            <feBlend
              mode="screen"
              x="0%" y="0%" width="100%" height="100%"
              in="SourceGraphic"
              in2="blur"
              result="blend"
            />
          </filter>
        </defs>
        <circle id="pathBall" cx={0} cy={0} r={100} fill="url(#ffflux-gradient)" />
      </svg>

      <section className="col col-lg-9 col-md-10 col-sm-12">
        <h1>Leben</h1>

        <article className="row py-3">
          <h3>Der Ursprung</h3>
          <p>
            Offiziell wurde ich in Schkeuditz geboren aber ich lebe schon mein ganzes Leben in Leipzig.
          </p>
        </article>

        <article>
          <h3>Schule</h3>
          <p>
            Ich begann an der Grundschule Wiederitzsch und bin nach der vierten Klasse auf die
            Oberschule (ebenfalls in Wiederitzsch) gewechselt. Dort war ich im Schülerrat tätig und
            spielte neben der Schule Schlagzeug. Nach der zehnten Klasse konnte ich aufs Gymnasium
            wechseln, was ich auch tat – aber zunächst folgte ein Auslandsjahr in Kanada.
          </p>
          <h4>Praktika</h4>
          <p>
            Während meiner Schulzeit habe ich zwei Praktika bei verschiedenen Arbeitgebern gemacht.
            Mein erstes Praktikum machte ich trotz Brillenlosigkeit bei{' '}
            <a href="https://www.augenoptik-findeisen.de">Augenoptik Findeisen</a>. Das zweite
            Praktikum machte ich im{' '}
            <a href="https://www.leipzig.de/buergerservice-und-verwaltung/aemter-und-behoerdengaenge/behoerden-und-dienstleistungen/dienststelle/familieninfobuero-5132fib">
              Familien-Info-Büro Leipzig
            </a>. Auch wenn beide Praktika nicht relevant wirken, habe ich viel über die Arbeitswelt
            und den Umgang mit verschiedenen Menschen gelernt.
          </p>
        </article>

        <article>
          <h3>Kanada</h3>
          <p>
            Im Herbst 2019 flog ich nach Vancouver um dort zehn Monate eine kanadische Schule zu
            besuchen.{' '}
            <a href="https://secondary.sd42.ca/thss/">Thomas Haney Secondary School</a> hat mich und
            viele weitere internationale Schüler willkommen gehießen. Das offizielle Motto von{' '}
            <abbr title="Thomas Haney Secondary School">THSS</abbr> lautet{' '}
            <q>Seek Challenge, Experience Success</q>. Im Scherz hatten wir als Schülerschaft unser
            eigenes Motto: <q>Procrastinate.</q>
          </p>
          <p>
            Der alltägliche Umgang mit Englisch, vor allem durch Freunde aber auch wegen meiner
            Host-Family, hat mir sehr geholfen die Sprache besser zu verstehen und anzuwenden.
          </p>
          <h4>VMUN</h4>
          <p>
            Leider traf uns in Kanada im Jahr 2020 auch der Corona-bedingte Lockdown, weshalb viele
            Events ausfallen mussten. Zum Glück konnte einiges vorher noch geschehen, wie{' '}
            <abbr title="Vancouver Model United Nations">VMUN</abbr>. Bei den{' '}
            <a href="https://vmun.com">Vancouver Model United Nations</a> habe ich im Komitee{' '}
            <abbr title="Disarmament and International Security Committee">DISEC</abbr> die Delegation
            von Zypern übernommen.
          </p>
        </article>

        <article>
          <h3>Abschluss</h3>
          <p>
            Nachdem ich wieder in Deutschland angekommen bin, machte ich mein Abitur am{' '}
            <a href="https://www.leibniz-gymnasium-leipzig.de">Leibniz-Gymnasium Leipzig</a>. Durch
            das Auslandsjahr und ein Schleifenjahr wurde mein Schulweg um zwei Jahre verlängert, daher
            habe ich direkt nach meinem Abschluss angefangen zu studieren.
          </p>
        </article>

        <article>
          <h3>Studium</h3>
          <p>
            Aufgrund meines Interesses an Computern entschied ich mich für den Studiengang
            Medieninformatik an der{' '}
            <a href="https://www.htwk-leipzig.de">HTWK Leipzig</a>. Nebenbei bin ich Teil des{' '}
            <a href="https://streamteam.htwk-leipzig.de">Streamteams</a> und habe schon bei einigen
            Produktionen mitgewirkt.
          </p>
        </article>
      </section>
    </section>
  );
}
