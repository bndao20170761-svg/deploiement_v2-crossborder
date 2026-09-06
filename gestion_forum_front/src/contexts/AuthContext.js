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
        
        const token = localStorage.getItem('auth-token');
        const storedUser = localStorage.getItem('user-data');
        
        console.log('🔍 AuthContext init:', {
          hasToken: !!token,
          hasStoredUser: !!storedUser,
          tokenLength: token ? token.length : 0
        });

        if (token) {
          // Nous avons un token, vérifier les données utilisateur
          let userData = null;
          
          if (storedUser) {
            try {
              userData = JSON.parse(storedUser);
              console.log('✅ Données utilisateur trouvées dans localStorage:', userData);
            } catch (e) {
              console.error('❌ Erreur parsing user-data:', e);
            }
          }

          if (userData) {
            // Gérer la structure imbriquée {user: {...}} ou directe
            const actualUser = userData.user || userData;
            setUser(actualUser);
            console.log('✅ Session restaurée:', {
              username: actualUser.username,
              profil: actualUser.profil
            });
          } else {
            // Pas de données utilisateur en cache, essayer de les récupérer du serveur
            console.log('⚠️ Token présent mais pas de données utilisateur, récupération du serveur...');
            try {
              const currentUser = await authService.getCurrentUser();
              const actualUser = currentUser.user || currentUser;
              setUser(actualUser);
              localStorage.setItem('user-data', JSON.stringify(actualUser));
              console.log('✅ Données utilisateur récupérées du serveur:', {
                username: actualUser.username,
                profil: actualUser.profil
              });
            } catch (userError) {
              console.error('❌ Impossible de récupérer les données utilisateur:', userError.message);
              // Token invalide ou expiré, nettoyer
              authService.logout();
              setUser(null);
            }
          }
        } else {
          setUser(null);
          console.log('ℹ️ Aucune session active');
        }
      } catch (error) {
        console.error('❌ Erreur vérification auth:', error);
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

      console.log('🔐 Tentative de connexion pour:', email);
      const result = await authService.login(email, password);

      if (result.success) {
        console.log('✅ Connexion réussie, token reçu');
        
        // Si l'utilisateur n'est pas inclus dans la réponse, le récupérer
        if (result.needsUserFetch && result.token) {
          console.log('⚠️ Utilisateur non inclus, récupération du serveur...');
          try {
            const currentUser = await authService.getCurrentUser();
            const actualUser = currentUser.user || currentUser;
            result.user = actualUser;
            localStorage.setItem('user-data', JSON.stringify(actualUser));
            console.log('✅ Données utilisateur récupérées:', {
              username: actualUser.username,
              profil: actualUser.profil
            });
          } catch (userError) {
            console.error('❌ Impossible de récupérer les données utilisateur:', userError);
            // Continuer sans les données utilisateur pour l'instant
          }
        }

        if (result.user) {
          // Gérer la structure imbriquée {user: {...}} ou directe
          const actualUser = result.user.user || result.user;
          setUser(actualUser);
          console.log('✅ Utilisateur connecté:', {
            username: actualUser.username,
            profil: actualUser.profil
          });
        }

        return { success: true };
      } else {
        console.error('❌ Connexion échouée:', result.message);
        return { success: false, error: result.message };
      }
    } catch (error) {
      console.error('❌ Erreur lors de la connexion:', error.message);
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
