import axios from 'axios';

const BACKEND_API_URL = process.env.VITE_BACKEND_URL || 'http://localhost:3001/api';

const API = axios.create({
    baseURL: BACKEND_API_URL,
    timeout: 10000, // Set a timeout
    headers: {
        'Content-Type': 'application/json',
    },
});

export default API;