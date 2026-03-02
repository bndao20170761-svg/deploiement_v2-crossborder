import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Button, Card, Badge, Alert } from '../components/common';
import Navbar from '../components/Navbar';

const NotificationsPage = () => {
  const { t } = useLanguage();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());
  const [isMarkingAsRead, setIsMarkingAsRead] = useState(false);

  // Récupérer les notifications
  const fetchNotifications = async () => {
    if (!isAuthenticated || !user?.id) {
      console.log('fetchNotifications - Pas authentifié ou pas d\'utilisateur:', { isAuthenticated, user });
      setError('Vous devez être connecté pour voir vos notifications');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('auth-token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      console.log('fetchNotifications - Récupération des notifications pour l\'utilisateur:', user.id);
      
      const response = await fetch(`${process.env.REACT_APP_GATEWAY_URL || 'http://localhost:8080'}/api/commentaires/notifications/${user.id}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('fetchNotifications - Notifications récupérées:', data);
      setNotifications(data);
    } catch (err) {
      console.error('Erreur lors de la récupération des notifications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Marquer un commentaire comme lu
  const activerCommentaire = async (commentaireId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_GATEWAY_URL || 'http://localhost:8080'}/api/commentaires/${commentaireId}/activer`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      // Retirer la notification de la liste
      setNotifications(prev => prev.filter(notif => notif.id !== commentaireId));
      
      // Retirer de la sélection
      setSelectedNotifications(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentaireId);
        return newSet;
      });

    } catch (err) {
      console.error('Erreur lors de l\'activation du commentaire:', err);
      setError(err.message);
    }
  };

  // Marquer plusieurs commentaires comme lus
  const marquerTousCommeLus = async () => {
    if (selectedNotifications.size === 0) return;

    setIsMarkingAsRead(true);
    try {
      const promises = Array.from(selectedNotifications).map(commentaireId => 
        activerCommentaire(commentaireId)
      );
      
      await Promise.all(promises);
      setSelectedNotifications(new Set());
    } catch (err) {
      console.error('Erreur lors du marquage en lot:', err);
      setError(err.message);
    } finally {
      setIsMarkingAsRead(false);
    }
  };

  // Ouvrir le sujet correspondant
  const ouvrirSujet = (sujetId, commentaireId) => {
    window.location.href = `/topics/${sujetId}?highlight=${commentaireId}&showUnread=true`;
  };

  // Toggle sélection d'une notification
  const toggleSelection = (commentaireId) => {
    setSelectedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentaireId)) {
        newSet.delete(commentaireId);
      } else {
        newSet.add(commentaireId);
      }
      return newSet;
    });
  };

  // Sélectionner/désélectionner tout
  const toggleSelectAll = () => {
    if (selectedNotifications.size === notifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(notifications.map(n => n.id)));
    }
  };

  // Charger les notifications au montage
  useEffect(() => {
    console.log('NotificationsPage - État auth:', { isAuthenticated, user, authLoading });
    if (isAuthenticated && user && !authLoading) {
      fetchNotifications();
    }
  }, [isAuthenticated, user, authLoading]);

  // Formatage des dates
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Il y a moins d\'une heure';
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) {
        return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
      } else {
        return date.toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    }
  };

  // Afficher un loader pendant que l'authentification se charge
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vih-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  // Vérifier l'authentification après le chargement
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Notifications
            </h1>
            <p className="text-gray-600 mb-6">
              Vous devez être connecté pour voir vos notifications.
            </p>
            <Button href="/login">
              Se connecter
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vih-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Notifications
            </h1>
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
            <Button onClick={fetchNotifications}>
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-heading mb-2">
                Notifications
              </h1>
              <p className="text-gray-600">
                {notifications.length} commentaire{notifications.length > 1 ? 's' : ''} non lu{notifications.length > 1 ? 's' : ''}
              </p>
            </div>
            
            {notifications.length > 0 && (
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={toggleSelectAll}
                  disabled={isMarkingAsRead}
                >
                  {selectedNotifications.size === notifications.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                </Button>
                
                {selectedNotifications.size > 0 && (
                  <Button
                    variant="primary"
                    onClick={marquerTousCommeLus}
                    disabled={isMarkingAsRead}
                  >
                    {isMarkingAsRead ? 'Marquage...' : `Marquer ${selectedNotifications.size} comme lu${selectedNotifications.size > 1 ? 's' : ''}`}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Liste des notifications */}
        {notifications.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔔</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune notification
              </h3>
              <p className="text-gray-500">
                Vous n'avez pas de nouveaux commentaires sur vos sujets.
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`transition-all duration-200 ${
                  selectedNotifications.has(notification.id) 
                    ? 'ring-2 ring-vih-primary bg-vih-primary/5' 
                    : 'hover:shadow-lg'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Checkbox de sélection */}
                    <input
                      type="checkbox"
                      checked={selectedNotifications.has(notification.id)}
                      onChange={() => toggleSelection(notification.id)}
                      className="mt-1 h-4 w-4 text-vih-primary focus:ring-vih-primary border-gray-300 rounded"
                    />
                    
                    {/* Contenu de la notification */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            Nouveau commentaire sur "{notification.sujet?.titreOriginal || 'Sujet'}"
                          </h3>
                          <p className="text-sm text-gray-500 mb-2">
                            Par {notification.auteur?.nom || 'Utilisateur inconnu'} • {formatDate(notification.dateCreation)}
                          </p>
                        </div>
                        
                        <Badge variant="warning" size="sm">
                          Non lu
                        </Badge>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {notification.contenu}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => ouvrirSujet(notification.sujet?.id, notification.id)}
                        >
                          Voir le sujet
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => activerCommentaire(notification.id)}
                        >
                          Marquer comme lu
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
