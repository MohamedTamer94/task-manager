import API from './api/http.js';

export const listTasks = async () => {
    const res = await API.get("/tasks")
    return res.data;
} 