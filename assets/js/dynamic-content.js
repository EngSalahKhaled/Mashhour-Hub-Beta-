/**
 * Dynamic Content Fetcher
 * This utility fetches dynamic CMS elements and automatically applies them to the website
 * based on the element's CSS selector or data attributes.
 */

const API_BASE_URL = window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1')
  ? 'http://localhost:5000/api' 
  : 'https://mashhour-hub-beta.vercel.app/api'; // Use the Vercel backend API

/**
 * Utility to automatically inject dynamic content into DOM elements.
 * It will fetch all elements from the database and use their "selector" field
 * to automatically replace text and images on the page!
 */
export async function initDynamicContent() {
    try {
        // Fetch ALL dynamic elements created in the dashboard
        const response = await fetch(`${API_BASE_URL}/site-elements`);
        if (!response.ok) throw new Error('Failed to fetch dynamic elements');
        
        const result = await response.json();
        const elements = result.data;

        if (!elements || elements.length === 0) return;

        // Loop through each element and apply it to the page
        elements.forEach(data => {
            if (!data.content) return;

            // Target elements either by the custom selector they saved, or by data attribute
            let targetNodes = [];
            
            if (data.selector) {
                try {
                    // Find all elements that match the CSS selector
                    targetNodes = Array.from(document.querySelectorAll(data.selector));
                } catch (err) {
                    console.warn(`[Dynamic Content] Invalid selector: ${data.selector}`);
                }
            }

            // Fallback: also search for hardcoded data attributes just in case
            if (targetNodes.length === 0 && data.elementId) {
                targetNodes = Array.from(document.querySelectorAll(`[data-dynamic="${data.elementId}"], [data-dynamic-img="${data.elementId}"]`));
            }

            // Apply content to all matching elements
            targetNodes.forEach(el => {
                // If it's an image
                if (data.type === 'image') {
                    if (el.tagName.toLowerCase() === 'img') {
                        el.src = data.content;
                    } else {
                        el.style.backgroundImage = `url('${data.content}')`;
                    }
                } 
                // If it's text
                else {
                    if (data.type === 'textarea') {
                        el.innerHTML = data.content.replace(/\n/g, '<br/>');
                    } else {
                        el.textContent = data.content;
                    }
                }
            });
        });
        
        console.log(`[Dynamic Content] Successfully applied ${elements.length} dynamic elements.`);
    } catch (error) {
        console.error(`[Dynamic Content] Auto-init error:`, error);
    }
}

// Auto-run on page load
if (typeof window !== 'undefined' && !window.__DYNAMIC_INIT__) {
    window.__DYNAMIC_INIT__ = true;
    document.addEventListener('DOMContentLoaded', () => {
        initDynamicContent();
    });
}
