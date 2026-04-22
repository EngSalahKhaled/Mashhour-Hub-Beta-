/**
 * Mashhor Hub API Fetcher & Dynamic Sync
 * Handles fetching data from the Firebase API with fallback to static content.
 */

const MashhorAPI = {
    // API_BASE: 'https://mashhor-hub.com/api', // For production
    API_BASE: window.location.origin + '/api', // Works for Vercel/Local

    async fetchCollection(collection, language) {
        try {
            const url = `${this.API_BASE}/${collection}${language ? '?language=' + language : ''}`;
            const response = await fetch(url);
            const result = await response.json();
            
            if (result.success && result.data && result.data.length > 0) {
                console.log(`[MashhorAPI] Live sync active for ${collection} (${language})`);
                return result.data;
            }
            return null;
        } catch (error) {
            console.warn(`[MashhorAPI] Connection to API failed, using static fallback for ${collection}.`);
            return null;
        }
    },

    /**
     * Replaces local static data with live data if available.
     * @param {string} collection - API route name
     * @param {string} language - 'en' or 'ar'
     * @param {string} globalVarName - The name of the window variable to override
     */
    async sync(collection, language, globalVarName) {
        const liveData = await this.fetchCollection(collection, language);
        if (liveData) {
            window[globalVarName] = liveData;
            // Dispatch event for components listening for data ready
            window.dispatchEvent(new CustomEvent('mashhor-data-synced', { 
                detail: { collection, globalVarName } 
            }));
            return true;
        }
        return false;
    }
};

window.MashhorAPI = MashhorAPI;
