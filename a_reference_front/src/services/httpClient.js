// src/services/httpClient.js
import axios from "axios";
import { isJwtFormatValid, normalizeToken } from "../utils/tokenUtils";

// Nouveau port et nom
let API_BASE_URL = process.env.REACT_APP_GATEWAY_URL || "http://13.60.231.157:8080";
// Normaliser: s'assurer que le préfixe /api est présent
if (!API_BASE_URL.endsWith("/api")) {
  API_BASE_URL = API_BASE_URL.replace(/\/+$/, "");
  API_BASE_URL = `${API_BASE_URL}/api`;
}

// Création d'une instance axios
const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur pour ajouter le token à chaque requête
httpClient.interceptors.request.use(
  (config) => {
    const token = normalizeToken(localStorage.getItem("token"));
    if (token && isJwtFormatValid(token)) {
      config.headers["Authorization"] = `Bearer ${token}`;
      console.log(`🔐 Token ajouté à la requête ${config.method?.toUpperCase()} ${config.url}`);
    } else {
      if (localStorage.getItem("token")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      console.warn(`⚠️ Aucun token trouvé pour ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs 401/403 globalement
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("❌ 401 Unauthorized: Token invalide ou expiré");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    } else if (error.response?.status === 403) {
      console.error("❌ 403 Forbidden: Accès refusé - vérifiez vos permissions");
      console.error("URL:", error.config?.url);
      console.error("Méthode:", error.config?.method);
    }
    return Promise.reject(error);
  }
);

// Exemple de fonction pour récupérer l'utilisateur courant
export const getCurrentUser = async () => {
  return httpClient.get("/user/me");
};

export default httpClient;
