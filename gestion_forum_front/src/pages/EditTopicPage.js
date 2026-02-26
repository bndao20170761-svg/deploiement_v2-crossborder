import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input, TextArea, Select, Card, Alert, Badge } from '../components/common';
import { topicsService, translationService } from '../services/api';
import Navbar from '../components/Navbar';
import SectionAutocomplete from '../components/SectionAutocomplete';

const EditTopicPage = () => {
  console.log('EditTopicPage - Composant chargé');
  
  const { currentLanguage } = useLanguage();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingTopic, setLoadingTopic] = useState(true);
  const [formData, setFormData] = useState({
    titre: '',
    contenu: '',
    section: '',
    type: 'DISCUSSION',
    langue_originale: currentLanguage,
  });
  const [errors, setErrors] = useState({});
  const [translationStatus, setTranslationStatus] = useState({
    en: { status: 'pending', loading: false },
    pt: { status: 'pending', loading: false },
  });
  const [topic, setTopic] = useState(null);
  const [error, setError] = useState(null);

  // Récupérer l'ID du sujet depuis l'URL
  const getTopicIdFromUrl = () => {
    const path = window.location.pathname;
    const match = path.match(/\/topics\/(.+)\/edit/);
    return match ? match[1] : null;
  };

  // Charger les données du sujet à modifier
  useEffect(() => {
    const loadTopic = async () => {
      const topicId = getTopicIdFromUrl();
      console.log('EditTopicPage - ID du sujet extrait:', topicId);
      
      if (!topicId) {
        setError('ID du sujet non trouvé');
        setLoadingTopic(false);
        return;
      }

      if (!isAuthenticated || !user || authLoading) {
        console.log('EditTopicPage - Pas authentifié ou en cours de chargement:', { isAuthenticated, user, authLoading });
        setLoadingTopic(false);
        return;
      }

      try {
        setLoadingTopic(true);
        setError(null);
        
        // Récupérer les détails du sujet
        const topicData = await topicsService.readTopic(topicId);
        setTopic(topicData);
        
        // Pré-remplir le formulaire
        setFormData({
          titre: topicData.titreOriginal || topicData.titre || '',
          contenu: topicData.contenuOriginal || topicData.contenu || '',
          section: topicData.section?.id || '',
          type: topicData.type || 'DISCUSSION',
          langue_originale: topicData.langueOriginale || currentLanguage,
        });
      } catch (err) {
        console.error('Erreur lors du chargement du sujet:', err);
        setError(err.message);
      } finally {
        setLoadingTopic(false);
      }
    };

    loadTopic();
  }, [isAuthenticated, user, authLoading, currentLanguage]);

  // Gérer la sélection de section
  const handleSectionSelect = (section) => {
    setFormData(prev => ({
      ...prev,
      section: section ? section.id : ''
    }));
  };

  // Gérer les changements de formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur pour ce champ
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Valider le formulaire
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.titre.trim()) {
      newErrors.titre = 'Le titre est requis';
    }
    
    if (!formData.contenu.trim()) {
      newErrors.contenu = 'Le contenu est requis';
    }
    
    if (!formData.section) {
      newErrors.section = 'La section est requise';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (!isAuthenticated || !user?.id) {
      setError('Vous devez être connecté pour modifier un sujet');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Préparer les données pour l'API
      const topicData = {
        titre: formData.titre,
        contenu: formData.contenu,
        sectionId: formData.section,
        type: formData.type,
        langue_originale: formData.langue_originale
      };
      
      console.log('Modification du sujet avec les données:', topicData);
      
      // Appeler l'API de modification
      const updatedTopic = await topicsService.updateTopicByUserId(user.id, topicData);
      
      console.log('Sujet modifié avec succès:', updatedTopic);
      
      // Rediriger vers la page des sujets de l'utilisateur
      window.location.href = '/topics/my-topics';
      
    } catch (err) {
      console.error('Erreur lors de la modification du sujet:', err);
      setError(err.message || 'Erreur lors de la modification du sujet');
    } finally {
      setLoading(false);
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
              Modifier le sujet
            </h1>
            <p className="text-gray-600 mb-6">
              Vous devez être connecté pour modifier un sujet.
            </p>
            <Button href="/login">
              Se connecter
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loadingTopic) {
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

  if (error && !topic) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Modifier le sujet
            </h1>
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
            <Button href="/topics/my-topics">
              Retour à mes sujets
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
            Modifier le sujet
          </h1>
          <p className="text-gray-600">
            Modifiez les informations de votre sujet
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            {error && (
              <Alert variant="error">
                {error}
              </Alert>
            )}

            {/* Titre */}
            <div>
              <label htmlFor="titre" className="block text-sm font-medium text-gray-700 mb-2">
                Titre du sujet *
              </label>
              <Input
                id="titre"
                name="titre"
                value={formData.titre}
                onChange={handleChange}
                placeholder="Entrez le titre de votre sujet"
                className={errors.titre ? 'border-red-500' : ''}
              />
              {errors.titre && (
                <p className="mt-1 text-sm text-red-600">{errors.titre}</p>
              )}
            </div>

            {/* Contenu */}
            <div>
              <label htmlFor="contenu" className="block text-sm font-medium text-gray-700 mb-2">
                Contenu *
              </label>
              <TextArea
                id="contenu"
                name="contenu"
                value={formData.contenu}
                onChange={handleChange}
                placeholder="Décrivez votre sujet en détail"
                rows={6}
                className={errors.contenu ? 'border-red-500' : ''}
              />
              {errors.contenu && (
                <p className="mt-1 text-sm text-red-600">{errors.contenu}</p>
              )}
            </div>

            {/* Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section *
              </label>
              <SectionAutocomplete
                onSectionSelect={handleSectionSelect}
                selectedSectionId={formData.section}
                error={errors.section}
              />
              {errors.section && (
                <p className="mt-1 text-sm text-red-600">{errors.section}</p>
              )}
            </div>

            {/* Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Type de sujet
              </label>
              <Select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="DISCUSSION">💬 Discussion</option>
                <option value="QUESTION">❓ Question</option>
                <option value="ANNONCE">📢 Annonce</option>
                <option value="PARTAGE">📖 Partage</option>
              </Select>
            </div>

            {/* Langue */}
            <div>
              <label htmlFor="langue_originale" className="block text-sm font-medium text-gray-700 mb-2">
                Langue originale
              </label>
              <Select
                id="langue_originale"
                name="langue_originale"
                value={formData.langue_originale}
                onChange={handleChange}
              >
                <option value="fr">🇫🇷 Français</option>
                <option value="en">🇬🇧 English</option>
                <option value="pt">🇵🇹 Português</option>
              </Select>
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.location.href = '/topics/my-topics'}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
              >
                {loading ? 'Modification...' : 'Modifier le sujet'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default EditTopicPage;
