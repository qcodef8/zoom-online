const API_BASE = "https://dummyjson.com/products";
const productId = localStorage.getItem("selectedProductId");

// DOM elements
const mainImage = document.querySelector("#mainImage");
const thumbnails = document.querySelector("#thumbnails");
const sku = document.querySelector("#sku");
const title = document.querySelector("#title");
const oldPrice = document.querySelector("#oldPrice");
const price = document.querySelector("#price");
const description = document.querySelector("#description");
const reviewsContainer = document.querySelector("#reviewsContainer");

if (!productId) {
    alert("No product selected");
} else {
    fetch(`${API_BASE}/${productId}`)
        .then((res) => res.json())
        .then((product) => {
            renderProductDetail(product);
            renderImages(product);
            renderReviews(product.reviews);
        })
        .catch((err) => {
            console.error("Failed to load product detail:", err);
        });
}

function renderProductDetail(product) {
    title.textContent = product.title;
    sku.textContent = `SKU: ${product.sku}`;
    description.textContent = product.description;

    const discountedPrice = (
        product.price *
        (1 - product.discountPercentage / 100)
    ).toFixed(2);

    if (product.discountPercentage > 0) {
        oldPrice.textContent = `$${product.price}`;
        price.textContent = `$${discountedPrice}`;
    } else {
        oldPrice.textContent = "";
        price.textContent = `$${product.price}`;
    }
}

function renderImages(product) {
    const images =
        product.images?.length > 0 ? product.images : [product.thumbnail];

    // Set main image
    mainImage.src = images[0];
    mainImage.classList.add("transition");

    if (images.length > 1) {
        thumbnails.innerHTML = images
            .map(
                (img, index) => `
            <img src="${img}" class="img-thumbnail border ${
                    index === 0 ? "border-dark" : ""
                }" style="width: 80px; height: auto; cursor: pointer;" data-index="${index}" />
        `
            )
            .join("");

        thumbnails.querySelectorAll("img").forEach((thumb) => {
            thumb.addEventListener("click", () => {
                mainImage.classList.remove("opacity-100");
                mainImage.classList.add("opacity-0");

                setTimeout(() => {
                    mainImage.src = thumb.src;
                    mainImage.classList.remove("opacity-0");
                    mainImage.classList.add("opacity-100");
                }, 150);

                thumbnails
                    .querySelectorAll("img")
                    .forEach((img) => img.classList.remove("border-dark"));
                thumb.classList.add("border-dark");
            });
        });
    } else {
        thumbnails.innerHTML = "";
    }
}

function renderReviews(reviews = []) {
    if (!reviews.length) {
        reviewsContainer.innerHTML = "<p>No reviews yet.</p>";
        return;
    }

    reviewsContainer.innerHTML = reviews
        .map(
            (r) => `
        <div class="col-md-6">
            <div class="card shadow-sm border-0 h-100">
                <div class="card-body">
                    <div class="d-flex justify-content-between mb-2">
                        <strong>${r.reviewerName}</strong>
                        <span class="text-warning">${"★".repeat(
                            r.rating
                        )}${"☆".repeat(5 - r.rating)}</span>
                    </div>
                    <p class="mb-1">${r.comment}</p>
                    <small class="text-muted">${new Date(
                        r.date
                    ).toLocaleDateString()}</small>
                </div>
            </div>
        </div>
    `
        )
        .join("");
}
