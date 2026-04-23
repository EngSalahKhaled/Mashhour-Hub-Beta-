/**
 * API Service for Mashhor Hub Admin Dashboard
 * Handles REST calls to the Node.js/Express backend.
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function request(endpoint, options = {}) {
    const token = localStorage.getItem('token'); 
    
    // Determine if we should set JSON content type
    const isFormData = options.body instanceof FormData;
    
    const headers = {
        ...options.headers,
    };

    if (!isFormData && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers,
        });

        // Handle empty responses
        const contentType = response.headers.get("content-type");
        let data = {};
        
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
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
        if (err.message === 'Failed to fetch') {
            throw new Error(`Connection to API refused. Ensure backend is running at ${API_BASE}`);
        }
        throw err;
    }
}

export const api = {
    get: (endpoint, options) => request(endpoint, { method: 'GET', ...options }),
    post: (endpoint, data, options) => request(endpoint, { 
        method: 'POST', 
        body: data instanceof FormData ? data : JSON.stringify(data),
        ...options 
    }),
    put: (endpoint, data, options) => request(endpoint, { 
        method: 'PUT', 
        body: data instanceof FormData ? data : JSON.stringify(data),
        ...options 
    }),
    patch: (endpoint, data, options) => request(endpoint, { 
        method: 'PATCH', 
        body: data instanceof FormData ? data : JSON.stringify(data),
        ...options 
    }),
    delete: (endpoint, options) => request(endpoint, { method: 'DELETE', ...options }),
};
