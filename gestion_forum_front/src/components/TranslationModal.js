import React, { useState, useEffect } from 'react';
import { Button } from './common';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';

const TranslationModal = ({ isOpen, onClose, sujet, targetLanguage, onTranslationAdded }) => {
  const { t } = useLanguage();
  const { translateText, getTranslationsBySujet, loading, error, getLanguageInfo } = useTranslation();
  const [translation, setTranslation] = useState('');
  const [existingTranslations, setExistingTranslations] = useState([]);

  useEffect(() => {
    if (isOpen && sujet) {
      fetchExistingTranslations();
    }
  }, [isOpen, sujet, targetLanguage]);

  const fetchExistingTranslations = async () => {
    try {
      const translations = await getTranslationsBySujet(sujet.id, targetLanguage);
      setExistingTranslations(translations);
    } catch (err) {
      console.error('Erreur lors de la récupération des traductions existantes:', err);
    }
  };

  // Fonction simple de détection de langue
  const detectLanguage = (text) => {
    if (!text) return 'fr';
    
    // Mots clés anglais
    const englishWords = ['the', 'and', 'is', 'are', 'was', 'were', 'have', 'has', 'had', 'will', 'would', 'could', 'should', 'this', 'that', 'these', 'those', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'among', 'under', 'over', 'around', 'near', 'far', 'here', 'there', 'where', 'when', 'why', 'how', 'what', 'who', 'which', 'whose', 'whom', 'yes', 'no', 'not', 'but', 'or', 'so', 'yet', 'because', 'if', 'unless', 'although', 'though', 'while', 'until', 'since', 'as', 'like', 'unlike', 'despite', 'in spite of'];
    
    // Mots clés français
    const frenchWords = ['le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'dans', 'sur', 'avec', 'sans', 'pour', 'par', 'vers', 'chez', 'sous', 'entre', 'parmi', 'pendant', 'depuis', 'jusqu', 'avant', 'après', 'devant', 'derrière', 'à', 'au', 'aux', 'et', 'ou', 'mais', 'donc', 'car', 'ni', 'que', 'qui', 'quoi', 'où', 'quand', 'comment', 'pourquoi', 'est', 'sont', 'était', 'étaient', 'sera', 'seront', 'avoir', 'être', 'faire', 'aller', 'venir', 'voir', 'savoir', 'pouvoir', 'vouloir', 'devoir', 'falloir', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles'];
    
    const words = text.toLowerCase().split(/\s+/);
    let englishCount = 0;
    let frenchCount = 0;
    
    words.forEach(word => {
      if (englishWords.includes(word)) englishCount++;
      if (frenchWords.includes(word)) frenchCount++;
    });
    
    console.log(`Détection de langue: ${englishCount} mots anglais, ${frenchCount} mots français`);
    
    if (englishCount > frenchCount) return 'en';
    if (frenchCount > englishCount) return 'fr';
    return 'fr'; // Par défaut français
  };

  const handleTranslate = async () => {
    if (!sujet || !sujet.contenuOriginal) return;

    try {
      const detectedLanguage = detectLanguage(sujet.contenuOriginal);
      console.log(`Langue détectée: ${detectedLanguage} pour le texte: "${sujet.contenuOriginal.substring(0, 50)}..."`);
      
      const translationData = await translateText(
        sujet.contenuOriginal,
        detectedLanguage,
        targetLanguage,
        {
          sujetId: sujet.id,
          autoApprove: true
        }
      );
      
      setTranslation(translationData.translatedText);
      
      // Rafraîchir les traductions existantes
      await fetchExistingTranslations();
      
      if (onTranslationAdded) {
        onTranslationAdded();
      }
    } catch (err) {
      console.error('Erreur lors de la traduction:', err);
    }
  };

  const getLanguageFlag = (lang) => {
    return getLanguageInfo(lang).flag;
  };

  const getLanguageName = (lang) => {
    return getLanguageInfo(lang).name;
  };

  if (!isOpen || !sujet) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800">
            🌐 Traduction du sujet
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Informations du sujet */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">Sujet original</h4>
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-medium">Titre:</span> {sujet.titre}
          </p>
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-medium">Langue:</span> {getLanguageFlag(sujet.langueOriginale || 'fr')} {getLanguageName(sujet.langueOriginale || 'fr')}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Contenu:</span>
          </p>
          <div className="mt-2 p-3 bg-white rounded border text-sm text-gray-700 max-h-32 overflow-y-auto">
            {sujet.contenuOriginal}
          </div>
        </div>

        {/* Traductions existantes */}
        {existingTranslations.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-3">
              Traductions existantes en {getLanguageFlag(targetLanguage)} {getLanguageName(targetLanguage)}
            </h4>
            <div className="space-y-3">
              {existingTranslations.map((trans) => (
                <div key={trans.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-800">
                      {getLanguageFlag(trans.translationProvider)} {trans.translationProvider}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(trans.dateCreation).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{trans.translatedText}</p>
                  {trans.isApproved && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
                      ✅ Approuvée
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Zone de traduction */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-800">
              Nouvelle traduction en {getLanguageFlag(targetLanguage)} {getLanguageName(targetLanguage)}
            </h4>
            <Button
              onClick={handleTranslate}
              disabled={loading}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Traduction...' : '🌐 Traduire'}
            </Button>
          </div>

          {error && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">❌ {error}</p>
            </div>
          )}

          <textarea
            value={translation}
            onChange={(e) => setTranslation(e.target.value)}
            placeholder="La traduction apparaîtra ici..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={8}
            readOnly={!translation}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Fermer
          </Button>
          {translation && (
            <Button
              onClick={() => {
                // TODO: Sauvegarder la traduction personnalisée
                console.log('Traduction personnalisée:', translation);
                onClose();
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              💾 Sauvegarder
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TranslationModal;