// src/services/api.js
import axios from "axios";
import { isJwtFormatValid, normalizeToken } from "../utils/tokenUtils";

let API_BASE_URL = process.env.REACT_APP_GATEWAY_URL || "http://16.171.10.0:8080";

// Normaliser: s'assurer que le préfixe /api est présent
if (!API_BASE_URL.endsWith("/api")) {
  API_BASE_URL = API_BASE_URL.replace(/\/+$/, "");
  API_BASE_URL = `${API_BASE_URL}/api`;
}

// Création d'une instance axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // Pas de cookies : JWT en header. withCredentials:true exige une origine CORS explicite sur la gateway.
  withCredentials: false,
});

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = normalizeToken(localStorage.getItem("token"));
    console.log("🔵 [API Request]", {
      url: config.url,
      hasToken: !!token,
      tokenValid: token ? isJwtFormatValid(token) : false
    });
    
    if (token && isJwtFormatValid(token)) {
      config.headers["Authorization"] = `Bearer ${token}`;
      console.log("✅ Token ajouté au header Authorization");
    } else {
      console.warn("⚠️ Pas de token valide stocké");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs 401/403 globalement
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;
    const isCorsRejection =
      status === 403 &&
      (data === "Invalid CORS request" ||
        (typeof data === "string" && data.toLowerCase().includes("cors")));

    if (error.response && (status === 401 || status === 403)) {
      console.error("❌ Erreur d'authentification:", {
        status: error.response.status,
        path: error.config?.url,
        data: error.response.data
      });

      // 403 « Invalid CORS request » = origine non autorisée sur la gateway, pas un JWT expiré
      if (!isCorsRejection) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      
      // Redirection vers login SEULEMENT si on n'est pas déjà sur /login
      // et SEULEMENT pour les requêtes critiques
      const isCriticalEndpoint = error.config?.url && (
        error.config.url.includes('/user-auth/') ||
        error.config.url.includes('/user/me') ||
        error.config.url.includes('/current-user')
      );
      
      if (isCriticalEndpoint && window.location.pathname !== "/login") {
        console.warn("🔄 Redirection vers /login suite à erreur d'authentification (endpoint critique)");
        setTimeout(() => {
          window.location.href = "/login";
        }, 100);
      }
    } else {
      // Autres erreurs - laisser le composant les gérer
      console.error("❌ Erreur API:", {
        status: error.response?.status,
        path: error.config?.url,
        message: error.message,
        data: error.response?.data
      });
    }
    return Promise.reject(error);
  }
);

// Exemple de fonction pour récupérer l'utilisateur courant
export const getCurrentUser = async () => {
  return api.get("/user/me");
};

// Instance API "sécurisée" sans redirection auto (pour les appels optionnels)
const apiSafe = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// Intercepteur request pour apiSafe
apiSafe.interceptors.request.use(
  (config) => {
    const token = normalizeToken(localStorage.getItem("token"));
    console.log("🟡 [API Safe Request]", {
      url: config.url,
      hasToken: !!token,
      tokenValid: token ? isJwtFormatValid(token) : false
    });
    
    if (token && isJwtFormatValid(token)) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur response pour apiSafe - NOT REDIRECTING
apiSafe.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("⚠️ Erreur API (safe):", {
      status: error.response?.status,
      path: error.config?.url,
      message: error.message
    });
    // NE PAS rediriger - laisser le composant gérer l'erreur
    return Promise.reject(error);
  }
);

export default api;
export { apiSafe };
