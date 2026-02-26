import React, { useState } from 'react';
import { Button, Input, Select } from './common';
import SectionSelector from './SectionSelector';

const TopicFilters = ({ 
  filters, 
  onFiltersChange, 
  onReset, 
  showSectionFilter = true,
  showStatusFilter = true,
  showAuthorFilter = false,
  className = ""
}) => {
  const [localFilters, setLocalFilters] = useState(filters || {});

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    setLocalFilters({});
    onReset();
  };

  const statusOptions = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'active', label: '🟢 Actifs seulement' },
    { value: 'inactive', label: '🔴 Inactifs seulement' }
  ];

  const sortOptions = [
    { value: 'recent', label: 'Plus récents' },
    { value: 'popular', label: 'Plus populaires' },
    { value: 'active', label: 'Plus actifs' },
    { value: 'alphabetical', label: 'Alphabétique' }
  ];

  return (
    <div className={`bg-white p-4 rounded-lg shadow-sm border ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Recherche par titre/contenu */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Recherche
          </label>
          <Input
            placeholder="Rechercher dans les sujets..."
            value={localFilters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full"
          />
        </div>

        {/* Filtre par section */}
        {showSectionFilter && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Section
            </label>
            <SectionSelector
              selectedSection={localFilters.section}
              onSectionSelect={(sectionId) => handleFilterChange('section', sectionId)}
              className="w-full"
            />
          </div>
        )}

        {/* Filtre par statut */}
        {showStatusFilter && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <Select
              value={localFilters.status || 'all'}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              options={statusOptions}
              className="w-full"
            />
          </div>
        )}

        {/* Tri */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Trier par
          </label>
          <Select
            value={localFilters.sort || 'recent'}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            options={sortOptions}
            className="w-full"
          />
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          {Object.values(localFilters).filter(v => v && v !== 'all').length > 0 && (
            <span>
              {Object.values(localFilters).filter(v => v && v !== 'all').length} filtre(s) actif(s)
            </span>
          )}
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={Object.values(localFilters).filter(v => v && v !== 'all').length === 0}
          >
            🔄 Réinitialiser
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TopicFilters;

































