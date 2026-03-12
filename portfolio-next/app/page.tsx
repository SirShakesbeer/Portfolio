import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import About from '@/components/About';
import Leben from '@/components/Leben';
import Faehigkeiten from '@/components/Faehigkeiten';
import Projekte from '@/components/Projekte';
import Hobbies from '@/components/Hobbies';
import Referenzen from '@/components/Referenzen';
import Footer from '@/components/Footer';
import TopButton from '@/components/TopButton';
import QuellenOffcanvas from '@/components/QuellenOffcanvas';
import AnimationsInit from '@/components/AnimationsInit';

export default function Home() {
  return (
    <div className="container-fluid">
      <Header />
      <Navigation />
      <main className="row justify-content-center" id="content">
        <section className="col-10 col-md-10 col-sm-12 py-3">
          <About />
          <Leben />
          <Faehigkeiten />
          <Projekte />
          <Hobbies />
          <Referenzen />
        </section>
      </main>
      <Footer />
      <TopButton />
      <QuellenOffcanvas />
      {/* Initialises all GSAP ScrollTrigger animations after hydration */}
      <AnimationsInit />
    </div>
  );
}