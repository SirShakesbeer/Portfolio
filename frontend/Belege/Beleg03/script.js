function toggleVisualStorytelling() {
    const introSection = document.getElementById('intro-section');
    const storytellingText = document.getElementById('storytelling-text');

    if (introSection.style.backgroundColor === "white" || introSection.style.backgroundColor === "") {
        // Wenn aktuell Weiß → Setze Bild mit Farbverlauf
        introSection.style.background = "linear-gradient(to top, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0)), url('landscape1.jpg') center/cover no-repeat";
        storytellingText.innerHTML = "Visual Storytelling nutzt starke visuelle Elemente, um Emotionen zu erzeugen und Botschaften eindrucksvoll zu vermitteln.";
    } else {
        // Wenn aktuell ein Bild → Hintergrund auf Weiß setzen
        introSection.style.background = "white";
        storytellingText.innerHTML = "Ein einfacher Textblock ohne visuelle Unterstützung kann schnell an Aufmerksamkeit verlieren.";
    }
}

function toggleMenu() {
    document.querySelector(".nav-links").classList.toggle("show");
}
function toggleGalleryAndText() {
    const galleryContainer = document.getElementById('gallery-container');
    const textContent = document.querySelector('.textfeld');
    const button = document.querySelector('.toggle-gallery-btn');

    // Überprüfen, ob die Galerie aktuell sichtbar ist
    if (galleryContainer.style.display === 'none' || galleryContainer.style.display === '') {
        // Galerie anzeigen, Text verstecken
        galleryContainer.style.display = 'flex'; // Galerie wird sichtbar
        textContent.style.display = 'none'; // Text wird ausgeblendet
        button.innerText = 'Text anzeigen';
    } else {
        // Galerie verstecken, Text anzeigen
        galleryContainer.style.display = 'none'; // Galerie wird versteckt
        textContent.style.display = 'block'; // Text wird sichtbar
        button.innerText = 'Galerie anzeigen';
    }
}


document.addEventListener("scroll", function () {
    let definition = document.querySelector(".definition1-container");
    let scrollPosition = window.scrollY;
    
    let viewportHeight = window.innerHeight; // Höhe des sichtbaren Bereichs
    let fadeStart = viewportHeight * 1.2;   // Startpunkt: 120% der Bildschirmhöhe
    let fadeEnd = viewportHeight * 1.3;     // Endpunkt: 150% der Bildschirmhöhe

    // Berechnung der Opazität basierend auf der Scroll-Position
    if (scrollPosition > fadeStart) {
        let opacity = 1 - (scrollPosition - fadeStart) / (fadeEnd - fadeStart);
        definition.style.opacity = Math.max(opacity, 0);
    } else {
        definition.style.opacity = 1;
    }
});

/* im folgenden von Paul: */ 

document.addEventListener("DOMContentLoaded", (event) => {
    gsap.registerPlugin(Flip,ScrollTrigger,Observer,ScrollToPlugin,Draggable,MotionPathPlugin,EaselPlugin,PixiPlugin,TextPlugin,RoughEase,ExpoScaleEase,SlowMo,CustomEase)
});

gsap.to('.box', {
    scrollTrigger: '.box', // start animation when ".box" enters the viewport
    x: 500
});

let tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".boxscroll", // Element to trigger the animation
      start: "top 200px", // Start when the top of `.boxscroll` hits the center of the viewport
      end: "+=5000", // Scroll for 1000px
      scrub: 2, // Smoothly scrubs the timeline as you scroll
      pin: true, // Pins the `.boxscroll` element to the viewport during the scroll
      markers: false, // (Optional) Show start and end markers for debugging
      toggleActions: "restart pause reverse pause"
    },
});

// Add animations to the timeline
tl.to(".boxscroll", {
    rotation: 720, // Rotate the box
    scale: 1, // Slightly scale up the box
    duration: 1, // Animation duration
});

gsap.timeline({ repeat: -1 })
  .to(".boxsimple", { duration: 1, x: 200, ease: "power2.inOut" }) // Nach rechts bewegen
  .to(".boxsimple", { duration: 1, y: 200, ease: "power2.inOut" }) // Nach unten bewegen
  .to(".boxsimple", { duration: 1, x: 0, ease: "power2.inOut" })   // Nach links bewegen
  .to(".boxsimple", { duration: 1, y: 0, ease: "power2.inOut" });  // Nach oben bewegen

gsap.timeline({ repeat: -1 })
  .to(".boxdelay", { stagger:1, duration: 1, x: 200, ease: "power2.inOut" }) // Nach rechts bewegen
  .to(".boxdelay", { stagger:1, duration: 1, y: 200, ease: "power2.inOut" }) // Nach unten bewegen
  .to(".boxdelay", { stagger:1, duration: 1, x: 0, ease: "power2.inOut" })   // Nach links bewegen
  .to(".boxdelay", { stagger:1, duration: 1, y: 0, ease: "power2.inOut" });  // Nach oben bewegen

// Interaktivität: Hover-Animation
const box = document.querySelector(".box");

box.addEventListener("mouseenter", () => {
  gsap.to(box, { duration: 0.3, scale: 1.3, backgroundColor: "#ffeb3b" }); // Vergrößern + Farbwechsel
});

box.addEventListener("mouseleave", () => {
  gsap.to(box, { duration: 0.3, scale: 1, backgroundColor: "#ff6f61" }); // Zurück zur Originalgröße
});