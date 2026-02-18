import axios from 'axios';

const BACKEND_API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const API = axios.create({
    baseURL: BACKEND_API_URL,
    timeout: 10000, // Set a timeout
    headers: {
        'Content-Type': 'application/json',
    },
});

export default API;