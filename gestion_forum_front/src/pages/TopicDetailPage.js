import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Button, Card, Badge, Alert } from '../components/common';
import Navbar from '../components/Navbar';
import CommentList from '../components/CommentList';
import CommentModal from '../components/CommentModal';

const TopicDetailPage = () => {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [sujet, setSujet] = useState(null);
  const [commentaires, setCommentaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentModal, setCommentModal] = useState({ isOpen: false, sujetId: null });
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [highlightedComment, setHighlightedComment] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  // Récupérer l'ID du sujet depuis l'URL
  const getSujetIdFromUrl = () => {
    const path = window.location.pathname;
    const match = path.match(/\/topics\/(.+)/);
    
    if (!match) return null;
    
    const extractedId = match[1];
    
    // Vérifier si c'est un ID valide (pas une route spéciale)
    const specialRoutes = ['create', 'my-topics', 'recent', 'popular', 'active'];
    if (specialRoutes.includes(extractedId)) {
      return null;
    }
    
    // Vérifier si c'est un ID MongoDB valide (24 caractères hexadécimaux)
    if (/^[a-f\d]{24}$/i.test(extractedId)) {
      return extractedId;
    }
    
    // Vérifier si c'est un UUID ou autre format d'ID valide
    if (/^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i.test(extractedId)) {
      return extractedId;
    }
    
    // Vérifier si c'est un ID numérique
    if (/^\d+$/.test(extractedId)) {
      return extractedId;
    }
    
    // Si aucun pattern ne correspond, considérer comme invalide
    console.warn('ID de sujet invalide extrait de l\'URL:', extractedId);
    return null;
  };

  // Récupérer les paramètres de l'URL
  const getUrlParams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      highlight: urlParams.get('highlight'),
      showUnread: urlParams.get('showUnread') === 'true'
    };
  };

  // Récupérer les détails du sujet
  const fetchSujet = async (sujetId) => {
    try {
      // Utiliser l'endpoint de lecture publique qui active automatiquement les commentaires
      const response = await fetch(`${process.env.REACT_APP_GATEWAY_URL || 'http://localhost:8080'}/api/sujets/${sujetId}/lire`);
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setSujet(data);
      
      // Vérifier si l'utilisateur est le propriétaire du sujet
      if (isAuthenticated && user && data.auteur) {
        const userId = user.id.toString();
        const auteurId = data.auteur.id ? data.auteur.id.toString() : data.auteur.toString();
        setIsOwner(userId === auteurId);
      }
      
      return data;
    } catch (err) {
      console.error('Erreur lors de la récupération du sujet:', err);
      setError(err.message);
      return null;
    }
  };

  // Récupérer les commentaires du sujet
  const fetchCommentaires = async (sujetId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_GATEWAY_URL || 'http://localhost:8080'}/api/commentaires/sujet/${sujetId}/all`);
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setCommentaires(data);
      return data;
    } catch (err) {
      console.error('Erreur lors de la récupération des commentaires:', err);
      return [];
    }
  };

  // Charger les données initiales
  useEffect(() => {
    const loadData = async () => {
      const sujetId = getSujetIdFromUrl();
      if (!sujetId) {
        setError('ID du sujet invalide ou route non reconnue');
        setLoading(false);
        return;
      }

      setLoading(true);
      
      // Récupérer les paramètres URL
      const { highlight, showUnread } = getUrlParams();
      if (highlight) {
        setHighlightedComment(highlight);
      }
      if (showUnread) {
        setShowUnreadOnly(true);
      }

      // Charger le sujet et les commentaires
      const sujetData = await fetchSujet(sujetId);
      if (sujetData) {
        await fetchCommentaires(sujetId);
      }
      
      setLoading(false);
    };

    loadData();
  }, [isAuthenticated, user]);

  // Filtrer les commentaires selon les critères
  const getFilteredCommentaires = () => {
    let filtered = commentaires;

    // Si l'utilisateur est le propriétaire et veut voir seulement les non lus
    if (isOwner && showUnreadOnly) {
      filtered = commentaires.filter(commentaire => commentaire.statut === 'DESACTIF');
    }

    return filtered;
  };

  // Marquer un commentaire comme lu
  const marquerCommeLu = async (commentaireId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_GATEWAY_URL || 'http://localhost:8080'}/api/commentaires/${commentaireId}/activer`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        }
      });

      if (response.ok) {
        // Mettre à jour la liste des commentaires
        setCommentaires(prev => 
          prev.map(commentaire => 
            commentaire.id === commentaireId 
              ? { ...commentaire, statut: 'ACTIF' }
              : commentaire
          )
        );
      }
    } catch (err) {
      console.error('Erreur lors de la marquage comme lu:', err);
    }
  };

  // Marquer tous les commentaires non lus comme lus
  const marquerTousCommeLus = async () => {
    const commentairesNonLus = commentaires.filter(c => c.statut === 'DESACTIF');
    
    try {
      const promises = commentairesNonLus.map(commentaire => 
        fetch(`${process.env.REACT_APP_GATEWAY_URL || 'http://localhost:8080'}/api/commentaires/${commentaire.id}/activer`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
          }
        })
      );

      await Promise.all(promises);
      
      // Mettre à jour la liste des commentaires
      setCommentaires(prev => 
        prev.map(commentaire => ({ ...commentaire, statut: 'ACTIF' }))
      );
      
      setShowUnreadOnly(false);
    } catch (err) {
      console.error('Erreur lors de la marquage en masse:', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeBadge = (type) => {
    const badges = {
      'DISCUSSION': { label: '💬 Discussion', variant: 'primary' },
      'QUESTION': { label: '❓ Question', variant: 'warning' },
      'ANNONCE': { label: '📢 Annonce', variant: 'success' },
      'PARTAGE': { label: '📖 Partage', variant: 'info' }
    };
    return badges[type] || { label: type, variant: 'secondary' };
  };

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

  if (error || !sujet) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert variant="error">
            {error || 'Sujet non trouvé'}
          </Alert>
        </div>
      </div>
    );
  }

  const filteredCommentaires = getFilteredCommentaires();
  const unreadCount = commentaires.filter(c => c.statut === 'DESACTIF').length;
  const typeBadge = getTypeBadge(sujet.type);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête du sujet */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <Badge variant={typeBadge.variant}>
                    {typeBadge.label}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {sujet.section?.nom || 'Sans section'}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {sujet.titreOriginal}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>Par {sujet.auteur?.prenom} {sujet.auteur?.nom}</span>
                  <span>•</span>
                  <span>{formatDate(sujet.dateCreation)}</span>
                  <span>•</span>
                  <span>{sujet.nombreVus} vues</span>
                  <span>•</span>
                  <span>{sujet.nombreCommentaires} commentaires</span>
                </div>
              </div>
            </div>

            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">
                {sujet.contenuOriginal}
              </p>
            </div>
          </div>
        </Card>

        {/* Contrôles pour les commentaires */}
        {isOwner && unreadCount > 0 && (
          <Card className="mb-6">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {unreadCount} commentaire{unreadCount > 1 ? 's' : ''} non lu{unreadCount > 1 ? 's' : ''}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                    className={showUnreadOnly ? 'bg-blue-50 text-blue-700' : ''}
                  >
                    {showUnreadOnly ? '👁️ Voir tous' : '🔍 Voir non lus seulement'}
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={marquerTousCommeLus}
                  className="text-green-600 border-green-300 hover:bg-green-50"
                >
                  ✅ Marquer tous comme lus
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Liste des commentaires */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Commentaires ({filteredCommentaires.length})
              </h2>
              {isAuthenticated && (
                <Button
                  onClick={() => setCommentModal({ isOpen: true, sujetId: sujet.id })}
                >
                  💬 Ajouter un commentaire
                </Button>
              )}
            </div>

            {filteredCommentaires.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">💬</div>
                <p className="text-gray-500">
                  {showUnreadOnly ? 'Aucun commentaire non lu' : 'Aucun commentaire pour le moment'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCommentaires.map((commentaire) => (
                  <div
                    key={commentaire.id}
                    className={`p-4 border rounded-lg ${
                      commentaire.id === highlightedComment 
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                        : 'border-gray-200'
                    } ${
                      commentaire.statut === 'DESACTIF' 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm text-gray-900">
                          {commentaire.auteur?.prenom} {commentaire.auteur?.nom}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(commentaire.dateCreation)}
                        </span>
                        {commentaire.statut === 'DESACTIF' && (
                          <Badge variant="error" size="sm">
                            🔴 Non lu
                          </Badge>
                        )}
                      </div>
                      {isOwner && commentaire.statut === 'DESACTIF' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => marquerCommeLu(commentaire.id)}
                          className="text-green-600 border-green-300 hover:bg-green-50"
                        >
                          ✅ Marquer comme lu
                        </Button>
                      )}
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {commentaire.contenuOriginal}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Modal de commentaire */}
      <CommentModal
        isOpen={commentModal.isOpen}
        onClose={() => setCommentModal({ isOpen: false, sujetId: null })}
        sujetId={commentModal.sujetId}
        onCommentAdded={() => {
          // Recharger les commentaires
          const sujetId = getSujetIdFromUrl();
          if (sujetId) {
            fetchCommentaires(sujetId);
          }
        }}
      />
    </div>
  );
};

export default TopicDetailPage;
