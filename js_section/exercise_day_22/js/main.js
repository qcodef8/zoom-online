const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const TodoApp = {
    todoTasks: [],
    currentTab: "all",
    currentKeyword: "",

    // ? Init app
    init() {
        this.cacheElements();
        this.bindEvents();
        this.loadFromStorage();
        this.reloadTasks();
    },

    // ? Cache commonly used DOM elements
    cacheElements() {
        this.addTaskModal = $("#addTaskModal");
        this.modalTitle = $("#modalTitle");
        this.form = $(".todo-app-form");
        this.submitBtn = $(".btn-submit");
        this.taskGrid = $(".task-grid");
        this.tabButtons = $$(".tab-button");
        this.searchInput = $(".search-input");
    },

    // ? Attach all event listeners
    bindEvents() {
        // ? Open modal on add button click
        $(".add-btn").addEventListener("click", () => {
            this.addTaskModal.classList.add("show");
        });

        // ? Close modal on close/cancel/overlay click
        this.addTaskModal.addEventListener("click", (e) => {
            const isClose = e.target.closest(".modal-close, .modal-cancel");
            const isOutside = e.target === this.addTaskModal;
            if (isClose || isOutside) {
                this.hideModal();
            }
        });

        // ? Auto-focus after open modal
        this.addTaskModal
            .querySelector(".modal")
            .addEventListener("transitionend", (e) => {
                if (
                    e.propertyName === "transform" &&
                    this.addTaskModal.classList.contains("show")
                ) {
                    const input = this.addTaskModal.querySelector("input");
                    input?.focus();
                }
            });

        // ? Handle form submission
        this.form.addEventListener("submit", (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        // ? Handle tab switching
        this.tabButtons.forEach((btn, index) => {
            btn.addEventListener("click", () => {
                this.tabButtons.forEach((b) => b.classList.remove("active"));
                btn.classList.add("active");
                this.currentTab = ["all", "active", "completed"][index];
                this.reloadTasks();
            });
        });

        // ? Search input and debounce for user can type text properly
        let debounceTimer;
        this.searchInput.addEventListener("input", () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                this.currentKeyword = this.searchInput.value
                    .trim()
                    .toLowerCase();
                this.reloadTasks();
            }, 250);
        });
    },

    // ? Close modal and reset form
    hideModal() {
        this.addTaskModal.classList.remove("show");
        this.form.reset();
        this.modalTitle.textContent = "Add New Task";
        this.submitBtn.textContent = "Create Task";
        this.submitBtn.dataset.mode = "create";
        $("#taskId").value = "";
    },

    // ? Get current values from the form
    getFormValues() {
        const formData = new FormData(this.form);
        const task = Object.fromEntries(formData.entries());

        task.id = Date.now();
        task.isCompleted = false;

        return task;
    },

    // ? Handle form on submission
    handleFormSubmit() {
        const taskId = $("#taskId").value;
        const newTask = this.getFormValues();

        if (!this.validateTask(newTask)) return;

        if (this.submitBtn.dataset.mode === "edit" && taskId) {
            const existing = this.todoTasks.find((t) => t.id == taskId);
            if (existing) {
                Object.assign(existing, newTask, {
                    id: existing.id,
                    isCompleted: existing.isCompleted,
                });
            }
        } else {
            this.todoTasks.unshift(newTask);
        }

        this.saveToStorage();
        this.hideModal();
        this.reloadTasks();
    },

    // ? Populate form with task data for editing
    openEditModal(task) {
        this.addTaskModal.classList.add("show");
        this.modalTitle.textContent = "Edit Task";

        Object.entries(task).forEach(([key, value]) => {
            const field = this.form.querySelector(`[name="${key}"]`);
            if (field) field.value = value;
        });

        this.submitBtn.textContent = "Update Task";
        this.submitBtn.dataset.mode = "edit";
    },

    // ? Validate task before submit
    validateTask(task) {
        if (!task.title) return alert("Title không được để trống."), false;
        if (!task.description)
            return alert("Description không được để trống."), false;
        if (!task.category) return alert("Làm ơn hãy chọn 1 Category."), false;
        if (task.startTime && task.endTime && task.startTime >= task.endTime)
            return alert("End time phải sau Start time."), false;
        if (task.dueDate) {
            const today = new Date(),
                due = new Date(task.dueDate);
            today.setHours(0, 0, 0, 0);
            due.setHours(0, 0, 0, 0);
            if (due < today)
                return alert("Due date phải là hôm nay hoặc sau đó."), false;
        }
        return true;
    },

    // ? Save data to local storage for reload still have data
    saveToStorage() {
        localStorage.setItem("todoTasks", JSON.stringify(this.todoTasks));
    },

    // ? Load data from local storage
    loadFromStorage() {
        const data = localStorage.getItem("todoTasks");
        if (data) {
            this.todoTasks = JSON.parse(data);
        }
    },

    // ? Re-render all visible tasks
    reloadTasks() {
        this.taskGrid.innerHTML = "";
        this.getFilteredTasks().forEach((task) => this.renderTask(task));
    },

    // ? Get tasks based on current tab and keyword
    getFilteredTasks() {
        return this.todoTasks
            .filter((task) => {
                const matchTab =
                    this.currentTab === "all" ||
                    (this.currentTab === "active" && !task.isCompleted) ||
                    (this.currentTab === "completed" && task.isCompleted);
                return (
                    matchTab &&
                    task.title.toLowerCase().includes(this.currentKeyword)
                );
            })
            .sort((a, b) => b.id - a.id);
    },

    // ? Render single task into DOM
    renderTask(task) {
        const completeText = task.isCompleted
            ? "Mark as Active"
            : "Mark as Complete";
        const completeIcon = task.isCompleted ? "fa-rotate-left" : "fa-check";

        const timeDisplay =
            task.startTime && task.endTime
                ? this.formatTime(task.startTime) +
                  " - " +
                  this.formatTime(task.endTime)
                : "";

        const html = `
            <div data-id="${task.id}"
                class="task-card 
                ${task.cardColor} 
                ${task.isCompleted ? "completed" : ""}"
            >
                <div class="task-header">
                    <h3 class="task-title">${task.title}</h3>
                    <button class="task-menu">
                        <i class="fa-solid fa-ellipsis fa-icon"></i>
                        <div class="dropdown-menu">
                            <div class="dropdown-item edit-btn">
                                <i class="fa-solid fa-pen-to-square fa-icon"></i> Edit
                            </div>
                            <div class="dropdown-item complete complete-btn">
                                <i class="fa-solid fa-icon ${completeIcon}"></i> ${completeText}
                            </div>
                            <div class="dropdown-item delete delete-btn">
                                <i class="fa-solid fa-trash fa-icon"></i> Delete
                            </div>
                        </div>
                    </button>
                </div>
                <p class="task-description">${task.description}</p>
                <div class="task-time">${timeDisplay}</div>
            </div>`;

        this.taskGrid.insertAdjacentHTML("afterbegin", html);

        const card = this.taskGrid.querySelector(
            `#taskCard[data-id='${task.id}']`
        );
        this.setupTaskActions(card);
    },

    // ? Format start/end time for display
    formatTime(timeStr) {
        const [h, m] = timeStr.split(":");
        const hour = parseInt(h, 10);
        const suffix = hour >= 12 ? "PM" : "AM";
        const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
        return `${formattedHour}:${m} ${suffix}`;
    },

    // ? Set up Edit / Complete / Delete actions for task
    setupTaskActions(cardElement) {
        const task = this.todoTasks.find(
            (t) => t.id === Number(cardElement.dataset.id)
        );
        if (!task) return;

        const editBtn = cardElement.querySelector(".edit-btn");
        const completeBtn = cardElement.querySelector(".complete-btn");
        const deleteBtn = cardElement.querySelector(".delete-btn");

        editBtn.addEventListener("click", () => {
            this.openEditModal(task);
        });

        completeBtn.addEventListener("click", () => {
            task.isCompleted = !task.isCompleted;
            this.saveToStorage();
            this.reloadTasks();
        });

        deleteBtn.addEventListener("click", () => {
            if (task.isCompleted) {
                this.todoTasks = this.todoTasks.filter((t) => t.id !== taskId);
                this.saveToStorage();
                this.reloadTasks();
            }
        });
    },
};

// ? Run app
TodoApp.init();
