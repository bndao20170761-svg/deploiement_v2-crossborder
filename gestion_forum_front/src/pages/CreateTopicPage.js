import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input, TextArea, Select, Card, Alert, Badge } from '../components/common';
import { topicsService, translationService } from '../services/api';
import Navbar from '../components/Navbar';
import ProtectedRoute from '../components/ProtectedRoute';
import SectionAutocomplete from '../components/SectionAutocomplete';

const CreateTopicPage = () => {
  const { currentLanguage } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
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

  // Gérer la sélection de section
  const handleSectionSelect = (section) => {
    setFormData(prev => ({
      ...prev,
      section: section.id
    }));
  };

  const types = [
    { value: 'DISCUSSION', label: '💬 Discussion' },
    { value: 'QUESTION', label: '❓ Question' },
    { value: 'ANNONCE', label: '📢 Annonce' },
    { value: 'PARTAGE', label: '📖 Partage d\'expérience' },
  ];

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });

    // Effacer l'erreur pour ce champ
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.titre.trim()) newErrors.titre = 'Le titre est requis';
    if (!formData.contenu.trim()) newErrors.contenu = 'Le contenu est requis';
    if (!formData.section || formData.section.trim() === '') newErrors.section = 'La section est requise';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const translateText = async (text, targetLanguage) => {
    setTranslationStatus(prev => ({
      ...prev,
      [targetLanguage]: { status: 'translating', loading: true }
    }));

    try {
      const translation = await translationService.translateText(
        text,
        currentLanguage,
        targetLanguage
      );

      setTranslationStatus(prev => ({
        ...prev,
        [targetLanguage]: { status: 'completed', loading: false }
      }));

      return translation;
    } catch (error) {
      setTranslationStatus(prev => ({
        ...prev,
        [targetLanguage]: { status: 'error', loading: false }
      }));
      throw error;
    }
  };

  const handleTranslateAll = async () => {
    if (!formData.titre && !formData.contenu) {
      setErrors({ general: 'Veuillez saisir un titre et un contenu avant de traduire' });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const [englishTranslation, portugueseTranslation] = await Promise.all([
        translateText(formData.contenu, 'en'),
        translateText(formData.contenu, 'pt'),
      ]);

      // Ici vous sauvegarderiez les traductions dans le state global du formulaire
      console.log('English translation:', englishTranslation);
      console.log('Portuguese translation:', portugueseTranslation);

      // Afficher un message de succès
      setErrors({ general: 'Traduction terminée avec succès !' });

    } catch (error) {
      console.error('Erreur lors de la traduction automatique:', error);
      setErrors({ general: 'Erreur lors de la traduction automatique: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Vérifier l'authentification
    const token = localStorage.getItem('auth-token');
    if (!token) {
      setErrors({ general: 'Vous devez être connecté pour créer un sujet. Veuillez vous connecter d\'abord.' });
      return;
    }

    setLoading(true);

    try {
      const topicData = {
        titre: formData.titre,
        contenu: formData.contenu,
        type: formData.type,
        langue: formData.langue_originale,
        sectionId: formData.section, // Utiliser l'ID de section sélectionné
      };

      console.log('Données du sujet à créer:', topicData);
      console.log('Token d\'authentification:', token ? 'Présent' : 'Absent');

      const result = await topicsService.createTopic(topicData);

      // Ici vous pouvez utiliser result pour l'appel API réel
      console.log('Création du sujet:', result);

      // Redirection vers la page du sujet créé
      window.location.href = '/topics';

    } catch (error) {
      console.error('Erreur détaillée lors de la création du sujet:', error);
      setErrors({ general: 'Erreur lors de la création du sujet: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-heading mb-2">
            Créer un nouveau sujet
          </h1>
          <p className="text-gray-600">
            Partagez vos questions, expériences ou annonces avec la communauté
          </p>
        </div>

        {/* Vérification d'authentification */}
        {!user && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-orange-800 mb-2">
                  Authentification requise
                </h3>
                <p className="text-orange-700">
                  Vous devez être connecté pour créer un sujet.
                </p>
              </div>
              <Button href="/login" variant="primary">
                Se connecter
              </Button>
            </div>
          </Card>
        )}

        <form onSubmit={handleSubmit} className={`space-y-6 ${!user ? 'opacity-50 pointer-events-none' : ''}`}>
          {/* Informations générales */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Informations du sujet
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Section <span className="text-red-500">*</span>
                  </label>
                  <SectionAutocomplete
                    value={formData.section}
                    onChange={(value) => handleInputChange('section', value)}
                    onSelect={handleSectionSelect}
                    placeholder="Rechercher une section..."
                    error={errors.section}
                    className="w-full"
                  />
                </div>

                <Select
                  label="Type de sujet"
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  options={types}
                />
              </div>

              <Input
                label="Titre du sujet"
                value={formData.titre}
                onChange={(e) => handleInputChange('titre', e.target.value)}
                error={errors.titre}
                placeholder="Titre accrocheur pour votre sujet..."
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contenu du sujet
                </label>
                <TextArea
                  value={formData.contenu}
                  onChange={(e) => handleInputChange('contenu', e.target.value)}
                  error={errors.contenu}
                  placeholder="Décrivez votre sujet en détail..."
                  rows={8}
                  required
                />
              </div>
            </div>
          </Card>

          {/* Traduction automatique */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Traduction automatique
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Votre contenu sera automatiquement traduit dans les autres langues
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleTranslateAll}
                disabled={!formData.titre && !formData.contenu}
              >
                🔄 Traduire automatiquement
              </Button>
            </div>

            {errors.general && (
              <Alert variant="error" className="mb-6">
                {errors.general}
                {errors.general.includes('connecté') && (
                  <div className="mt-2">
                    <Button href="/login" size="sm" variant="primary">
                      Se connecter maintenant
                    </Button>
                  </div>
                )}
              </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Anglais */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">🇬🇧 English</Badge>
                  {translationStatus.en.loading ? (
                    <div className="flex items-center text-sm text-gray-500">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-vih-primary mr-2"></div>
                      Traduction en cours...
                    </div>
                  ) : translationStatus.en.status === 'completed' ? (
                    <Badge variant="success" size="sm">✓ Traduit</Badge>
                  ) : (
                    <Badge variant="secondary" size="sm">En attente</Badge>
                  )}
                </div>

                <Input
                  placeholder="Titre en anglais..."
                  disabled
                  className="bg-gray-50"
                />

                <TextArea
                  placeholder="Contenu en anglais..."
                  rows={4}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              {/* Portugais */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">🇵🇹 Português</Badge>
                  {translationStatus.pt.loading ? (
                    <div className="flex items-center text-sm text-gray-500">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-vih-primary mr-2"></div>
                      Traduction en cours...
                    </div>
                  ) : translationStatus.pt.status === 'completed' ? (
                    <Badge variant="success" size="sm">✓ Traduit</Badge>
                  ) : (
                    <Badge variant="secondary" size="sm">En attente</Badge>
                  )}
                </div>

                <Input
                  placeholder="Título em português..."
                  disabled
                  className="bg-gray-50"
                />

                <TextArea
                  placeholder="Conteúdo em português..."
                  rows={4}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              href="/topics"
              className="w-full sm:w-auto"
            >
              Annuler
            </Button>

            <Button
              type="submit"
              loading={loading}
              className="w-full sm:w-auto"
            >
              Créer le sujet
            </Button>
          </div>
        </form>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default CreateTopicPage;
