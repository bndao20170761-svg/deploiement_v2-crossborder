import React, { useState, useEffect } from 'react';
import { Search, User, FileText, Calendar, Phone, Mail, MapPin } from 'lucide-react';
import { searchPatients } from '../services/patientService';
import referenceDossierService from '../services/referenceDossierService';
import { getTranslation } from '../utils/translations';

const SearchPatientNew = ({ 
  language = "fr", 
  onPatientSelect, 
  onDossierSelect,
  onReferenceCreate,
  initialHopital = null 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDossiers, setPatientDossiers] = useState([]);
  const [loadingDossiers, setLoadingDossiers] = useState(false);
  const [showDossierSelection, setShowDossierSelection] = useState(false);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      searchPatientsData();
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const searchPatientsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const patients = await searchPatients(searchTerm);
      setSearchResults(patients || []);
    } catch (err) {
      console.error('Erreur lors de la recherche de patients:', err);
      setError('Erreur lors de la recherche de patients');
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSelect = async (patient) => {
    try {
      setSelectedPatient(patient);
      setShowDossierSelection(true);
      
      // Récupérer les dossiers du patient depuis gestion-patient
      setLoadingDossiers(true);
      const dossiers = await referenceDossierService.getDossiersByPatientFromGestionPatient(patient.codePatient);
      setPatientDossiers(dossiers || []);
      setLoadingDossiers(false);
      
      setSearchTerm('');
      setSearchResults([]);
    } catch (err) {
      console.error('Erreur lors de la récupération des dossiers:', err);
      setError('Impossible de récupérer les dossiers du patient');
      setLoadingDossiers(false);
    }
  };

  const handleDossierSelect = (dossier) => {
    if (onDossierSelect) {
      onDossierSelect(dossier);
    }
  };

  const handleCreateReference = (patient, dossier, hopital) => {
    if (onReferenceCreate) {
      onReferenceCreate({
        patient,
        dossier,
        hopital
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const calculateAge = (dateNaissance) => {
    if (!dateNaissance) return null;
    
    const birth = new Date(dateNaissance);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* En-tête */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">
            🔍 {getTranslation("rechercherPatient", language) || "Rechercher un Patient"}
          </h1>
          <button
            onClick={() => {
              setSelectedPatient(null);
              setShowDossierSelection(false);
              setPatientDossiers([]);
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            ← {getTranslation("retour", language) || "Retour"}
          </button>
        </div>

        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={getTranslation("rechercherPatientPlaceholder", language) || "Tapez le nom, prénom ou code du patient..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
            autoFocus
          />
        </div>

        {/* Indicateur de chargement */}
        {loading && (
          <div className="mt-4 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-gray-600">Recherche en cours...</span>
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">❌ {error}</p>
          </div>
        )}
      </div>

      {/* Résultats de recherche */}
      {searchResults.length > 0 && !selectedPatient && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            📋 {getTranslation("resultatsRecherche", language) || "Résultats de recherche"}
          </h2>
          
          <div className="space-y-3">
            {searchResults.map((patient) => (
              <div
                key={patient.codePatient}
                onClick={() => handlePatientSelect(patient)}
                className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {patient.nomUtilisateur} {patient.prenomUtilisateur}
                      </div>
                      <div className="text-sm text-gray-500">
                        {patient.codePatient}
                      </div>
                      <div className="text-sm text-gray-500">
                        {calculateAge(patient.dateNaissance)} ans
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    {formatDate(patient.dateCreation)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Patient sélectionné */}
      {selectedPatient && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            👤 {getTranslation("patientSelectionne", language) || "Patient Sélectionné"}
          </h2>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="text-lg font-medium text-gray-900">
                  {selectedPatient.nomUtilisateur} {selectedPatient.prenomUtilisateur}
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div><strong>Code:</strong> {selectedPatient.codePatient}</div>
                  <div><strong>Âge:</strong> {calculateAge(selectedPatient.dateNaissance)} ans</div>
                  <div><strong>Sexe:</strong> {selectedPatient.sexe}</div>
                  <div><strong>Téléphone:</strong> {selectedPatient.telephone || '-'}</div>
                  <div><strong>Email:</strong> {selectedPatient.email || '-'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sélection de dossier */}
      {showDossierSelection && selectedPatient && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            📁 {getTranslation("selectionnerDossier", language) || "Sélectionner un Dossier"}
          </h2>

          {/* Chargement des dossiers */}
          {loadingDossiers ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-gray-600">
                {getTranslation("chargementDossiers", language) || "Chargement des dossiers..."}
              </span>
            </div>
          ) : patientDossiers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>
                {getTranslation("aucunDossier", language) || "Aucun dossier trouvé pour ce patient"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {patientDossiers.map((dossier) => (
                <div
                  key={dossier.codeDossier}
                  onClick={() => handleDossierSelect(dossier)}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <FileText className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {getTranslation("dossier", language) || "Dossier"} {dossier.codeDossier}
                        </div>
                        <div className="text-sm text-gray-500">
                          {dossier.doctorCreateNom || '-'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(dossier.dateCreation)}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">
                      {new Date(dossier.dateCreation).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions finales */}
      {selectedPatient && showDossierSelection && patientDossiers.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🎯 {getTranslation("actions", language) || "Actions"}
          </h2>
          
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              {getTranslation("referenceDossierInstruction", language) || "Cliquez sur le bouton ci-dessous pour créer une référence de dossier pour ce patient"}
            </p>
            
            <button
              onClick={() => handleCreateReference(selectedPatient, patientDossiers[0], initialHopital)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 text-lg font-medium flex items-center mx-auto"
            >
              📋 {getTranslation("creerReferenceDossier", language) || "Créer une Référence de Dossier"}
            </button>
          </div>
        </div>
      )}

      {/* Aucun résultat */}
      {searchResults.length === 0 && searchTerm.length >= 2 && !loading && !selectedPatient && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center py-8 text-gray-500">
            <User className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>
              {getTranslation("aucunPatientTrouve", language) || "Aucun patient trouvé pour cette recherche"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPatientNew;
