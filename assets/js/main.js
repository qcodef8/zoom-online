document.querySelectorAll(".accordion-button").forEach((button) => {
    button.addEventListener("click", () => {
        const accordion = button.parentElement;
        accordion.classList.toggle("active");
    });
});
