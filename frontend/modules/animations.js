gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

let sections = gsap.utils.toArray(".tunnel-slide");

// Set the height of the tunnel-content dynamically
let tunnelContent = document.querySelector(".tunnel-content");
tunnelContent.style.height = `${sections.length * 100}vh`;
console.log(tunnelContent.offsetHeight);
console.log(sections.length);
console.log(sections);

gsap.to(sections, {
    yPercent: -100 * (sections.length),
    ease: "none",
    scrollTrigger: {
        trigger: ".tunnel-content",
        pin: true,
        scrub: 0,
        snap: {
            snapTo: 1 / (sections.length), // Snap to the closest section
            duration: { min: 0.2, max: 0.5 }, // Minimum and maximum duration for the snap
            ease: "power1.inOut" // Easing function for the snap
        },
        end: () => "+=" + tunnelContent.offsetHeight
    }
});



gsap.fromTo("#tunnelCanvas", 
    { opacity: 1 }, 
    { 
        opacity: 0, 
        duration: 5, // Duration of the opacity transition
        ease: "power2.inOut", // Easing function for smooth transition
        scrollTrigger: {
            trigger: "#tunnel-end",
            start: "top bottom", // Start transition when top of #tunnel-end reaches bottom of viewport
            end: "top top", // End transition when top of #tunnel-end reaches top of viewport
            scrub: 1, // Smooth transition
            markers: false // For debugging
        }
    }
);

gsap.fromTo("#tunnelCanvas", 
    { opacity: 0 }, 
    { 
        opacity: 1, 
        duration: 5, // Duration of the opacity transition
        scrollTrigger: {
            trigger: "#tunnel-title",
            start: "bottom bottom", // Start transition when bottom of #tunnel-title reaches bottom of viewport
            end: "bottom top", // End transition when bottom of #tunnel-title reaches top of viewport
            scrub: true, // Smooth transition
            markers: false //
        }
    }
);

gsap.to("#pathBall", {
    scrollTrigger: {
        trigger: "#leben",
        start: "top 30%",
        end: () => `+=${document.getElementById("leben").offsetHeight - 100}px`,
        scrub: 2, // Verbindet die Animation mit dem Scrollen
    },
    motionPath: {
        path: "#path",
        align: "#path",
        alignOrigin: [0.5, 0.5]
    },
    ease: "none"
});