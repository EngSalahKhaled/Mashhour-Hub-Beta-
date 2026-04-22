/**
 * Mashhor Hub Affiliate Tracker
 * Detects ?ref=ID in URL and stores it for 30 days
 */

(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');

    if (ref) {
        // Set cookie for 30 days
        const expires = new Date();
        expires.setTime(expires.getTime() + (30 * 24 * 60 * 60 * 1000));
        document.cookie = `mashhor_ref=${ref};expires=${expires.toUTCString()};path=/`;
        
        console.log(`Affiliate tracking enabled for: ${ref}`);
        
        // Remove ref from URL to keep it clean (optional)
        // window.history.replaceState({}, document.title, window.location.pathname);
    }
})();

function getAffiliateRef() {
    const name = "mashhor_ref=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}
