const BASE_API_URL = "http://localhost:3000";

const api = {
    async fetchTasks(request) {
        try {
            const res = await axios.get(`${BASE_API_URL}/tasks`, {
                params: request,
            });

            let total = res.data.length;

            if (request._page || request._limit) {
                const countParams = { ...request };
                delete countParams._page;
                delete countParams._limit;

                try {
                    const countRes = await axios.get(`${BASE_API_URL}/tasks`, {
                        params: countParams,
                    });
                    total = countRes.data.length;
                } catch (countError) {
                    console.error("Count request error:", countError);
                    total = res.data.length;
                }
            }

            return {
                data: res.data,
                total: total,
            };
        } catch (error) {
            console.error("Fetch tasks error:", error);
            throw error;
        }
    },

    async createTask(task) {
        try {
            const now = new Date().toISOString();
            const res = await axios.post(`${BASE_API_URL}/tasks`, {
                ...task,
                createdAt: now,
                updatedAt: now,
                isActive: true,
                isCompleted: false,
            });
            return res.data;
        } catch (error) {
            console.error("Create task error:", error);
            throw error;
        }
    },

    async updateTask(id, updates) {
        try {
            const now = new Date().toISOString();
            const res = await axios.patch(`${BASE_API_URL}/tasks/${id}`, {
                ...updates,
                updatedAt: now,
            });
            return res.data;
        } catch (error) {
            console.error("Update task error:", error);
            throw error;
        }
    },

    async softDeleteTask(id) {
        try {
            const now = new Date().toISOString();
            const res = await axios.patch(`${BASE_API_URL}/tasks/${id}`, {
                isActive: false,
                updatedAt: now,
            });
            return res.data;
        } catch (error) {
            console.error("Soft delete task error:", error);
            throw error;
        }
    },

    async getTaskById(id) {
        try {
            const res = await axios.get(`${BASE_API_URL}/tasks/${id}`);
            return res.data;
        } catch (error) {
            console.error("Get task by id error:", error);
            throw error;
        }
    },
};
