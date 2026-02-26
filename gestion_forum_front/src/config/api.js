// Configuration centralisée des URLs API
export const API_CONFIG = {
  FORUM_API_URL: process.env.REACT_APP_FORUM_API_URL || 'http://localhost:8080/api',
  AUTH_API_URL: process.env.REACT_APP_AUTH_API_URL || 'http://localhost:8080/api',
  GATEWAY_URL: process.env.REACT_APP_GATEWAY_URL || 'http://localhost:8080',
  FRONTEND1_URL: process.env.REACT_APP_FRONTEND1_URL || 'http://localhost:3002',
  FRONTEND2_URL: process.env.REACT_APP_FRONTEND2_URL || 'http://localhost:3003',
};

// Helper pour construire les URLs
export const buildApiUrl = (endpoint) => {
  const baseUrl = API_CONFIG.FORUM_API_URL.replace(/\/api$/, '');
  return `${baseUrl}/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

export default API_CONFIG;
