import React, { useState, useEffect } from 'react';
import { Search, User, FileText, Calendar, Phone, Mail, MapPin, ChevronRight, Check, Loader } from 'lucide-react';
import { searchPatients } from '../services/patientService';
import { getPatientWithDossier } from '../services/patientService';
import { getDoctorsByHospital, getCurrentDoctor } from '../services/doctorService';
import referenceDossierService from '../services/referenceDossierService';
import { getTranslation } from '../utils/translations';
import { normalizeDoctorsList } from '../utils/doctorMapper';

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

  // États pour le flux en 3 étapes
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDossier, setSelectedDossier] = useState(null);
  const [medecins, setMedecins] = useState([]);
  const [selectedMedecin, setSelectedMedecin] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingMedecins, setLoadingMedecins] = useState(false);

  // États pour le formulaire de référence
  const [formData, setFormData] = useState({
    codeReference: '',
    codeDossier: '',
    codePatient: '',
    nomPatient: '',
    prenomPatient: '',
    codeHopital: initialHopital?.id || '',
    nomHopital: initialHopital?.nom || '',
    codeDocteur: '',
    nomDocteur: '',
    motifReference: '',
    typeReference: '',
    dateReference: new Date().toISOString().split('T')[0],
    observations: '',
    codeReferenceur: '',
    nomReferenceur: '',
    telephoneReferenceur: '',
    emailReferenceur: ''
  });

  // Types de référence
  const typesReference = [
    { value: 'EXAMEN', label: 'Examen' },
    { value: 'TRAITEMENT', label: 'Traitement' },
    { value: 'AVIS', label: 'Avis Spécialisé' },
    { value: 'URGENCE', label: 'Urgence' },
    { value: 'SUIVI', label: 'Suivi' }
  ];

  useEffect(() => {
    if (searchTerm.length >= 2) {
      searchPatientsData();
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (initialHopital && currentStep === 2) {
      fetchMedecins();
    }
  }, [initialHopital, currentStep]);

  const fetchCurrentUser = async () => {
    try {
      const user = await getCurrentDoctor();
      setCurrentUser(user);
      setFormData(prev => ({
        ...prev,
        codeReferenceur: user.codeDocteur || user.id || '',
        nomReferenceur: `${user.prenom || ''} ${user.nom || ''}`.trim() || user.username || '',
        telephoneReferenceur: user.telephone || '',
        emailReferenceur: user.email || ''
      }));
    } catch (err) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', err);
    }
  };

  const fetchMedecins = async () => {
    if (!initialHopital?.id) return;
    
    try {
      setLoadingMedecins(true);
      const doctorsData = await getDoctorsByHospital(initialHopital.id);
      const normalizedDoctors = normalizeDoctorsList(doctorsData);
      setMedecins(normalizedDoctors);
    } catch (err) {
      console.error('Erreur lors de la récupération des médecins:', err);
      setError('Impossible de charger les médecins de cet hôpital');
    } finally {
      setLoadingMedecins(false);
    }
  };

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
      setLoadingDossiers(true);
      setError(null);
      
      // Charger le dossier du patient avec getPatientWithDossier
      const dossierData = await getPatientWithDossier(patient.codePatient);
      
      setSelectedDossier(dossierData);
      setFormData(prev => ({
        ...prev,
        codePatient: patient.codePatient,
        nomPatient: patient.nomUtilisateur || '',
        prenomPatient: patient.prenomUtilisateur || '',
        codeDossier: dossierData?.codeDossier || ''
      }));
      
      if (onPatientSelect) {
        onPatientSelect(patient);
      }
    } catch (err) {
      console.error('Erreur lors du chargement du dossier:', err);
      setError('Erreur lors du chargement du dossier patient');
    } finally {
      setLoadingDossiers(false);
    }
  };

  const handleMedecinSelect = (medecin) => {
    setSelectedMedecin(medecin);
    setFormData(prev => ({
      ...prev,
      codeDocteur: medecin.codeDocteur,
      nomDocteur: `${medecin.prenom} ${medecin.nom}`.trim()
    }));
    setCurrentStep(3); // Passer à l'étape des détails de référence
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validation
      if (!formData.codePatient || !formData.codeHopital || !formData.codeDocteur || !formData.motifReference || !formData.typeReference) {
        setError('Veuillez remplir tous les champs obligatoires');
        return;
      }

      // Créer la référence
      const referenceData = {
        codePatient: formData.codePatient,
        codeHopital: formData.codeHopital,
        codeDocteur: formData.codeDocteur,
        motifReference: formData.motifReference,
        typeReference: formData.typeReference,
        dateReference: formData.dateReference,
        observations: formData.observations,
        codeReferenceur: formData.codeReferenceur,
        telephoneReferenceur: formData.telephoneReferenceur,
        emailReferenceur: formData.emailReferenceur
      };

      const result = await referenceDossierService.createReference(referenceData);
      
      if (onReferenceCreate) {
        onReferenceCreate(result);
      }
    } catch (err) {
      console.error('Erreur lors de la création de la référence:', err);
      setError('Erreur lors de la création de la référence: ' + (err.message || 'Erreur inconnue'));
    } finally {
      setLoading(false);
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
                  {selectedPatient.nom || selectedPatient.nomUtilisateur || '-'} {selectedPatient.prenom || selectedPatient.prenomUtilisateur || '-'}
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

      {/* Étape 1: Patient sélectionné et son dossier */}
      {selectedPatient && currentStep === 1 && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            👤 {getTranslation("patientSelectionne", language) || "Patient sélectionné"}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <strong>Nom:</strong> {selectedPatient.nomUtilisateur} {selectedPatient.prenomUtilisateur}
            </div>
            <div>
              <strong>Code:</strong> {selectedPatient.codePatient}
            </div>
            <div>
              <strong>Âge:</strong> {calculateAge(selectedPatient.dateNaissance)} ans
            </div>
            <div>
              <strong>Sexe:</strong> {selectedPatient.sexe}
            </div>
            <div>
              <strong>Téléphone:</strong> {selectedPatient.telephone}
            </div>
            <div>
              <strong>Email:</strong> {selectedPatient.email || '-'}
            </div>
          </div>
          
          {/* Dossier du patient */}
          {selectedDossier && (
            <div className="mt-4 p-3 bg-gray-50 rounded border">
              <h5 className="font-medium text-gray-900 mb-2">📁 {getTranslation("selectionnerDossier", language) || "Dossier sélectionné"}</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div><strong>Code Dossier:</strong> {selectedDossier.codeDossier}</div>
                <div><strong>Date:</strong> {selectedDossier.date || '-'}</div>
              </div>
            </div>
          )}
          
          {/* Actions */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setCurrentStep(2)}
              disabled={!selectedDossier}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant → Sélectionner un médecin
            </button>
          </div>
        </div>
      )}

      {/* Étape 2: Sélection du médecin */}
      {currentStep === 2 && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🩺 Sélectionner un médecin à {initialHopital?.nom}
          </h2>
          
          {selectedPatient && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <p className="font-medium text-blue-900">Patient sélectionné:</p>
              <p className="text-blue-700">
                {selectedPatient.nomUtilisateur} {selectedPatient.prenomUtilisateur} ({selectedPatient.codePatient})
              </p>
            </div>
          )}

          {loadingMedecins && (
            <div className="text-center py-8">
              <Loader className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
              <p className="text-gray-500">Chargement des médecins...</p>
            </div>
          )}

          {medecins.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Médecins disponibles ({medecins.length})</h4>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {medecins.map((medecin) => (
                  <div
                    key={medecin.codeDocteur}
                    onClick={() => handleMedecinSelect(medecin)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedMedecin?.codeDocteur === medecin.codeDocteur
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          Dr {medecin.prenom} {medecin.nom}
                        </p>
                        <p className="text-sm text-gray-500">
                          {medecin.specialite || 'Médecin'} | {medecin.telephone || '-'}
                        </p>
                      </div>
                      {selectedMedecin?.codeDocteur === medecin.codeDocteur && (
                        <Check className="h-5 w-5 text-blue-600" />
                      )}
                      {selectedMedecin?.codeDocteur !== medecin.codeDocteur && (
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Étape 3: Détails de la référence */}
      {currentStep === 3 && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            📋 Détails de la référence
          </h2>
          
          {/* Récapitulatif */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-2">
            <p><strong>Patient:</strong> {selectedPatient?.nomUtilisateur} {selectedPatient?.prenomUtilisateur}</p>
            <p><strong>Hôpital de destination:</strong> {initialHopital?.nom}</p>
            <p><strong>Médecin destinataire:</strong> Dr {selectedMedecin?.prenom} {selectedMedecin?.nom}</p>
          </div>

          {/* Motif */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motif de la référence <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.motifReference}
              onChange={(e) => setFormData(prev => ({ ...prev, motifReference: e.target.value }))}
              placeholder="Décrivez le motif de la référence..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Type de référence */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de référence <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.typeReference}
              onChange={(e) => setFormData(prev => ({ ...prev, typeReference: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Sélectionner un type</option>
              {typesReference.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date de référence */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de la référence <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.dateReference}
              onChange={(e) => setFormData(prev => ({ ...prev, dateReference: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Observations */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observations
            </label>
            <textarea
              value={formData.observations}
              onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
              placeholder="Ajoutez des observations supplémentaires..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Bouton Créer la référence */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={loading || !formData.motifReference || !formData.typeReference || !formData.dateReference}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading && <Loader className="h-4 w-4 animate-spin" />}
              <span>📋 {getTranslation("creerReferenceDossier", language) || "Créer une Référence de Dossier"}</span>
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
