/**
 * Dynamic Content Fetcher
 * Use this utility to fetch and render dynamic CMS elements on the public frontend.
 */

const API_BASE_URL = window.location.hostname.includes('localhost') 
  ? 'http://localhost:5000/api' 
  : 'https://mashhor-hub.com/api'; // Adjust to your production API URL

/**
 * Fetches a single dynamic site element from the backend.
 * 
 * @param {string} elementId - The unique string identifier (e.g., 'hero-title')
 * @returns {Promise<Object|null>} - The element data { elementId, type, content, description } or null if failed
 */
export async function fetchDynamicElement(elementId) {
    try {
        const response = await fetch(`${API_BASE_URL}/site-elements/by-element-id/${elementId}`);
        if (!response.ok) {
            console.warn(`[Dynamic Content] Element "${elementId}" not found or failed to load.`);
            return null;
        }
        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error(`[Dynamic Content] Error fetching element "${elementId}":`, error);
        return null;
    }
}

/**
 * Utility to automatically inject dynamic content into DOM elements.
 * Usage:
 * <h1 data-dynamic="hero-title">Loading...</h1>
 * <img data-dynamic-img="about-image" src="skeleton.jpg" />
 * 
 * Then run: initDynamicContent()
 */
export async function initDynamicContent() {
    // Handle Text/HTML elements
    const textElements = document.querySelectorAll('[data-dynamic]');
    textElements.forEach(async (el) => {
        const elementId = el.getAttribute('data-dynamic');
        
        // Add skeleton loading class if you have one
        el.classList.add('skeleton-loading');

        const data = await fetchDynamicElement(elementId);
        
        el.classList.remove('skeleton-loading');
        
        if (data && data.content) {
            // Check if textarea (multi-line) or text
            if (data.type === 'textarea') {
                el.innerHTML = data.content.replace(/\n/g, '<br/>');
            } else {
                el.textContent = data.content;
            }
        }
    });

    // Handle Image elements
    const imgElements = document.querySelectorAll('[data-dynamic-img]');
    imgElements.forEach(async (el) => {
        const elementId = el.getAttribute('data-dynamic-img');
        
        el.style.opacity = '0.5'; // Simple loading state
        
        const data = await fetchDynamicElement(elementId);
        
        el.style.opacity = '1';
        
        if (data && data.type === 'image' && data.content) {
            if (el.tagName.toLowerCase() === 'img') {
                el.src = data.content;
            } else {
                // If it's a div, use as background image
                el.style.backgroundImage = `url('${data.content}')`;
            }
        }
    });
}

// Auto-init if not running as a module (optional)
if (typeof window !== 'undefined' && !window.__DYNAMIC_INIT__) {
    window.__DYNAMIC_INIT__ = true;
    document.addEventListener('DOMContentLoaded', () => {
        // Uncomment to auto-run on page load
        // initDynamicContent();
    });
}
