const textarea = document.getElementById("codeArea");
const iframe = document.getElementById("previewFrame");
const contextMenu = document.getElementById("contextMenu");
const clearBtn = document.getElementById("clearCode");

// --- Live Preview ---
function updatePreview() {
    iframe.srcdoc = textarea.value;
}

textarea.addEventListener("input", updatePreview);

// --- Prevent page reload without warning ---
window.addEventListener("beforeunload", (e) => {
    if (textarea.value.trim() !== "") {
        e.preventDefault();
        e.returnValue = ""; // Hiển thị prompt confirm reload
    }
});

// --- Custom Context Menu ---
document.addEventListener("contextmenu", (e) => {
    e.preventDefault();

    const menuWidth = contextMenu.offsetWidth;
    const menuHeight = contextMenu.offsetHeight;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = e.clientX;
    let top = e.clientY;

    // Điều chỉnh nếu quá gần cạnh phải hoặc dưới
    if (left + menuWidth > viewportWidth) {
        left = viewportWidth - menuWidth - 5;
    }

    if (top + menuHeight > viewportHeight) {
        top = viewportHeight - menuHeight - 5;
    }

    contextMenu.style.left = `${left}px`;
    contextMenu.style.top = `${top}px`;
    contextMenu.style.display = "block";
});

// --- Click elsewhere closes menu ---
document.addEventListener("click", () => {
    contextMenu.style.display = "none";
});

// --- Clear code logic ---
clearBtn.addEventListener("click", () => {
    textarea.value = "";
    updatePreview();
    contextMenu.style.display = "none";
});
