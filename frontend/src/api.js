export const API_BASE_URL = import.meta.env.VITE_API_URL || "https://kharcha-4u5y.onrender.com/api";

const originalFetch = window.fetch;

export const setupFetchInterceptor = () => {
    window.fetch = async (url, options = {}) => {
        // Enforce credentials and interception only for requests hitting the spendora backend API
        if (typeof url === 'string' && url.startsWith(API_BASE_URL)) {
            options.credentials = "include";

            let response = await originalFetch(url, options);

            // Pass through if the request succeeds (not 401), or if it's the refresh route itself to prevent loops
            if (response.status !== 401 || url.includes("/auth/refresh") || options._retry) {
                return response;
            }

            // At this point, we've encountered a 401 Unauthorized for a standard route. Handle refresh logic securely.
            options._retry = true;
            try {
                const refreshRes = await originalFetch(`${API_BASE_URL}/auth/refresh`, {
                    method: "POST",
                    credentials: "include"
                });

                if (refreshRes.ok) {
                    // Success! The token was refreshed gracefully in the background. Re-execute the original failing UI request seamlessly.
                    return originalFetch(url, options);
                } else {
                    throw new Error("Refresh token expired");
                }
            } catch (err) {
                // Completely unauthenticated. Kick the user to the landing page and trigger the login modal!
                if (window.location.pathname !== "/") {
                    window.location.href = "/?login=true"; 
                }
                return response; // Return the 401 upstream safely so UI handles the failed state correctly
            }
        }

        // Fallback for native external fetching (Analytics, Google Fonts, etc.)
        return originalFetch(url, options);
    };
};
