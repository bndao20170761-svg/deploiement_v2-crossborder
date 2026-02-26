// Configuration centralisée des URLs API
export const API_CONFIG = {
  GATEWAY_URL: process.env.REACT_APP_GATEWAY_URL || 'http://localhost:8080',
  API_URL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
  FORUM_URL: process.env.REACT_APP_FORUM_URL || 'http://localhost:3001',
  FRONTEND2_URL: process.env.REACT_APP_FRONTEND2_URL || 'http://localhost:3003',
};

// Helper pour construire les URLs API
export const buildApiUrl = (endpoint) => {
  const baseUrl = API_CONFIG.GATEWAY_URL;
  return `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

export default API_CONFIG;
