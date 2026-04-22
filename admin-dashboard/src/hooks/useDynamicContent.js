import { useState, useEffect } from 'react';
import { api } from '../services/api';

/**
 * Custom hook to fetch dynamic site elements from the CMS.
 * 
 * @param {string} elementId - The unique element identifier (e.g., 'hero-title')
 * @returns {Object} - { data, loading, error, content }
 */
export function useDynamicContent(elementId) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchElement = async () => {
            if (!elementId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                // Note: The public endpoint is usually unauthenticated
                // Adjust if you need a dedicated public api instance
                const res = await api.get(`/site-elements/by-element-id/${elementId}`);
                if (isMounted) {
                    setData(res.data);
                    setError(null);
                }
            } catch (err) {
                if (isMounted) {
                    console.warn(`[useDynamicContent] Failed to load element "${elementId}":`, err.message);
                    setError(err);
                    setData(null);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchElement();

        return () => {
            isMounted = false;
        };
    }, [elementId]);

    // Convenience property to just get the content string directly
    const content = data?.content || '';

    return { 
        data, 
        loading, 
        error, 
        content,
        // Helper to check if it's an image
        isImage: data?.type === 'image',
        // Helper to check if it's multiline
        isMultiline: data?.type === 'textarea' 
    };
}
