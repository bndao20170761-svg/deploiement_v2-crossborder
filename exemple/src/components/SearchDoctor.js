// src/components/SearchDoctor.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Search, Stethoscope, Check, Loader } from 'lucide-react';

const SearchDoctor = ({ doctors, onSelect, selectedDoctor }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const searchContainerRef = useRef(null);

  // Filtrage médecins
  useEffect(() => {
    if (searchTerm.trim().length > 1) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        const filtered = doctors.filter((doctor) =>
          (`${doctor.nomUtilisateur || ''} ${doctor.prenomUtilisateur || ''}`)
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        );
        setSearchResults(filtered);
        setIsSearching(false);
        setIsDropdownOpen(filtered.length > 0);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setIsSearching(false);
      setIsDropdownOpen(false);
    }
  }, [searchTerm, doctors]);

  // Fermer dropdown si clic en dehors ou Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
        setShowDetails(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  const handleDoctorSelect = (doctor) => {
    setShowDetails(false);
    setSearchTerm('');
    setSearchResults([]);
    setIsDropdownOpen(false);
    if (onSelect) onSelect(doctor); // on notifie le parent
  };

  const handleLoadDetails = () => {
    setIsLoadingDetails(true);
    setTimeout(() => {
      setShowDetails(true);
      setIsLoadingDetails(false);
    }, 500);
  };

  const handleCloseDetails = () => setShowDetails(false);

  return (
    <div className="space-y-4" ref={searchContainerRef}>
      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Rechercher un médecin par nom ou prénom..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader className="animate-spin h-5 w-5 text-green-500" />
          </div>
        )}

        {isDropdownOpen && searchResults.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {searchResults.map((doctor) => (
              <div
                key={doctor.codeDoctor}
                className="w-full px-4 py-3 text-left hover:bg-green-50 flex items-center justify-between border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center space-x-3">
                  <Stethoscope className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {doctor.nomUtilisateur} {doctor.prenomUtilisateur}
                    </div>
                    <div className="text-sm text-gray-500">
                      {doctor.fonction || 'Spécialité inconnue'} • {doctor.lieuExercice || 'Lieu non spécifié'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDoctorSelect(doctor)}
                  className="text-green-600 hover:underline font-medium"
                >
                  Sélectionner
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bloc médecin sélectionné */}
      {selectedDoctor && !showDetails && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-green-900">Médecin sélectionné</h3>
          </div>
          <p className="text-green-800 font-medium">
            {selectedDoctor.nomUtilisateur} {selectedDoctor.prenomUtilisateur}
          </p>
          <p className="text-green-600 text-sm">
            {selectedDoctor.fonction || 'Spécialité inconnue'} • {selectedDoctor.lieuExercice || 'Lieu non spécifié'}
          </p>

          <button
            onClick={handleLoadDetails}
            className="mt-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Voir détails complets
          </button>
        </div>
      )}

      {/* Bloc chargement détails */}
      {isLoadingDetails && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-center">
          <Loader className="animate-spin h-6 w-6 text-green-500" />
          <span className="ml-2 text-green-700">Chargement des détails...</span>
        </div>
      )}

      {/* Bloc détails complets */}
      {selectedDoctor && showDetails && !isLoadingDetails && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-green-900">Détails du médecin</h3>
            <button
              onClick={handleCloseDetails}
              className="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
            >
              Fermer
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom</label>
              <input type="text" value={selectedDoctor.nomUtilisateur} readOnly className="mt-1 block w-full border border-gray-300 rounded-md bg-gray-100 p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Prénom</label>
              <input type="text" value={selectedDoctor.prenomUtilisateur} readOnly className="mt-1 block w-full border border-gray-300 rounded-md bg-gray-100 p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Spécialité</label>
              <input type="text" value={selectedDoctor.fonction || 'Non spécifiée'} readOnly className="mt-1 block w-full border border-gray-300 rounded-md bg-gray-100 p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Lieu d'exercice</label>
              <input type="text" value={selectedDoctor.lieuExercice || 'Non spécifié'} readOnly className="mt-1 block w-full border border-gray-300 rounded-md bg-gray-100 p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Téléphone</label>
              <input type="text" value={selectedDoctor.telephone || 'Non spécifié'} readOnly className="mt-1 block w-full border border-gray-300 rounded-md bg-gray-100 p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="text" value={selectedDoctor.email || 'Non spécifié'} readOnly className="mt-1 block w-full border border-gray-300 rounded-md bg-gray-100 p-2" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchDoctor;