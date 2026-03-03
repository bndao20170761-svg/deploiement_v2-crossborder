import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const SectionAutocomplete = ({ 
  value, 
  onChange, 
  onSelect, 
  placeholder = "Sélectionner une section...",
  className = "",
  error = null 
}) => {
  const { currentLanguage } = useLanguage();
  const [sections, setSections] = useState([]);
  const [filteredSections, setFilteredSections] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Récupérer les sections depuis l'API
  useEffect(() => {
    const fetchSections = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.REACT_APP_GATEWAY_URL || 'http://localhost:8080'}/api/sujets/sections`);
        
        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setSections(data);
        setFilteredSections(data);
      } catch (err) {
        console.error('Erreur lors de la récupération des sections:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSections();
  }, []);

  // Filtrer les sections selon le terme de recherche
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredSections(sections);
    } else {
      const filtered = sections.filter(section => {
        const nom = getSectionName(section);
        const code = section.code || '';
        return nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
               code.toLowerCase().includes(searchTerm.toLowerCase());
      });
      setFilteredSections(filtered);
    }
  }, [searchTerm, sections]);

  // Obtenir le nom de section selon la langue
  const getSectionName = (section) => {
    if (!section) return '';
    switch (currentLanguage) {
      case 'fr': return section.nomFr || section.nomEn || section.nomPt || section.code;
      case 'en': return section.nomEn || section.nomFr || section.nomPt || section.code;
      case 'pt': return section.nomPt || section.nomFr || section.nomEn || section.code;
      default: return section.nomFr || section.nomEn || section.nomPt || section.code;
    }
  };

  // Obtenir la description de section selon la langue
  const getSectionDescription = (section) => {
    if (!section) return '';
    switch (currentLanguage) {
      case 'fr': return section.descriptionFr || section.descriptionEn || section.descriptionPt;
      case 'en': return section.descriptionEn || section.descriptionFr || section.descriptionPt;
      case 'pt': return section.descriptionPt || section.descriptionFr || section.descriptionEn;
      default: return section.descriptionFr || section.descriptionEn || section.descriptionPt;
    }
  };

  // Gérer la sélection d'une section
  const handleSelect = (section) => {
    setSearchTerm(getSectionName(section));
    setIsOpen(false);
    if (onSelect) {
      onSelect(section);
    }
    if (onChange) {
      onChange(section.id);
    }
  };

  // Gérer le changement de texte
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsOpen(true);
    if (onChange) {
      onChange(value);
    }
  };

  // Gérer les clics en dehors du composant
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Gérer les touches du clavier
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter' && filteredSections.length === 1) {
      handleSelect(filteredSections[0]);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-vih-primary focus:border-transparent ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-vih-primary"></div>
          </div>
        )}
        {!loading && (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg 
              className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      {isOpen && (
        <div 
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {filteredSections.length === 0 ? (
            <div className="px-3 py-2 text-gray-500 text-sm">
              {loading ? 'Chargement...' : 'Aucune section trouvée'}
            </div>
          ) : (
            filteredSections.map((section) => (
              <div
                key={section.id}
                onClick={() => handleSelect(section)}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{section.icone || '📁'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {getSectionName(section)}
                    </div>
                    {getSectionDescription(section) && (
                      <div className="text-sm text-gray-500 truncate">
                        {getSectionDescription(section)}
                      </div>
                    )}
                    <div className="text-xs text-gray-400">
                      Code: {section.code}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default SectionAutocomplete;
