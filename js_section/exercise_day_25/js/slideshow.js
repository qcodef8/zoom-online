document.querySelectorAll("[data-carousel]").forEach(initCarousel);

function initCarousel(carousel) {
    const slidesContainer = carousel.querySelector("[data-slides]");
    const originalSlides = Array.from(
        carousel.querySelectorAll("[data-slide]")
    );
    const prevBtn = carousel.querySelector("[data-prev]");
    const nextBtn = carousel.querySelector("[data-next]");
    const dots = carousel.querySelectorAll("[data-dot]");
    const slideCount = originalSlides.length;

    let currentIndex = 1;
    let isAnimating = false;
    let intervalId;

    const slideColors = [];

    originalSlides.forEach((slide, i) => {
        const color = getRandomColor();
        slide.style.background = color;
        slideColors[i] = color;
    });

    const firstClone = originalSlides[0].cloneNode(true);
    firstClone.style.background = slideColors[0];

    const lastClone = originalSlides[slideCount - 1].cloneNode(true);
    lastClone.style.background = slideColors[slideCount - 1];

    slidesContainer.appendChild(firstClone);
    slidesContainer.insertBefore(lastClone, originalSlides[0]);

    function getRandomColor() {
        const rand = () => Math.floor(Math.random() * 256);
        return `rgb(${rand()}, ${rand()}, ${rand()})`;
    }

    function updateSlide(transition = true) {
        isAnimating = transition;
        slidesContainer.style.transition = transition
            ? "transform 0.5s ease"
            : "none";
        slidesContainer.style.transform = `translateX(-${currentIndex * 100}%)`;

        const realIndex = (currentIndex - 1 + slideCount) % slideCount;
        dots.forEach((dot) => dot.classList.remove("active"));
        dots[realIndex]?.classList.add("active");
    }

    function goToSlide(index) {
        currentIndex = index;
        updateSlide(true);
    }

    function nextSlide() {
        if (isAnimating) return;
        goToSlide(currentIndex + 1);
    }

    function prevSlide() {
        if (isAnimating) return;
        goToSlide(currentIndex - 1);
    }

    function startAutoSlide() {
        clearInterval(intervalId);
        intervalId = setInterval(nextSlide, 3000);
    }

    function resetAutoSlide() {
        startAutoSlide();
    }

    nextBtn.addEventListener("click", () => {
        nextSlide();
        resetAutoSlide();
    });

    prevBtn.addEventListener("click", () => {
        prevSlide();
        resetAutoSlide();
    });

    dots.forEach((dot, i) => {
        dot.addEventListener("click", () => {
            if (isAnimating) return;
            goToSlide(i + 1);
            resetAutoSlide();
        });
    });

    slidesContainer.addEventListener("transitionend", () => {
        if (currentIndex === 0) {
            currentIndex = slideCount;
            updateSlide(false);
        } else if (currentIndex === slideCount + 1) {
            currentIndex = 1;
            updateSlide(false);
        }
        isAnimating = false;
    });

    updateSlide(false);
    startAutoSlide();
}
