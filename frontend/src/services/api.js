import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api'
});

api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user'));
        const token = user?.token || user?.accessToken;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            console.warn(`No token found for request to ${config.url}. Please log in.`);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // DO NOT clear localStorage here — it causes cascade failures.
            // The token may just be expired after a server restart.
            // The user should log out and back in.
            console.error(`401 Unauthorized on ${error.config?.url}. Your session may have expired. Please log out and log back in.`);
        }
        return Promise.reject(error);
    }
);

export default api;
