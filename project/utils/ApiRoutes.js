

const DEMO_URL = "http://localhost5000/api"
const LIVE_URL = "https://big-server-4oor.onrender.com/api"

const API_BASE_URL = DEMO_URL;

const ApiRoutes = {
    // Authentication
    AUTH: {
        SIGNUP: `${API_BASE_URL}/tenant`,
        LOGIN: `${API_BASE_URL}/tenant/login`,
        LOGOUT: `${API_BASE_URL}/logout`,
        RESET_PASSWORD: `${API_BASE_URL}/reset-password`,
        CURRENT_USER: `${API_BASE_URL}/current-tenant`,
    },
};

export default ApiRoutes;
