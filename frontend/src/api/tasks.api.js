import API from '../api/http.js';

export const listTasks = async ({ page, limit, q, priority, status, to, from }) => {
    const params = { page, limit, q, priority, status, to, from };

    const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value !== undefined)
    );

    const res = await API.get('/tasks', { params: filteredParams });
    return res.data;
};

export const deleteTask = async (id) => {
    const res = await API.delete(`/tasks/${id}`)
    return res.data;
}

export const updateTask = async (id, updates) => {
    const res = await API.patch(`/tasks/${id}`, updates)
    return res.data;
}

export const createTask = async (params) => {
     const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value !== undefined && value?.length > 0)
    );
    const res = await API.post(`/tasks/`, filteredParams)
    return res.data;
}