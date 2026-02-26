import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Button, Card, Badge, Input, Select } from '../components/common';
import { topicsService } from '../services/api';
import Navbar from '../components/Navbar';
import TopicFilters from '../components/TopicFilters';
import TopicStats from '../components/TopicStats';

const TopicsPage = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    section: '',
    status: 'all',
    sort: 'recent'
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Récupérer les sujets depuis l'API
  const fetchTopics = async (page = 0, append = false) => {
    try {
      if (!append) {
        setLoading(true);
      }
      
      let data;
      
      // Choisir l'endpoint selon le filtre de statut
      if (filters.status === 'active') {
        data = await topicsService.getActiveTopics({ page, size: 20 });
      } else if (filters.status === 'inactive') {
        data = await topicsService.getInactiveTopics({ page, size: 20 });
      } else {
        data = await topicsService.getAllTopics({ page, size: 20 });
      }
      
      if (append) {
        setTopics(prev => [...prev, ...data]);
      } else {
        setTopics(data);
      }
      
      setHasMore(data.length === 20);
      setCurrentPage(page);
      
    } catch (err) {
      console.error('Erreur lors de la récupération des sujets:', err);
      if (!append) {
        setTopics([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Charger les sujets initiaux
  useEffect(() => {
    fetchTopics(0, false);
  }, [filters.status]);

  // Charger plus de sujets
  const loadMoreTopics = () => {
    if (hasMore && !loading) {
      fetchTopics(currentPage + 1, true);
    }
  };

  // Gérer les changements de filtres
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(0);
    setHasMore(true);
    // Note: Le rechargement sera déclenché par useEffect
  };

  // Réinitialiser les filtres
  const handleResetFilters = () => {
    setFilters({
      search: '',
      section: '',
      status: 'all',
      sort: 'recent'
    });
    setCurrentPage(0);
    setHasMore(true);
  };


  // Fonction utilitaire pour s'assurer qu'on n'affiche jamais d'objets
  const safeString = (value) => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'object' && value !== null) {
      return value.nomFr || value.nom || value.name || 'Objet';
    }
    return '';
  };

  // Appliquer les filtres côté client (recherche et tri)
  const filteredTopics = topics
    .filter(topic => {
      if (!filters.search) return true;
      
      const titre = topic.titreOriginal || topic.titre || '';
      const contenu = topic.contenuOriginal || topic.contenu || '';
      const auteurNom = topic.auteur?.nom || '';
      const auteurPrenom = topic.auteur?.prenom || '';
      const auteurComplet = `${auteurPrenom} ${auteurNom}`.trim();
      
      const searchTerm = filters.search.toLowerCase();
      return titre.toLowerCase().includes(searchTerm) ||
             contenu.toLowerCase().includes(searchTerm) ||
             auteurComplet.toLowerCase().includes(searchTerm);
    })
    .sort((a, b) => {
      switch (filters.sort) {
        case 'popular':
          return (b.nombreVus || 0) - (a.nombreVus || 0);
        case 'active':
          return (b.nombreCommentaires || 0) - (a.nombreCommentaires || 0);
        case 'alphabetical':
          return (a.titreOriginal || a.titre || '').localeCompare(b.titreOriginal || b.titre || '');
        default:
          return new Date(b.dateCreation || 0) - new Date(a.dateCreation || 0);
      }
    });

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Date invalide';
    
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'À l\'instant';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    if (diffInHours < 48) return 'Hier';
    return date.toLocaleDateString('fr-FR');
  };

  const getTopicBadgeVariant = (type) => {
    switch (type) {
      case 'DISCUSSION': return 'primary';
      case 'QUESTION': return 'warning';
      case 'ANNONCE': return 'success';
      default: return 'secondary';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête de la page */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-heading mb-2">
                {t('topics.title')}
              </h1>
              <p className="text-gray-600">
                Découvrez les discussions et échanges de notre communauté
              </p>
            </div>

            {isAuthenticated && (
              <Button className="mt-4 lg:mt-0" href="/topics/create">
                {t('topics.create_new')}
              </Button>
            )}
          </div>
        </div>

        {/* Statistiques */}
        <TopicStats className="mb-8" />

        {/* Filtres avancés */}
        <TopicFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onReset={handleResetFilters}
          className="mb-8"
        />

        {/* Liste des sujets */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vih-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTopics.length === 0 ? (
              <Card className="text-center py-12">
                <div className="text-gray-500 mb-4">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-.881-5.595-2.46C5.1 11.29 4.22 9.34 4.22 7c0-2.34.88-4.29 2.46-5.595C8.29 0.1 10.24 0 12 0s3.71.1 5.02 1.405C18.33 2.71 19.22 4.66 19.22 7c0 2.34-.89 4.29-2.195 5.54C15.71 13.881 13.76 14.762 12 14.762s-3.71-.881-5.02-2.195C5.67 11.262 4.78 9.312 4.78 7c0-2.34.89-4.29 2.195-5.595C8.585.1 10.535 0 12 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('topics.no_topics')}
                </h3>
                <p className="text-gray-500 mb-4">
                  Aucun sujet ne correspond à vos critères de recherche.
                </p>
                <Button variant="outline" onClick={handleResetFilters}>
                  Effacer les filtres
                </Button>
              </Card>
            ) : (
              filteredTopics.map((topic) => (
                <Card key={topic.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer group" onClick={() => window.location.href = `/topics/${topic.id}`}>
                  <div className="flex items-start justify-between p-6">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <Badge variant={getTopicBadgeVariant(topic.type)} size="sm">
                          {topic.type === 'DISCUSSION' && '💬 Discussion'}
                          {topic.type === 'QUESTION' && '❓ Question'}
                          {topic.type === 'ANNONCE' && '📢 Annonce'}
                        </Badge>

                        <Badge variant="outline" size="sm">
                          {safeString(topic.section) || 'Section inconnue'}
                        </Badge>

                        <span className="text-sm text-gray-500">
                          {topic.langue_originale === 'fr' && '🇫🇷 Français'}
                          {topic.langue_originale === 'en' && '🇬🇧 English'}
                          {topic.langue_originale === 'pt' && '🇵🇹 Português'}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-vih-primary transition-colors">
                        {topic.titreOriginal || topic.titre || 'Titre non disponible'}
                      </h3>

                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <span>Par <span className="font-medium text-gray-700">{topic.auteur?.prenom} {topic.auteur?.nom}</span></span>
                        <span>{formatDate(topic.dateCreation)}</span>
                        <Badge variant={topic.statut ? "success" : "secondary"} size="sm">
                          {topic.statut ? "🟢 Actif" : "🔴 Inactif"}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-3 ml-6">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">
                          {topic.nombreCommentaires || 0}
                        </div>
                        <div className="text-xs text-gray-500">
                          {t('topics.replies')}
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">
                          {topic.nombreVus || 0}
                        </div>
                        <div className="text-xs text-gray-500">
                          {t('topics.views')}
                        </div>
                      </div>

                      <Button size="sm" variant="outline" href={`/topics/${topic.id}`}>
                        Voir
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Bouton Charger plus */}
        {topics.length > 0 && hasMore && (
          <div className="text-center mt-8">
            <Button
              onClick={loadMoreTopics}
              disabled={loading}
              variant="outline"
              size="lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Chargement...
                </>
              ) : (
                '📄 Charger plus de sujets'
              )}
            </Button>
          </div>
        )}

        {/* Message si plus de sujets disponibles */}
        {topics.length > 0 && !hasMore && (
          <div className="text-center mt-8">
            <p className="text-gray-500">
              🎉 Vous avez vu tous les sujets disponibles !
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicsPage;
