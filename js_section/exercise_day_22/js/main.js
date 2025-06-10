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
        this.submitBtn.textContent = "Create Task";
        this.submitBtn.dataset.mode = "create";
        $("#taskId").value = "";
    },

    // ? Get current values from the form
    getFormValues() {
        return {
            id: Date.now(),
            title: $("#taskTitle").value.trim(),
            description: $("#taskDescription").value.trim(),
            category: $("#taskCategory").value,
            priority: $("#taskPriority").value,
            startTime: $("#startTime").value,
            endTime: $("#endTime").value,
            dueDate: $("#taskDate").value,
            cardColor: $("#taskColor").value,
            isCompleted: false,
        };
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

        $("#taskTitle").value = task.title;
        $("#taskDescription").value = task.description;
        $("#taskCategory").value = task.category;
        $("#taskPriority").value = task.priority;
        $("#startTime").value = task.startTime;
        $("#endTime").value = task.endTime;
        $("#taskDate").value = task.dueDate;
        $("#taskColor").value = task.cardColor;
        $("#taskId").value = task.id;

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
            ? "Mark as Reopen"
            : "Mark as Complete";
        const completeIcon = task.isCompleted ? "fa-rotate-left" : "fa-check";
        const allowDelete = task.isCompleted;

        const timeDisplay =
            task.startTime && task.endTime
                ? this.formatTime(task.startTime) +
                  " - " +
                  this.formatTime(task.endTime)
                : "";

        const html = `
            <div data-id="${task.id}" class="task-card ${task.cardColor} ${
            task.isCompleted ? "completed" : ""
        }">
                <div class="task-header">
                    <h3 class="task-title">${task.title}</h3>
                    <button class="task-menu">
                        <i class="fa-solid fa-ellipsis fa-icon"></i>
                        <div class="dropdown-menu">
                            <div class="dropdown-item" id="editTask">
                                <i class="fa-solid fa-pen-to-square fa-icon"></i> Edit
                            </div>
                            <div class="dropdown-item complete" id="completeTask">
                                <i class="fa-solid ${completeIcon} fa-icon"></i> ${completeText}
                            </div>
                            <div class="dropdown-item delete" id="deleteTask" ${
                                !allowDelete ? "style='display: none'" : ""
                            }>
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
            `.task-card[data-id='${task.id}']`
        );
        this.setupTaskActions(card, task.id);
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
    setupTaskActions(cardElement, taskId) {
        const task = this.todoTasks.find((t) => t.id === taskId);
        if (!task) return;

        cardElement.querySelector("#editTask").addEventListener("click", () => {
            this.openEditModal(task);
        });

        cardElement
            .querySelector("#completeTask")
            .addEventListener("click", () => {
                task.isCompleted = !task.isCompleted;
                this.saveToStorage();
                this.reloadTasks();
            });

        const deleteBtn = cardElement.querySelector("#deleteTask");
        if (deleteBtn) {
            deleteBtn.addEventListener("click", () => {
                if (task.isCompleted) {
                    this.todoTasks = this.todoTasks.filter(
                        (t) => t.id !== taskId
                    );
                    this.saveToStorage();
                    this.reloadTasks();
                }
            });
        }
    },
};

// ? Run app
TodoApp.init();
