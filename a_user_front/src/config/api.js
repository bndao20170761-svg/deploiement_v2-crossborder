// Configuration centralisée des URLs API
export const API_CONFIG = {
  GATEWAY_URL: process.env.REACT_APP_GATEWAY_URL || 'http://localhost:8080',
  USER_API_URL: process.env.REACT_APP_USER_API_URL || 'http://localhost:8080/api',
  API_URL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
  FORUM_URL: process.env.REACT_APP_FORUM_URL || 'http://localhost:3001',
  FRONTEND1_URL: process.env.REACT_APP_FRONTEND1_URL || 'http://localhost:3002',
};

// Helper pour construire les URLs API
export const buildApiUrl = (endpoint) => {
  const baseUrl = API_CONFIG.GATEWAY_URL;
  return `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

export default API_CONFIG;
