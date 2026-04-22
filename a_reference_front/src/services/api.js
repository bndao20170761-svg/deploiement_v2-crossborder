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
  withCredentials: true, // Pour les cookies et les sessions
});

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = normalizeToken(localStorage.getItem("token"));
    if (token && isJwtFormatValid(token)) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs 401/403 globalement
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.error("❌ Erreur d'authentification:", {
        status: error.response.status,
        path: error.config?.url,
        data: error.response.data
      });
      
      // Nettoyer le token invalide
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Redirection vers login SEULEMENT si on n'est pas déjà sur /login
      if (window.location.pathname !== "/login") {
        console.warn("🔄 Redirection vers /login suite à erreur d'authentification");
        window.location.href = "/login";
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
  withCredentials: true,
});

// Intercepteur request pour apiSafe
apiSafe.interceptors.request.use(
  (config) => {
    const token = normalizeToken(localStorage.getItem("token"));
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
