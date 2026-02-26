// src/services/httpClient.js
import axios from "axios";

// Nouveau port et nom
let API_BASE_URL = process.env.REACT_APP_GATEWAY_URL || "http://localhost:8080";
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
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
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
      console.error("Token invalide ou expiré, veuillez vous reconnecter.");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login"; // redirection forcée uniquement sur 401
    }
    return Promise.reject(error);
  }
);

// Exemple de fonction pour récupérer l'utilisateur courant
export const getCurrentUser = async () => {
  return httpClient.get("/user/me");
};

export default httpClient;
