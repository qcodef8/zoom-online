document.addEventListener("DOMContentLoaded", function () {
    const people = [
        {
            name: "Oleg Ivanov",
            image: "https://i.pinimg.com/564x/4e/69/33/4e69333daf884bf84e079d2ec9d64e0c.jpg",
        },
        {
            name: "Stefan Stefancik",
            image: "https://anhdephd.vn/wp-content/uploads/2022/04/anh-gai-xinh-hot-girl-viet-nam-480x600.jpg",
        },
        {
            name: "Endra",
            image: "https://anhdep.edu.vn/upload/2024/07/suu-tam-ngay-ve-may-50-hinh-anh-gai-xinh-viet-nam-dep-nhat-4.webp",
        },
        {
            name: "Flavio",
            image: "https://anhnail.com/wp-content/uploads/2024/10/Gai-xinh-Viet-Nam-cute-de-thuong.jpg",
        },
        {
            name: "Excel",
            image: "https://i.pinimg.com/736x/a0/9e/51/a09e5151e1ee1f86a047f33c4b3539c7.jpg",
        },
        {
            name: "Andrea",
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTclTSawjhwlPmEhOZYAjUWIgFfQzuEgXYwzg&s",
        },
        {
            name: "Samuel",
            image: "https://i.vietgiaitri.com/2023/7/12/de-xinh-nhu-co-gai-co-nua-trieu-fan-doi-non-la-viet-nam-gay-sot-mang-xa-hoi-249-6942828.jpg",
        },
        {
            name: "Fabio",
            image: "https://media.yeah1.com/files/tothucvy/2023/07/12/dia-phuong-co-nhieu-co-gai-dep-nhat-viet-nam-112354.jpg",
        },
    ];

    let likedCount = 0;
    let dislikedCount = 0;
    let currentIndex = 0;
    let isAnimating = false;
    let cards = [];

    const cardContainer = document.querySelector(".card-container");
    const emptyState = document.querySelector(".empty-state");
    const counter = document.querySelector(".counter");
    const likedCountEl = document.querySelector(".liked-count");
    const dislikedCountEl = document.querySelector(".disliked-count");
    const likeBtn = document.getElementById("like-btn");
    const dislikeBtn = document.getElementById("dislike-btn");
    const actionLeft = document.querySelector(".action-left");
    const actionRight = document.querySelector(".action-right");

    // Initialize the app
    function init() {
        counter.classList.remove("hidden");
        updateCounter();

        // Create initial cards
        for (let i = 0; i < 3; i++) {
            if (currentIndex + i < people.length) {
                createCard(people[currentIndex + i], i + 1);
            }
        }

        // Set up drag events for the top card
        if (cards.length > 0) {
            setupDrag(cards[0]);
        }
    }

    // Create a card
    function createCard(data, position) {
        const card = document.createElement("div");
        card.className = `card card-${position}`;
        card.style.backgroundImage = `url(${data.image})`;

        const cardContent = document.createElement("div");
        cardContent.className = "card-content";

        const text = document.createElement("p");
        text.className = "text-xl font-semibold mb-2";
        text.textContent = data.name;

        const number = document.createElement("p");
        number.className = "text-sm opacity-80";
        number.textContent = ``;

        cardContent.appendChild(text);
        cardContent.appendChild(number);
        card.appendChild(cardContent);
        cardContainer.appendChild(card);

        cards.push(card);
        currentIndex++;
    }

    // Set up drag events for a card
    function setupDrag(card) {
        let startX, startY, moveX, moveY;
        let isDragging = false;

        card.addEventListener("mousedown", startDrag);
        card.addEventListener("touchstart", startDrag, { passive: false });

        function startDrag(e) {
            if (isAnimating) return;

            isDragging = true;
            const clientX = e.clientX || e.touches[0].clientX;
            const clientY = e.clientY || e.touches[0].clientY;

            startX = clientX;
            startY = clientY;

            document.addEventListener("mousemove", drag);
            document.addEventListener("touchmove", drag, { passive: false });
            document.addEventListener("mouseup", endDrag);
            document.addEventListener("touchend", endDrag);
        }

        function drag(e) {
            if (!isDragging) return;

            e.preventDefault();

            const clientX = e.clientX || e.touches[0].clientX;
            const clientY = e.clientY || e.touches[0].clientY;

            moveX = clientX - startX;
            moveY = clientY - startY;

            // Calculate rotation based on drag distance
            const rotate = moveX * 0.1;

            // Apply transform
            card.style.transform = `translate(${moveX}px, ${moveY}px) rotate(${rotate}deg)`;

            // Show action icon if dragged far enough
            if (moveX > 50) {
                actionRight.classList.add("show-action");
                actionLeft.classList.remove("show-action");
            } else if (moveX < -50) {
                actionLeft.classList.add("show-action");
                actionRight.classList.remove("show-action");
            } else {
                actionLeft.classList.remove("show-action");
                actionRight.classList.remove("show-action");
            }
        }

        function endDrag() {
            if (!isDragging) return;

            isDragging = false;

            document.removeEventListener("mousemove", drag);
            document.removeEventListener("touchmove", drag);
            document.removeEventListener("mouseup", endDrag);
            document.removeEventListener("touchend", endDrag);

            actionLeft.classList.remove("show-action");
            actionRight.classList.remove("show-action");

            // Check if card was dragged far enough to trigger swipe
            const threshold = 100;

            if (moveX > threshold) {
                swipeRight();
            } else if (moveX < -threshold) {
                swipeLeft();
            } else {
                // Return to original position
                card.style.transition = "transform 0.5s";
                card.style.transform = "translateY(0) rotate(0deg)";

                setTimeout(() => {
                    card.style.transition = "";
                }, 500);
            }
        }
    }

    // Swipe right (like)
    function swipeRight() {
        if (isAnimating || cards.length === 0) return;

        isAnimating = true;
        likedCount++;
        updateCounter();

        const card = cards[0];
        card.classList.add("swipe-right");

        setTimeout(() => {
            card.remove();
            cards.shift();

            // Create new card if available
            if (currentIndex < people.length) {
                createCard(people[currentIndex], 3);
            }

            // Update positions of remaining cards
            updateCardPositions();

            // Set up drag for new top card
            if (cards.length > 0) {
                setupDrag(cards[0]);
            } else {
                showEmptyState();
            }

            isAnimating = false;
        }, 300);
    }

    // Swipe left (dislike)
    function swipeLeft() {
        if (isAnimating || cards.length === 0) return;

        isAnimating = true;
        dislikedCount++;
        updateCounter();

        const card = cards[0];
        card.classList.add("swipe-left");

        setTimeout(() => {
            card.remove();
            cards.shift();

            // Create new card if available
            if (currentIndex < people.length) {
                createCard(people[currentIndex], 3);
            }

            // Update positions of remaining cards
            updateCardPositions();

            // Set up drag for new top card
            if (cards.length > 0) {
                setupDrag(cards[0]);
            } else {
                showEmptyState();
            }

            isAnimating = false;
        }, 300);
    }

    // Update positions of cards in stack
    function updateCardPositions() {
        cards.forEach((card, index) => {
            card.className = `card card-${index + 1}`;
        });
    }

    // Show empty state when no cards left
    function showEmptyState() {
        emptyState.classList.remove("hidden");
        counter.classList.add("hidden");
    }

    // Update counter display
    function updateCounter() {
        likedCountEl.textContent = likedCount;
        dislikedCountEl.textContent = dislikedCount;
    }

    // Button event listeners
    likeBtn.addEventListener("click", () => {
        actionRight.classList.add("show-action");
        setTimeout(() => actionRight.classList.remove("show-action"), 500);
        swipeRight();
    });

    dislikeBtn.addEventListener("click", () => {
        actionLeft.classList.add("show-action");
        setTimeout(() => actionLeft.classList.remove("show-action"), 500);
        swipeLeft();
    });

    // Keyboard event listeners
    document.addEventListener("keydown", (e) => {
        if (isAnimating) return;

        if (e.key === "ArrowRight") {
            swipeRight();
        } else if (e.key === "ArrowLeft") {
            swipeLeft();
        }
    });

    init();
});
