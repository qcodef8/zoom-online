const checkAllElement = document.getElementById("checkAll");
const listContainer = document.getElementById("checkboxList");
const summary = document.getElementById("summary");

// Tạo 10 dòng checkbox
const names = Array.from({ length: 10 }, (_, i) => `Học sinh ${i + 1}`);

names.forEach((name, index) => {
    const row = document.createElement("tr");

    const checkboxCell = document.createElement("td");
    checkboxCell.className = "checkbox-cell";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "child-checkbox";

    checkboxCell.appendChild(checkbox);

    const nameCell = document.createElement("td");
    nameCell.textContent = name;

    row.appendChild(checkboxCell);
    row.appendChild(nameCell);
    listContainer.appendChild(row);
});

const childCheckboxes = document.querySelectorAll(".child-checkbox");

function updateSummary() {
    const checkedCount = [...childCheckboxes].filter((cb) => cb.checked).length;
    summary.textContent = `Đã chọn: ${checkedCount}`;

    if (checkedCount === childCheckboxes.length) {
        checkAllElement.checked = true;
        checkAllElement.indeterminate = false;
    } else if (checkedCount === 0) {
        checkAllElement.checked = false;
        checkAllElement.indeterminate = false;
    } else {
        checkAllElement.checked = false;
        checkAllElement.indeterminate = true;
    }
}

// Khi click vào checkbox chính
checkAllElement.addEventListener("change", () => {
    childCheckboxes.forEach((cb) => (cb.checked = checkAllElement.checked));
    updateSummary();
});

// Khi click vào bất kỳ checkbox con nào
childCheckboxes.forEach((cb) => {
    cb.addEventListener("change", updateSummary);
});

// Khởi tạo
updateSummary();
