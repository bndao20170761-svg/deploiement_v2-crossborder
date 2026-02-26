import { useState } from 'react';

const FORUM_API_URL = process.env.REACT_APP_FORUM_API_URL || "http://localhost:8080/api";

export const useTranslation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const translateText = async (text, sourceLanguage, targetLanguage, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      // Validation des langues supportées
      const supportedLanguages = ['fr', 'en', 'pt'];
      if (!supportedLanguages.includes(sourceLanguage)) {
        throw new Error(`Langue source non supportée: ${sourceLanguage}. Langues supportées: ${supportedLanguages.join(', ')}`);
      }
      if (!supportedLanguages.includes(targetLanguage)) {
        throw new Error(`Langue cible non supportée: ${targetLanguage}. Langues supportées: ${supportedLanguages.join(', ')}`);
      }

      const requestBody = {
        text: text || '',
        sourceLanguage: sourceLanguage || 'fr',
        targetLanguage: targetLanguage || 'en',
        sujetId: options.sujetId || null,
        commentaireId: options.commentaireId || null,
        userId: options.userId || null,
        autoApprove: options.autoApprove || false
      };

      console.log('🌐 Requête de traduction:', {
        url: `${FORUM_API_URL}/translations/translate`,
        body: requestBody
      });

      const response = await fetch(`${FORUM_API_URL}/translations/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📡 Réponse de traduction:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        let errorMessage = `Erreur ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage += ` - ${JSON.stringify(errorData)}`;
        } catch (e) {
          // Ignore si on ne peut pas parser la réponse d'erreur
        }
        throw new Error(errorMessage);
      }

      const translationData = await response.json();
      console.log('✅ Traduction réussie:', translationData);
      return translationData;
    } catch (err) {
      console.error('❌ Erreur lors de la traduction:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTranslationsBySujet = async (sujetId, targetLanguage = 'fr') => {
    try {
      const response = await fetch(`${FORUM_API_URL}/translations/sujet/${sujetId}?targetLanguage=${targetLanguage}`);
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      console.error('Erreur lors de la récupération des traductions:', err);
      setError(err.message);
      return [];
    }
  };

  const getTranslationsByCommentaire = async (commentaireId, targetLanguage = 'fr') => {
    try {
      const response = await fetch(`${FORUM_API_URL}/translations/commentaire/${commentaireId}?targetLanguage=${targetLanguage}`);
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      console.error('Erreur lors de la récupération des traductions:', err);
      setError(err.message);
      return [];
    }
  };

  const approveTranslation = async (translationId, approvedBy) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${FORUM_API_URL}/translations/${translationId}/approve?approvedBy=${approvedBy}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      console.error('Erreur lors de l\'approbation:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getLanguageInfo = (lang) => {
    const languages = {
      'fr': { name: 'Français', flag: '🇫🇷', code: 'fr' },
      'en': { name: 'English', flag: '🇬🇧', code: 'en' },
      'pt': { name: 'Português', flag: '🇵🇹', code: 'pt' }
    };
    return languages[lang] || { name: lang.toUpperCase(), flag: '🌐', code: lang };
  };

  const getSupportedLanguages = () => {
    return [
      { code: 'fr', name: 'Français', flag: '🇫🇷' },
      { code: 'en', name: 'English', flag: '🇬🇧' }
      // Note: Portugais (pt) non supporté par LibreTranslate
    ];
  };

  return {
    loading,
    error,
    translateText,
    getTranslationsBySujet,
    getTranslationsByCommentaire,
    approveTranslation,
    getLanguageInfo,
    getSupportedLanguages
  };
};
