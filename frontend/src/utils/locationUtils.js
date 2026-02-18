/**
 * Geolocation utilities for accessing user location
 */
const LocationUtils = {
    /**
     * Get user's current geolocation coordinates
     * @returns {Promise<{latitude: number, longitude: number}>} User's coordinates
     */
    getCurrentLocation: () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by this browser'));
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                (error) => {
                    reject(new Error(`Geolocation error: ${error.message}`));
                }
            );
        });
    },
};

export default LocationUtils;
