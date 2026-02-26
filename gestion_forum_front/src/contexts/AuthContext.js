import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

// Contexte pour l'authentification
const AuthContext = createContext();

// Provider du contexte d'authentification
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier l'authentification au démarrage
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        
        if (authService.isAuthenticated()) {
          const userData = authService.getUserData();
          if (userData) {
            // Gérer la structure imbriquée {user: {...}} ou directe
            const actualUser = userData.user || userData;
            setUser(actualUser);
            console.log('Utilisateur authentifié trouvé dans localStorage:', actualUser);
          } else {
            // Essayer de récupérer les données utilisateur du serveur
            try {
              const currentUser = await authService.getCurrentUser();
              setUser(currentUser);
              localStorage.setItem('user-data', JSON.stringify(currentUser));
              console.log('Utilisateur authentifié récupéré du serveur:', currentUser);
            } catch (userError) {
              console.warn('Impossible de récupérer les données utilisateur:', userError);
              // Si on ne peut pas récupérer les données utilisateur, on considère comme non authentifié
              authService.logout();
              setUser(null);
            }
          }
        } else {
          setUser(null);
          console.log('Aucun token d\'authentification trouvé');
        }
      } catch (error) {
        console.error('Erreur vérification auth:', error);
        // Si erreur, nettoyer le localStorage
        authService.logout();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Fonction de connexion
  const login = async (email, password) => {
    try {
      setIsLoading(true);

      const result = await authService.login(email, password);

      if (result.success) {
        // Si l'utilisateur n'est pas inclus dans la réponse, le récupérer
        if (result.needsUserFetch && result.token) {
          try {
            const currentUser = await authService.getCurrentUser();
            result.user = currentUser;
            localStorage.setItem('user-data', JSON.stringify(currentUser));
          } catch (userError) {
            console.warn('Impossible de récupérer les données utilisateur:', userError);
            // Continuer sans les données utilisateur pour l'instant
          }
        }

        if (result.user) {
          // Gérer la structure imbriquée {user: {...}} ou directe
          const actualUser = result.user.user || result.user;
          setUser(actualUser);
        }

        return { success: true };
      } else {
        return { success: false, error: result.message };
      }
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction d'inscription
  const register = async (userData) => {
    try {
      setIsLoading(true);

      const result = await authService.register(userData);

      if (result.success) {
        // Si l'utilisateur n'est pas inclus dans la réponse, le récupérer
        if (result.needsUserFetch && result.token) {
          try {
            const currentUser = await authService.getCurrentUser();
            result.user = currentUser;
            localStorage.setItem('user-data', JSON.stringify(currentUser));
          } catch (userError) {
            console.warn('Impossible de récupérer les données utilisateur:', userError);
            // Continuer sans les données utilisateur pour l'instant
          }
        }

        if (result.user) {
          // Gérer la structure imbriquée {user: {...}} ou directe
          const actualUser = result.user.user || result.user;
          setUser(actualUser);
        }

        return { success: true };
      } else {
        return { success: false, error: result.message };
      }
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // Fonction de mise à jour du profil
  const updateProfile = async (updatedData) => {
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      const data = await response.json();

      // Mettre à jour les données locales
      const updatedUser = { ...user, ...data.user };
      localStorage.setItem('user-data', JSON.stringify(updatedUser));
      setUser(updatedUser);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: user?.profil === 'ADMIN',
    isModerator: user?.profil === 'MODERATEUR',
    isTranslator: user?.profil === 'TRADUCTEUR',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
