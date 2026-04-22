import React, { useState, useEffect, useRef } from 'react';
import { Search, User, Check, Loader } from 'lucide-react';

const SearchPatient = ({ patients, onSelect, selectedPatient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const searchContainerRef = useRef(null);

  // 🔹 Quand un patient est déjà sélectionné (depuis localStorage), afficher son nom
  useEffect(() => {
    if (selectedPatient) {
      setSearchTerm(`${selectedPatient.nom} ${selectedPatient.prenom}`);
    }
  }, [selectedPatient]);

  // Recherche
  useEffect(() => {
    if (searchTerm.trim().length > 1) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        const filtered = patients.filter((patient) =>
          (`${patient.nom || ''} ${patient.prenom || ''}`)
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
  }, [searchTerm, patients]);

  // Gérer clic extérieur et échap
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

  // Sélectionner un patient
  const handlePatientSelect = (patient) => {
    setShowDetails(false);
    setSearchTerm('');
    setSearchResults([]);
    setIsDropdownOpen(false);
    if (onSelect) onSelect(patient); // 🔹 prop -> mise à jour wizardData
  };

  // Gestion affichage détails
  const handleLoadDetails = () => {
    setIsLoadingDetails(true);
    setTimeout(() => {
      setShowDetails(true);
      setIsLoadingDetails(false);
    }, 500);
  };
  const handleCloseDetails = () => setShowDetails(false);

  // Calcul âge
  const calculateAge = (birthdate) => {
    if (!birthdate) return '-';
    const birth = new Date(birthdate);
    if (isNaN(birth.getTime())) return '-';
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  return (
    <div className="space-y-4" ref={searchContainerRef}>
      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Rechercher un patient par nom ou prénom..."
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
            {searchResults.map((patient) => (
              <div
                key={patient.codePatient}
                className="w-full px-4 py-3 text-left hover:bg-green-50 flex items-center justify-between border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {patient.nom} {patient.prenom}
                    </div>
                    <div className="text-sm text-gray-500">
                      {calculateAge(patient.dateNaissance)} ans • {patient.telephone || 'Non spécifié'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handlePatientSelect(patient)}
                  className="text-green-600 hover:underline font-medium"
                >
                  Sélectionner
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bloc patient sélectionné */}
      {selectedPatient && !showDetails && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-green-900">Patient sélectionné</h3>
          </div>
          <p className="text-green-800 font-medium">
            {selectedPatient.nom} {selectedPatient.prenom}
          </p>
          <p className="text-green-600 text-sm">
            {calculateAge(selectedPatient.dateNaissance)} ans • {selectedPatient.telephone || 'Non spécifié'}
          </p>

          <button
            onClick={handleLoadDetails}
            className="mt-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Voir détails complets
          </button>
        </div>
      )}

      {/* Bloc détails complet */}
      {isLoadingDetails && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-center">
          <Loader className="animate-spin h-6 w-6 text-green-500" />
          <span className="ml-2 text-green-700">Chargement des détails...</span>
        </div>
      )}

      {selectedPatient && showDetails && !isLoadingDetails && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-green-900">Détails du patient</h3>
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
              <input type="text" value={selectedPatient.nom} readOnly className="mt-1 block w-full border border-gray-300 rounded-md bg-gray-100 p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Prénom</label>
              <input type="text" value={selectedPatient.prenom} readOnly className="mt-1 block w-full border border-gray-300 rounded-md bg-gray-100 p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date de naissance</label>
              <input type="text" value={selectedPatient.dateNaissance} readOnly className="mt-1 block w-full border border-gray-300 rounded-md bg-gray-100 p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Âge</label>
              <input type="text" value={calculateAge(selectedPatient.dateNaissance)} readOnly className="mt-1 block w-full border border-gray-300 rounded-md bg-gray-100 p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Sexe</label>
              <input type="text" value={selectedPatient.genre || 'Non spécifié'} readOnly className="mt-1 block w-full border border-gray-300 rounded-md bg-gray-100 p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Téléphone</label>
              <input type="text" value={selectedPatient.telephone || 'Non spécifié'} readOnly className="mt-1 block w-full border border-gray-300 rounded-md bg-gray-100 p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Adresse</label>
              <input type="text" value={selectedPatient.adresse || 'Non spécifiée'} readOnly className="mt-1 block w-full border border-gray-300 rounded-md bg-gray-100 p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Profession</label>
              <input type="text" value={selectedPatient.profession || 'Non spécifiée'} readOnly className="mt-1 block w-full border border-gray-300 rounded-md bg-gray-100 p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Statut matrimonial</label>
              <input type="text" value={selectedPatient.statut || 'Non spécifié'} readOnly className="mt-1 block w-full border border-gray-300 rounded-md bg-gray-100 p-2" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPatient;