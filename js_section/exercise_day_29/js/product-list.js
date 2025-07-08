const API_BASE = "https://dummyjson.com/products";
const PRODUCTS_PER_PAGE = 12;
const productRow = document.querySelector(".js-product-row");
const pagination = document.querySelector(".js-pagination");

let totalProducts = 0;
let currentPage = 1;
let totalPages = 1;

function fetchProducts(page = 1) {
    const skip = (page - 1) * PRODUCTS_PER_PAGE;

    fetch(`${API_BASE}?limit=${PRODUCTS_PER_PAGE}&skip=${skip}`)
        .then((res) => res.json())
        .then((data) => {
            totalProducts = data.total;
            totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
            renderProducts(data.products);
            renderPagination(page);
        })
        .catch((err) => {
            console.error("Failed to fetch products:", err);
            productRow.innerHTML = `<p class="text-danger">Failed to load products.</p>`;
        });
}

function renderProducts(products) {
    productRow.innerHTML = products
        .map((product) => {
            const title = DOMPurify.sanitize(product.title);
            const price = DOMPurify.sanitize(product.price.toString());
            const imageUrl = DOMPurify.sanitize(
                product.thumbnail ||
                    "https://dummyimage.com/450x300/dee2e6/6c757d.jpg"
            );
            const productId = DOMPurify.sanitize(product.id.toString());

            return `
                <div class="col mb-5">
                    <div class="card h-100">
                        <img class="card-img-top" src="${imageUrl}" alt="${title}" />
                        <div class="card-body p-4">
                            <div class="text-center">
                                <h5 class="fw-bolder">${title}</h5>
                                $${price}
                            </div>
                        </div>
                        <div class="card-footer p-4 pt-0 border-top-0 bg-transparent">
                            <div class="text-center">
                                <button class="btn btn-outline-dark mt-auto" data-id="${productId}">
                                    View Detail
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        })
        .join("");

    document.querySelectorAll("button[data-id]").forEach((btn) => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.id;
            localStorage.setItem("selectedProductId", id);
            window.location.href = "product-detail.html";
        });
    });
}

function renderPagination(current) {
    currentPage = current;
    let start, end;

    if (totalPages <= 5) {
        start = 1;
        end = totalPages;
    } else if (current <= 3) {
        start = 1;
        end = 5;
    } else if (current >= totalPages - 2) {
        start = totalPages - 4;
        end = totalPages;
    } else {
        start = current - 2;
        end = current + 2;
    }

    const pageItems = Array.from({ length: end - start + 1 }, (_, i) => {
        const pageNum = start + i;
        const isActive = pageNum === current ? "active" : "";
        return `
            <li class="page-item ${isActive}" aria-current="${
            isActive ? "page" : ""
        }">
                <a class="page-link" href="#">${pageNum}</a>
            </li>
        `;
    }).join("");

    const prevDisabled = current === 1 ? "disabled" : "";
    const nextDisabled = current === totalPages ? "disabled" : "";

    pagination.innerHTML = `
        <li class="page-item ${prevDisabled}">
            <a class="page-link" href="#" tabindex="-1" aria-disabled="${
                prevDisabled === "disabled"
            }">
                Previous
            </a>
        </li>
        ${pageItems}
        <li class="page-item ${nextDisabled}">
            <a class="page-link" href="#" aria-disabled="${
                nextDisabled === "disabled"
            }">
                Next
            </a>
        </li>
    `;
}

pagination.addEventListener("click", (e) => {
    const target = e.target.closest("a.page-link");
    if (!target) return;

    e.preventDefault();
    const text = target.textContent.trim().toLowerCase();

    if (text === "previous" && currentPage > 1) {
        fetchProducts(currentPage - 1);
    } else if (text === "next" && currentPage < totalPages) {
        fetchProducts(currentPage + 1);
    } else if (!isNaN(text)) {
        const pageNum = parseInt(text);
        if (pageNum !== currentPage) {
            fetchProducts(pageNum);
        }
    }
});

fetchProducts();
