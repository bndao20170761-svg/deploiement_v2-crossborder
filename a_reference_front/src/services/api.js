// src/services/api.js
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_GATEWAY_URL || "http://localhost:8080";

// Création d'une instance axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use(
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
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.error("Token invalide ou expiré, veuillez vous reconnecter.");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login"; // redirection forcée
    }
    return Promise.reject(error);
  }
);

// Exemple de fonction pour récupérer l'utilisateur courant
export const getCurrentUser = async () => {
  return api.get("/user/me");
};

export default api;
