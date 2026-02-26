import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Button, Card, Badge } from '../components/common';
import Navbar from '../components/Navbar';
import CommentModal from '../components/CommentModal';
import TranslationModal from '../components/TranslationModal';
import CommentList from '../components/CommentList';

const HomePage = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [sujets, setSujets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSujet, setExpandedSujet] = useState(null);
  const [sujetDetails, setSujetDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [commentModal, setCommentModal] = useState({ isOpen: false, sujetId: null });
  const [translationModal, setTranslationModal] = useState({ isOpen: false, sujet: null, targetLanguage: null });
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Récupérer les sujets depuis l'API avec pagination
  const fetchSujets = async (page = 0, append = false) => {
    try {
      if (!append) {
        setLoading(true);
      }
      setError(null);
      
      const response = await fetch(`http://localhost:8080/api/sujets?page=${page}&size=20`);
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (append) {
        setSujets(prev => [...prev, ...data]);
      } else {
        setSujets(data);
      }
      
      // Calculer s'il y a plus de pages
      setHasMore(data.length === 20);
      setCurrentPage(page);
      
    } catch (err) {
      console.error('Erreur lors de la récupération des sujets:', err);
      setError(err.message);
      if (!append) {
        setSujets([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Charger les sujets initiaux
  useEffect(() => {
    fetchSujets(0, false);
  }, []);

  // Charger plus de sujets
  const loadMoreSujets = () => {
    if (hasMore && !loading) {
      fetchSujets(currentPage + 1, true);
    }
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'À l\'instant';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    if (diffInHours < 48) return 'Hier';
    return date.toLocaleDateString('fr-FR');
  };

  // Fonction pour obtenir la variante du badge selon le type
  const getBadgeVariant = (type) => {
    switch (type) {
      case 'DISCUSSION': return 'secondary';
      case 'QUESTION': return 'primary';
      case 'INFO': return 'outline';
      default: return 'secondary';
    }
  };

  // Fonction pour obtenir le nom de section selon la langue
  const getSectionName = (section) => {
    if (!section) return 'Section';
    
    // Priorité: nomFr -> nomEn -> nomPt -> code
    return section.nomFr || section.nomEn || section.nomPt || section.code || 'Section';
  };

  // Fonction pour lire un sujet (charger le contenu complet)
  const lireSujet = async (sujetId) => {
    try {
      setLoadingDetails(true);
      
      const response = await fetch(`http://localhost:8080/api/sujets/${sujetId}/lire`);
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const details = await response.json();
      setSujetDetails(prev => ({
        ...prev,
        [sujetId]: details
      }));
      
      // Mettre à jour la liste des sujets avec les nouvelles données
      setSujets(prevSujets => 
        prevSujets.map(sujet => 
          sujet.id === sujetId 
            ? { ...sujet, nombreVus: details.nombreVus, statut: details.statut }
            : sujet
        )
      );
      
    } catch (err) {
      console.error('Erreur lors de la lecture du sujet:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Fonction pour basculer l'expansion d'un sujet
  const toggleSujetExpansion = async (sujetId) => {
    if (expandedSujet === sujetId) {
      setExpandedSujet(null);
    } else {
      setExpandedSujet(sujetId);
      
      // Si on n'a pas encore chargé les détails, les charger
      if (!sujetDetails[sujetId]) {
        await lireSujet(sujetId);
      }
    }
  };

  // Fonctions pour gérer les modales
  const openCommentModal = (sujetId) => {
    setCommentModal({ isOpen: true, sujetId });
  };

  const closeCommentModal = () => {
    setCommentModal({ isOpen: false, sujetId: null });
  };

  const openTranslationModal = (sujet, targetLanguage) => {
    setTranslationModal({ isOpen: true, sujet, targetLanguage });
  };

  const closeTranslationModal = () => {
    setTranslationModal({ isOpen: false, sujet: null, targetLanguage: null });
  };

  const handleCommentAdded = () => {
    // Rafraîchir les commentaires du sujet et mettre à jour le nombre de commentaires
    console.log('Commentaire ajouté');
    
    // Mettre à jour le nombre de commentaires dans la liste des sujets
    if (commentModal.sujetId) {
      setSujets(prevSujets => 
        prevSujets.map(sujet => 
          sujet.id === commentModal.sujetId 
            ? { ...sujet, nombreCommentaires: (sujet.nombreCommentaires || 0) + 1 }
            : sujet
        )
      );
    }
  };

  const handleTranslationAdded = () => {
    // TODO: Rafraîchir les traductions du sujet
    console.log('Traduction ajoutée');
  };

  const stats = [
    { label: 'Membres actifs', value: '1,234', icon: '👥' },
    { label: 'Sujets de discussion', value: '567', icon: '💬' },
    { label: 'Messages échangés', value: '8,901', icon: '✉️' },
    { label: 'Langues supportées', value: '3', icon: '🌍' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-vih-light via-white to-blue-50">
      <Navbar />


      {/* Statistiques */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tous les sujets */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 font-heading">
                Discussions récentes
              </h2>
              {sujets.length > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  {sujets.length} sujet{sujets.length > 1 ? 's' : ''} affiché{sujets.length > 1 ? 's' : ''}
                  {hasMore && ' (et plus...)'}
                </p>
              )}
            </div>
            <Button variant="outline" size="sm" href="/topics">
              Voir tous les sujets
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vih-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <div className="text-red-600 mb-2">
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="font-semibold">Impossible de charger les sujets</p>
                </div>
                <p className="text-red-700 text-sm mb-4">{error}</p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  Réessayer
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {sujets.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">Aucun sujet disponible pour le moment</p>
                  {isAuthenticated && (
                    <Button className="mt-4" href="/topics/create">
                      Créer le premier sujet
                    </Button>
                  )}
                </div>
              ) : (
                sujets.map((sujet) => (
                  <Card key={sujet.id} className="hover:shadow-lg transition-shadow duration-200 group cursor-pointer" onClick={() => window.location.href = `/topics/${sujet.id}`}>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Badge variant={getBadgeVariant(sujet.type)} size="sm">
                            {sujet.type}
                          </Badge>
                          {sujet.section && (
                            <Badge variant="outline" size="sm">
                              {getSectionName(sujet.section)}
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500">
                            {formatDate(sujet.dateCreation)}
                          </span>
                        </div>
                        {sujet.langueOriginale && (
                          <span className="text-xs text-gray-500 uppercase">
                            {sujet.langueOriginale}
                          </span>
                        )}
                      </div>

                      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-vih-primary transition-colors">
                        {sujet.titreOriginal}
                      </h3>

                      <p className="text-sm text-gray-600 mb-4">
                        Par <span className="font-medium">
                          {sujet.auteur?.prenom} {sujet.auteur?.nom}
                        </span>
                      </p>

                      {/* Contenu expansible */}
                      {expandedSujet === sujet.id && (
                        <div className="mb-4 p-4 bg-gray-50 rounded-lg border-l-4 border-vih-primary">
                          {loadingDetails ? (
                            <div className="flex items-center justify-center py-4">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-vih-primary"></div>
                              <span className="ml-2 text-sm text-gray-600">Chargement du contenu...</span>
                            </div>
                          ) : sujetDetails[sujet.id] ? (
                            <div>
                              <div className="prose prose-sm max-w-none mb-4">
                                <p className="text-gray-700 whitespace-pre-wrap">
                                  {sujetDetails[sujet.id].contenuOriginal}
                                </p>
                              </div>
                              
                              {/* Liste des commentaires */}
                              <div className="mb-4">
                                <CommentList sujetId={sujet.id} />
                              </div>
                              
                              {/* Actions pour commentaires et traduction */}
                              <div className="flex flex-wrap gap-2 mt-4">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => openCommentModal(sujet.id)}
                                  className="text-blue-600 border-blue-300 hover:bg-blue-50"
                                >
                                  💬 Commenter
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => openTranslationModal(sujetDetails[sujet.id], 'fr')}
                                  className="text-green-600 border-green-300 hover:bg-green-50"
                                >
                                  🌐 Traduire
                                </Button>
                                <div className="flex space-x-1">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => openTranslationModal(sujetDetails[sujet.id], 'fr')}
                                    className="text-xs px-2 py-1"
                                  >
                                    🇫🇷 FR
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => openTranslationModal(sujetDetails[sujet.id], 'en')}
                                    className="text-xs px-2 py-1"
                                  >
                                    🇬🇧 EN
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => openTranslationModal(sujetDetails[sujet.id], 'pt')}
                                    className="text-xs px-2 py-1"
                                  >
                                    🇵🇹 PT
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <p className="text-gray-500">Erreur lors du chargement du contenu</p>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span>💬 {sujet.nombreCommentaires || 0}</span>
                          <span>👁️ {sujet.nombreVus || 0}</span>
                          <Badge variant={sujet.statut ? "success" : "secondary"} size="sm">
                            {sujet.statut ? "🟢 Actif" : "🔴 Inactif"}
                          </Badge>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => toggleSujetExpansion(sujet.id)}
                        >
                          {expandedSujet === sujet.id ? 'Masquer' : 'Lire'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Bouton Charger plus */}
          {sujets.length > 0 && hasMore && (
            <div className="text-center mt-8">
              <Button
                onClick={loadMoreSujets}
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
          {sujets.length > 0 && !hasMore && (
            <div className="text-center mt-8">
              <p className="text-gray-500">
                🎉 Vous avez vu tous les sujets disponibles !
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Appel à l'action final */}
      {!isAuthenticated && (
        <section className="py-20 bg-vih-primary">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">




            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" href="/register">
                Créer un compte
              </Button>
              <Button size="lg" variant="outline" href="/forums">
                Explorer sans compte
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Modales */}
      <CommentModal
        isOpen={commentModal.isOpen}
        onClose={closeCommentModal}
        sujetId={commentModal.sujetId}
        onCommentAdded={handleCommentAdded}
      />

      <TranslationModal
        isOpen={translationModal.isOpen}
        onClose={closeTranslationModal}
        sujet={translationModal.sujet}
        targetLanguage={translationModal.targetLanguage}
        onTranslationAdded={handleTranslationAdded}
      />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-vih-primary rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold font-heading">VIH Forum</h3>
              </div>
              <p className="text-gray-400">
                Plateforme de soutien et d'échange pour la communauté VIH, disponible en français, anglais et portugais.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Liens rapides</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/forums" className="hover:text-white transition-colors">Forums</a></li>
                <li><a href="/about" className="hover:text-white transition-colors">À propos</a></li>
                <li><a href="/help" className="hover:text-white transition-colors">Aide</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Informations</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/privacy" className="hover:text-white transition-colors">Politique de confidentialité</a></li>
                <li><a href="/terms" className="hover:text-white transition-colors">Conditions d'utilisation</a></li>
                <li><a href="/moderation" className="hover:text-white transition-colors">Règles de modération</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 VIH Forum. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
