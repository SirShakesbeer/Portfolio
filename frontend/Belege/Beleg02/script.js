document.addEventListener('DOMContentLoaded', function () {
    const myCarouselElement = document.querySelector('#carouselPhotos');
    const carousel = new bootstrap.Carousel(myCarouselElement, {
        interval: 20000,
        wrap: true,
        keyboard: true,
        pause: 'hover'
    });

    myCarouselElement.addEventListener('slide.bs.carousel', function (event) {
        console.log(`Moving to slide index: ${event.to}`);
    });

    const carouselInner = document.querySelector('#carouselPhotos .carousel-inner');
    const indicators = document.querySelector('.carousel-indicators');

    if (carouselInner && indicators) {
        indicators.innerHTML = '';
        Array.from(carouselInner.children).forEach((item, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.setAttribute('data-bs-target', '#carouselPhotos');
            button.setAttribute('data-bs-slide-to', index.toString());
            button.className = index === 0 ? 'active' : '';
            button.setAttribute('aria-label', `Slide ${index + 1}`);
            indicators.appendChild(button);
        });
    }

    const themeButton = document.getElementById('themeToggle');
    const site = document.documentElement;

    let theme = localStorage.getItem('theme') || 'light';
    site.setAttribute('data-bs-theme', theme);

    themeButton.addEventListener('click', function(event) {
        if (theme === 'light') {
            theme = 'dark';
        } else {
            theme = 'light';
        }
        site.setAttribute('data-bs-theme', theme);
        localStorage.setItem('theme', theme);
    });

});

