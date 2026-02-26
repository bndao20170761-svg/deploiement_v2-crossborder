// Service API utilisant fetch au lieu d'axios pour éviter les problèmes de polyfills

const AUTH_API_URL = process.env.REACT_APP_AUTH_API_URL || "http://localhost:8080/api";
const FORUM_API_URL = process.env.REACT_APP_FORUM_API_URL || "http://localhost:8080/api";

// Fonction utilitaire pour créer les headers avec le token
const getHeaders = () => {
  const token = localStorage.getItem("auth-token");
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};
// Fonction utilitaire pour gérer les erreurs
const handleResponse = async (response) => {
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      // Token invalide ou expiré
      localStorage.removeItem("auth-token");
      localStorage.removeItem("user-data");
      window.location.href = "/login";
      throw new Error("Token invalide ou expiré");
    }

    const errorData = await response.json().catch(() => ({ message: "Erreur serveur" }));
    throw new Error(errorData.message || `Erreur ${response.status}`);
  }

  const data = await response.json();

  // Adapter le format de réponse selon ce que le serveur renvoie
  if (data.token && data.user) {
    // Format actuel : { token, user }
    return data;
  } else if (data.accessToken && data.user) {
    // Format alternatif : { accessToken, user }
    return { token: data.accessToken, user: data.user };
  } else if (data.jwt && data.user) {
    // Format alternatif : { jwt, user }
    return { token: data.jwt, user: data.user };
  } else if (data.token) {
    // Seulement le token, utilisateur dans un autre appel
    return { token: data.token, user: null };
  } else if (data.id && data.username) {
    // Format direct des données utilisateur (comme /auth/me)
    return { user: data };
  } else if (data.translatedText || data.originalText) {
    // Format de réponse pour les traductions
    return data;
  } else if (data.id || data.title || data.contenu) {
    // Format de réponse pour les sujets/commentaires
    return data;
  } else if (Array.isArray(data)) {
    // Format de réponse pour les listes
    return data;
  }

  // Si aucune condition n'est remplie, retourner les données telles quelles
  return data;
};

// Service d'authentification
export const authService = {
  login: async (username, password) => {
    try {
      const response = await fetch(`${AUTH_API_URL}/auth/login`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ username, password }),
      });

      const data = await handleResponse(response);

      const token = data.token || data.accessToken || data.jwt;
      const user = data.user || data.utilisateur;

      if (!token) {
        throw new Error("Token manquant dans la réponse du serveur");
      }

      localStorage.setItem("auth-token", token);

      if (user) {
        localStorage.setItem("user-data", JSON.stringify(user));
      }

      return {
        success: true,
        user: user || null,
        token,
        needsUserFetch: !user
      };
    } catch (error) {
      console.error("Erreur de connexion:", error.message);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await fetch(`${AUTH_API_URL}/auth/register`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(userData),
      });

      const data = await handleResponse(response);

      const token = data.token || data.accessToken || data.jwt;
      const user = data.user || data.utilisateur;

      if (!token) {
        throw new Error("Token manquant dans la réponse du serveur");
      }

      localStorage.setItem("auth-token", token);

      if (user) {
        localStorage.setItem("user-data", JSON.stringify(user));
      }

      return {
        success: true,
        user: user || null,
        token,
        needsUserFetch: !user
      };
    } catch (error) {
      console.error("Erreur d'inscription:", error.message);
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await fetch(`${AUTH_API_URL}/auth/me`, {
        method: "GET",
        headers: getHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error("Erreur récupération utilisateur:", error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("auth-token");
    localStorage.removeItem("user-data");
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("auth-token");
  },

  getUserData: () => {
    try {
      const userData = localStorage.getItem("user-data");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Erreur lecture données utilisateur:", error);
      return null;
    }
  }
};

// Service des sujets
export const topicsService = {
  // Récupérer tous les sujets avec pagination
  getAllTopics: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = `${FORUM_API_URL}/sujets${queryParams ? `?${queryParams}` : ''}`;

      const response = await fetch(url, {
        method: "GET",
        headers: getHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error("Erreur récupération sujets:", error);
      throw error;
    }
  },

  // Récupérer un sujet par ID (avec authentification)
  getTopicById: async (id) => {
    try {
      const response = await fetch(`${FORUM_API_URL}/sujets/${id}`, {
        method: "GET",
        headers: getHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error("Erreur récupération sujet:", error);
      throw error;
    }
  },

  // Lire un sujet (publique, sans authentification)
  readTopic: async (id) => {
    try {
      const response = await fetch(`${FORUM_API_URL}/sujets/${id}/lire`, {
        method: "GET",
        headers: getHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error("Erreur lecture publique sujet:", error);
      throw error;
    }
  },

  // Créer un nouveau sujet
  createTopic: async (topicData) => {
    try {
      const response = await fetch(`${FORUM_API_URL}/sujets`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(topicData),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error("Erreur création sujet:", error);
      throw error;
    }
  },

  // Mettre à jour un sujet par ID
  updateTopic: async (id, topicData) => {
    try {
      const response = await fetch(`${FORUM_API_URL}/sujets/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(topicData),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error("Erreur mise à jour sujet:", error);
      throw error;
    }
  },

  // Mettre à jour un sujet par ID utilisateur
  updateTopicByUserId: async (userId, topicData) => {
    try {
      const response = await fetch(`${FORUM_API_URL}/sujets/user/${userId}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(topicData),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error("Erreur mise à jour sujet par utilisateur:", error);
      throw error;
    }
  },

  // Supprimer un sujet
  deleteTopic: async (id) => {
    try {
      const response = await fetch(`${FORUM_API_URL}/sujets/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error("Erreur suppression sujet:", error);
      throw error;
    }
  },

  // Récupérer les sujets par section
  getTopicsBySection: async (sectionId) => {
    try {
      const response = await fetch(`${FORUM_API_URL}/sujets/section/${sectionId}`, {
        method: "GET",
        headers: getHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error("Erreur récupération sujets par section:", error);
      throw error;
    }
  },

  // Récupérer les sujets par auteur
  getTopicsByAuthor: async (authorId) => {
    try {
      const response = await fetch(`${FORUM_API_URL}/sujets/auteur/${authorId}`, {
        method: "GET",
        headers: getHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error("Erreur récupération sujets par auteur:", error);
      throw error;
    }
  },

  // Récupérer les sujets récents
  getRecentTopics: async (limit = 5) => {
    try {
      const response = await fetch(`${FORUM_API_URL}/sujets/recents?limit=${limit}`, {
        method: "GET",
        headers: getHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error("Erreur récupération sujets récents:", error);
      throw error;
    }
  },

  // Récupérer les sujets actifs
  getActiveTopics: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = `${FORUM_API_URL}/sujets/actifs${queryParams ? `?${queryParams}` : ''}`;

      const response = await fetch(url, {
        method: "GET",
        headers: getHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error("Erreur récupération sujets actifs:", error);
      throw error;
    }
  },

  // Récupérer les sujets inactifs
  getInactiveTopics: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = `${FORUM_API_URL}/sujets/inactifs${queryParams ? `?${queryParams}` : ''}`;

      const response = await fetch(url, {
        method: "GET",
        headers: getHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error("Erreur récupération sujets inactifs:", error);
      throw error;
    }
  },

  // Activer un sujet
  activateTopic: async (id) => {
    try {
      const response = await fetch(`${FORUM_API_URL}/sujets/${id}/activer`, {
        method: "PUT",
        headers: getHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error("Erreur activation sujet:", error);
      throw error;
    }
  },

  // Désactiver un sujet
  deactivateTopic: async (id) => {
    try {
      const response = await fetch(`${FORUM_API_URL}/sujets/${id}/desactiver`, {
        method: "PUT",
        headers: getHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error("Erreur désactivation sujet:", error);
      throw error;
    }
  }
};

// Service des commentaires
export const commentsService = {
  getCommentsByTopic: async (topicId, params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = `${FORUM_API_URL}/commentaires/sujet/${topicId}${queryParams ? `?${queryParams}` : ''}`;

      const response = await fetch(url, {
        method: "GET",
        headers: getHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error("Erreur récupération commentaires:", error);
      throw error;
    }
  },

  createComment: async (commentData) => {
    try {
      const response = await fetch(`${FORUM_API_URL}/commentaires`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(commentData),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error("Erreur création commentaire:", error);
      throw error;
    }
  },

  updateComment: async (id, commentData) => {
    try {
      const response = await fetch(`${FORUM_API_URL}/commentaires/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(commentData),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error("Erreur mise à jour commentaire:", error);
      throw error;
    }
  },

  deleteComment: async (id) => {
    try {
      const response = await fetch(`${FORUM_API_URL}/commentaires/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error("Erreur suppression commentaire:", error);
      throw error;
    }
  }
};

// Service des sections
export const sectionsService = {
  // Récupérer toutes les sections
  getAllSections: async () => {
    try {
      const response = await fetch(`${FORUM_API_URL}/sujets/sections`, {
        method: "GET",
        headers: getHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error("Erreur récupération sections:", error);
      throw error;
    }
  }
};

// Service de traduction
export const translationService = {
  translateText: async (text, fromLang, toLang, metadata = {}) => {
    try {
      const response = await fetch(`${FORUM_API_URL}/translations/translate`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ 
          text, 
          sourceLanguage: fromLang, 
          targetLanguage: toLang,
          ...metadata
        }),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error("Erreur traduction:", error);
      throw error;
    }
  },

  requestHumanTranslation: async (requestData) => {
    try {
      const response = await fetch(`${FORUM_API_URL}/translation/request`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(requestData),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error("Erreur demande traduction humaine:", error);
      throw error;
    }
  },

  getTranslationRequests: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = `${FORUM_API_URL}/translation/requests${queryParams ? `?${queryParams}` : ''}`;

      const response = await fetch(url, {
        method: "GET",
        headers: getHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error("Erreur récupération demandes traduction:", error);
      throw error;
    }
  }
};

// Export par défaut pour compatibilité
export default {
  authService,
  topicsService,
  commentsService,
  sectionsService,
  translationService
};
