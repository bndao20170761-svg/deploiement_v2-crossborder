import React, { useState, useEffect } from 'react';
import { sectionsService } from '../services/api';

const SectionSelector = ({ selectedSection, onSectionSelect, className = "" }) => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        setLoading(true);
        const data = await sectionsService.getAllSections();
        setSections(data);
      } catch (err) {
        console.error('Erreur lors de la récupération des sections:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSections();
  }, []);

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="animate-pulse bg-gray-200 h-10 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <div className="text-red-500 text-sm">
          Erreur lors du chargement des sections
        </div>
      </div>
    );
  }

  return (
    <select
      value={selectedSection || ''}
      onChange={(e) => onSectionSelect(e.target.value)}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vih-primary focus:border-transparent ${className}`}
    >
      <option value="">Sélectionner une section</option>
      {sections.map((section) => (
        <option key={section.id} value={section.id}>
          {section.nomFr || section.nomEn || section.code}
        </option>
      ))}
    </select>
  );
};

export default SectionSelector;

































