import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Button, Card, Badge } from '../components/common';
import { topicsService } from '../services/api';
import Navbar from '../components/Navbar';

const MyTopicsPage = () => {
  const { t } = useLanguage();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('MyTopicsPage - État auth:', { isAuthenticated, user, authLoading });
    
    const fetchMyTopics = async () => {
      if (!isAuthenticated || !user?.id) {
        console.log('fetchMyTopics - Pas authentifié ou pas d\'utilisateur:', { isAuthenticated, user });
        setError('Vous devez être connecté pour voir vos sujets');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('fetchMyTopics - Récupération des sujets pour l\'utilisateur:', user.id);
        const data = await topicsService.getTopicsByAuthor(user.id);
        console.log('fetchMyTopics - Sujets récupérés:', data);
        setTopics(data);
      } catch (err) {
        console.error('Erreur lors de la récupération de mes sujets:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user && !authLoading) {
      fetchMyTopics();
    }
  }, [isAuthenticated, user, authLoading]);

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
              Mes Sujets
            </h1>
            <p className="text-gray-600 mb-6">
              Vous devez être connecté pour voir vos sujets.
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
              Mes Sujets
            </h1>
            <p className="text-red-600 mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-heading mb-2">
            Mes Sujets
          </h1>
          <p className="text-gray-600">
            Voici tous les sujets que vous avez créés
          </p>
        </div>

        {topics.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun sujet créé
              </h3>
              <p className="text-gray-500 mb-6">
                Vous n'avez pas encore créé de sujet. Commencez par en créer un !
              </p>
              <Button href="/topics/create">
                Créer mon premier sujet
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {topics.map((topic) => {
              const typeBadge = getTypeBadge(topic.type);
              return (
                <Card 
                  key={topic.id} 
                  className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
                  onClick={() => window.location.href = `/topics/${topic.id}`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Badge variant={typeBadge.variant}>
                            {typeBadge.label}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {topic.section?.nomFr || topic.section?.nom || 'Sans section'}
                          </span>
                          <Badge variant={topic.statut ? "success" : "secondary"} size="sm">
                            {topic.statut ? "🟢 Actif" : "🔴 Inactif"}
                          </Badge>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-vih-primary transition-colors">
                          {topic.titreOriginal || topic.titre}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {topic.contenuOriginal || topic.contenu}
                        </p>
                        <div className="flex items-center text-sm text-gray-500 space-x-4 mb-4">
                          <span>💬 {topic.nombreCommentaires || 0} commentaires</span>
                          <span>👁️ {topic.nombreVus || 0} vues</span>
                          <span>📅 {formatDate(topic.dateCreation)}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => window.location.href = `/topics/${topic.id}`}
                          >
                            Voir le sujet
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              console.log('MyTopicsPage - Clic sur Modifier pour le sujet:', topic.id);
                              const editUrl = `/topics/${topic.id}/edit`;
                              console.log('MyTopicsPage - URL de modification:', editUrl);
                              // Forcer un rechargement complet de la page
                              window.location.replace(editUrl);
                            }}
                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                          >
                            ✏️ Modifier
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTopicsPage;
