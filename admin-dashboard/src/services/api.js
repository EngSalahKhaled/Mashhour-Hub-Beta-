/**
 * API Service for Mashhor Hub Admin Dashboard
 * Handles REST calls to the Node.js/Express backend.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
    const token = localStorage.getItem('token'); 
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers,
        });

        // Handle empty responses (like 204 No Content or 304 Not Modified)
        const contentType = response.headers.get("content-type");
        let data = {};
        
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            // Non-JSON or empty response
            const text = await response.text();
            try {
                data = JSON.parse(text);
            } catch (e) {
                data = { message: text };
            }
        }

        if (!response.ok) {
            throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
        }

        return data;
    } catch (err) {
        console.error(`API Request Failed [${options.method || 'GET'} ${endpoint}]:`, err);
        // Ensure "Failed to fetch" is caught and re-thrown with more context if possible
        if (err.message === 'Failed to fetch') {
            throw new Error(`Connection to API refused. Ensure backend is running at ${API_BASE}`);
        }
        throw err;
    }
}

export const api = {
    get: (endpoint) => request(endpoint, { method: 'GET' }),
    post: (endpoint, data) => request(endpoint, { method: 'POST', body: JSON.stringify(data) }),
    put: (endpoint, data) => request(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
    patch: (endpoint, data) => request(endpoint, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};
