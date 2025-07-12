const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const TodoApp = {
    currentTab: "all",
    currentKeyword: "",
    currentPage: 1,
    perPage: 12,
    totalTasks: 0,

    // ? Init app
    init() {
        this.cacheElements();
        this.bindEvents();
        this.reloadTasks();
    },

    // ? Cache commonly used DOM elements
    cacheElements() {
        this.taskModal = $("#taskModal");
        this.confirmDeleteModal = $("#confirmDeleteModal");
        this.modalTitle = $("#modalTitle");
        this.form = $(".todo-app-form");
        this.submitBtn = $(".btn-submit");
        this.taskGrid = $(".task-grid");
        this.tabButtons = $$(".tab-button");
        this.searchInput = $(".search-input");
        this.currentPageReport = $(".current-page-report");
        this.pagination = $(".pagination");
        this.pageNumbers = $(".page-numbers");
        this.prevBtn = $(".pagination-prev-btn");
        this.nextBtn = $(".pagination-next-btn");
    },

    // ? Attach all event listeners
    bindEvents() {
        $(".add-btn").addEventListener("click", () => {
            this.taskModal.classList.add("show");
        });

        this.taskModal.addEventListener("click", (e) => {
            const isClose = e.target.closest(".modal-close, .modal-cancel");
            const isOutside = e.target === this.taskModal;
            if (isClose || isOutside) this.hideModal();
        });

        this.taskModal
            .querySelector(".modal")
            .addEventListener("transitionend", (e) => {
                if (
                    e.propertyName === "transform" &&
                    this.taskModal.classList.contains("show")
                ) {
                    this.taskModal.querySelector("input")?.focus();
                }
            });

        this.form.addEventListener("submit", async (e) => {
            e.preventDefault();
            await this.handleFormSubmit();
        });

        this.tabButtons.forEach((btn, index) => {
            btn.addEventListener("click", () => {
                this.tabButtons.forEach((b) => b.classList.remove("active"));
                btn.classList.add("active");
                this.currentTab = ["all", "active", "completed"][index];
                this.currentPage = 1;
                this.reloadTasks();
            });
        });

        let debounceTimer;
        this.searchInput.addEventListener("input", () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                this.currentKeyword = this.searchInput.value
                    .trim()
                    .toLowerCase();
                this.currentPage = 1;
                this.reloadTasks();
            }, 250);
        });

        this.pagination.addEventListener("click", (e) => {
            const page = e.target.dataset.page;
            const totalPages = Math.ceil(this.totalTasks / this.perPage);

            if (page === "prev" && this.currentPage > 1) {
                this.currentPage--;
                this.reloadTasks();
            } else if (page === "next" && this.currentPage < totalPages) {
                this.currentPage++;
                this.reloadTasks();
            } else if (!isNaN(+page)) {
                this.currentPage = +page;
                this.reloadTasks();
            }
        });
    },

    // ? Close modal and reset form
    hideModal() {
        this.taskModal.classList.remove("show");
        this.form.reset();
        this.modalTitle.textContent = "Add New Task";
        this.submitBtn.textContent = "Create Task";
        this.submitBtn.dataset.mode = "create";
    },

    // ? Get current values from the form
    getFormValues() {
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());
        return data;
    },

    // ? Handle form on submission
    async handleFormSubmit() {
        const newTask = this.getFormValues();
        if (!this.validateTask(newTask)) return;

        try {
            if (this.submitBtn.dataset.mode === "edit" && this.editingTaskId) {
                await api.updateTask(this.editingTaskId, newTask);
                this.showToast("Updated", "Task has been updated successfully");
            } else {
                await api.createTask(newTask);
                this.showToast(
                    "Created",
                    `New task named ${newTask.title} created successfully`
                );
            }
            this.hideModal();
            this.editingTaskId = null;
            await this.reloadTasks();
        } catch (error) {
            this.showToast(
                "Error",
                "Something went wrong. Please try again",
                "error"
            );
        }
    },

    async reloadTasks() {
        try {
            const request = {
                isActive: true,
                _page: this.currentPage,
                _limit: this.perPage,
                _sort: "createdAt",
                _order: "desc",
            };

            if (this.currentTab === "active") request.isCompleted = false;
            else if (this.currentTab === "completed")
                request.isCompleted = true;

            if (this.currentKeyword) {
                request.title_like = this.currentKeyword;
            }

            const { data, total } = await api.fetchTasks(request);
            this.totalTasks = total;

            // Clear task grid safely
            while (this.taskGrid.firstChild) {
                this.taskGrid.removeChild(this.taskGrid.firstChild);
            }

            data.forEach((task) => this.renderTask(task));
            this.renderPagination();
        } catch (err) {
            this.showToast(
                "Error",
                "Could not fetch tasks. Please refresh the page",
                "error"
            );
        }
    },

    renderPagination() {
        const totalPages = Math.max(
            1,
            Math.ceil(this.totalTasks / this.perPage)
        );

        // Delete all old button avoid double pagination button
        this.pageNumbers.innerHTML = "";

        if (this.totalTasks === 0) {
            this.pagination.style.display = "none";
            this.currentPageReport.textContent =
                "Không có nhiệm vụ nào để hiển thị";
            return;
        }

        // Display pagination again if no task then add a new one
        this.pagination.style.display = "flex";

        // Calculate start and end of current page for report
        const start = (this.currentPage - 1) * this.perPage + 1;
        const end = Math.min(this.currentPage * this.perPage, this.totalTasks);
        this.currentPageReport.textContent = `Hiển thị ${start} - ${end} trong tổng ${this.totalTasks} nhiệm vụ`;

        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement("button");
            btn.textContent = i;
            btn.dataset.page = i;
            btn.classList.add("page-btn");
            if (i === this.currentPage) btn.classList.add("active");
            this.pageNumbers.appendChild(btn);
        }

        this.prevBtn.classList.toggle("disabled", this.currentPage === 1);
        this.nextBtn.classList.toggle(
            "disabled",
            this.currentPage === totalPages
        );
    },

    // ? Render single task into DOM (secured)
    renderTask(task) {
        const card = document.createElement("div");
        card.className = `task-card ${this.getAllowedColor(task.cardColor)} ${
            task.isCompleted ? "completed" : ""
        }`;
        card.dataset.id = task.id;

        card.innerHTML = `
            <div class="task-header">
                <h3 class="task-title">${this.escapeHTML(task.title)}</h3>
                <button class="task-menu">
                    <i class="fa-solid fa-ellipsis fa-icon"></i>
                    <div class="dropdown-menu">
                        <div class="dropdown-item edit-btn"><i class="fa-solid fa-pen-to-square fa-icon"></i> Edit</div>
                        <div class="dropdown-item complete complete-btn">
                            <i class="fa-solid fa-icon ${
                                task.isCompleted ? "fa-rotate-left" : "fa-check"
                            }"></i>
                            ${
                                task.isCompleted
                                    ? "Mark as Active"
                                    : "Mark as Complete"
                            }
                        </div>
                        <div class="dropdown-item delete delete-btn"><i class="fa-solid fa-trash fa-icon"></i> Delete</div>
                    </div>
                </button>
            </div>
            <p class="task-description">${this.escapeHTML(task.description)}</p>
            <div class="task-time">${
                task.startTime && task.endTime
                    ? `${this.formatTime(task.startTime)} - ${this.formatTime(
                          task.endTime
                      )}`
                    : ""
            }</div>
        `;

        this.taskGrid.appendChild(card);
        this.setupTaskActions(card, task);
    },

    // ? Set up Edit / Complete / Delete actions for task
    setupTaskActions(card, task) {
        card.querySelector(".edit-btn").addEventListener("click", () => {
            this.openEditModal(task);
        });

        card.querySelector(".complete-btn").addEventListener(
            "click",
            async () => {
                try {
                    await api.updateTask(task.id, {
                        isCompleted: !task.isCompleted,
                    });
                    this.showToast(
                        "Status Updated",
                        `Marked as ${
                            !task.isCompleted ? "completed" : "active"
                        }`
                    );
                    await this.reloadTasks();
                } catch (error) {
                    this.showToast(
                        "Error",
                        "Unable to update task status",
                        "error"
                    );
                }
            }
        );

        card.querySelector(".delete-btn").addEventListener("click", () => {
            this.confirmDeleteModal.classList.add("show");
            const cancelBtn =
                this.confirmDeleteModal.querySelector(".modal-cancel");
            const confirmBtn =
                this.confirmDeleteModal.querySelector(".confirm-delete");

            cancelBtn.removeEventListener("click", this.handleCancelDelete);
            confirmBtn.removeEventListener("click", this.handleConfirmDelete);

            cancelBtn.addEventListener(
                "click",
                this.handleCancelDelete.bind(this)
            );
            confirmBtn.addEventListener("click", () =>
                this.handleConfirmDelete(task.id)
            );
        });
    },

    openEditModal(task) {
        this.taskModal.classList.add("show");
        this.modalTitle.textContent = "Edit Task";
        Object.entries(task).forEach(([key, value]) => {
            const field = this.form.querySelector(`[name="${key}"]`);
            if (field) field.value = value;
        });
        this.submitBtn.textContent = "Update Task";
        this.submitBtn.dataset.mode = "edit";
        this.editingTaskId = task.id;
    },

    validateTask(task) {
        if (!task.title) {
            this.showToast(
                "Missing Title",
                "Please enter a task title",
                "warning"
            );
            return false;
        }
        if (!task.description) {
            this.showToast(
                "Missing Description",
                "Please enter a description",
                "warning"
            );
            return false;
        }
        if (!task.category) {
            this.showToast(
                "Missing Category",
                "Please select a task category",
                "warning"
            );
            return false;
        }
        if (task.startTime && task.endTime && task.startTime >= task.endTime) {
            this.showToast(
                "Invalid Time",
                "End time must be later than start time",
                "warning"
            );
            return false;
        }
        if (task.dueDate) {
            const today = new Date(),
                due = new Date(task.dueDate);
            today.setHours(0, 0, 0, 0);
            due.setHours(0, 0, 0, 0);
            if (due < today) {
                this.showToast(
                    "Invalid Due Date",
                    "Due date cannot be in the past",
                    "warning"
                );
                return false;
            }
        }
        return true;
    },

    escapeHTML(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    },

    getAllowedColor(color) {
        const allowed = ["blue", "purple", "yellow", "pink", "green"];
        return allowed.includes(color) ? color : "blue";
    },

    formatTime(timeStr) {
        const [h, m] = timeStr.split(":");
        const hour = parseInt(h, 10);
        const suffix = hour >= 12 ? "PM" : "AM";
        const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
        return `${formattedHour}:${m} ${suffix}`;
    },

    showToast(title, message, type = "success") {
        toast({ title, message, type, duration: 5000 });
    },

    // ? Handle cancel delete
    handleCancelDelete() {
        this.confirmDeleteModal.classList.remove("show");
    },

    // ? Handle confirm delete
    async handleConfirmDelete(taskId) {
        try {
            await api.softDeleteTask(taskId);
            this.confirmDeleteModal.classList.remove("show");
            this.showToast(
                "Task Deleted",
                "The task has been removed from your list"
            );
            await this.reloadTasks();
        } catch (error) {
            this.showToast(
                "Error",
                "Unable to delete task. Please try again",
                "error"
            );
        }
    },
};
