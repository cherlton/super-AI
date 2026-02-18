// Central configuration file
const API_BASE_URL = 'http://localhost:5000'; // Change this to your backend URL

export default API_BASE_URL;

// Optional: Export different URLs based on environment
export const getApiUrl = () => {
    // You can check window.location to determine environment
    if (window.location.hostname === 'localhost') {
        return 'http://localhost:5000';
    }
    // Production URL
    return 'https://api.yourproduction.com';
};