import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, User, FileText, Hospital, Calendar, MessageSquare, Check, X, Loader, ChevronRight } from 'lucide-react';
import referenceDossierService from '../services/referenceDossierService';
import * as patientService from '../services/patientService';
import { getPatientWithDossier } from '../services/patientService';
import { getDoctorsByHospital, getCurrentDoctor } from '../services/doctorService';
import { getTranslation } from '../utils/translations';
import { normalizeDoctorsList } from '../utils/doctorMapper';

const CreateReferenceFromMap = ({ language = "fr", onBack, onComplete, selectedHospital }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // États pour les données
  const [formData, setFormData] = useState({
    codeReference: '',
    codeDossier: '',
    codePatient: '',
    nomPatient: '',
    prenomPatient: '',
    codeHopital: selectedHospital?.id || '',
    nomHopital: selectedHospital?.nom || '',
    codeDocteur: '',
    nomDocteur: '',
    motifReference: '',
    typeReference: '',
    dateReference: new Date().toISOString().split('T')[0], // Date du jour par défaut
    observations: '',
    codeReferenceur: '',
    nomReferenceur: '',
    telephoneReferenceur: '',
    emailReferenceur: ''
  });

  // États pour la recherche
  const [searchPatient, setSearchPatient] = useState('');
  const [patientResults, setPatientResults] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDossier, setSelectedDossier] = useState(null);
  const [selectedMedecin, setSelectedMedecin] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Types de référence
  const typesReference = [
    { value: 'EXAMEN', label: 'Examen' },
    { value: 'TRAITEMENT', label: 'Traitement' },
    { value: 'AVIS', label: 'Avis Spécialisé' },
    { value: 'URGENCE', label: 'Urgence' },
    { value: 'SUIVI', label: 'Suivi' }
  ];

  useEffect(() => {
    if (selectedHospital) {
      setFormData(prev => ({
        ...prev,
        codeHopital: selectedHospital.id,
        nomHopital: selectedHospital.nom
      }));
      fetchMedecins();
    }
    fetchCurrentUser();
  }, [selectedHospital]);

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
    if (!selectedHospital?.id) return;
    
    try {
      setLoading(true);
      const doctorsData = await getDoctorsByHospital(selectedHospital.id);
      const normalizedDoctors = normalizeDoctorsList(doctorsData);
      setMedecins(normalizedDoctors);
    } catch (err) {
      console.error('Erreur lors de la récupération des médecins:', err);
      setError('Impossible de charger les médecins de cet hôpital');
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSearch = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setPatientResults([]);
      return;
    }

    try {
      setLoading(true);
      const patients = await patientService.searchPatients(searchTerm);
      setPatientResults(patients || []);
    } catch (err) {
      console.error('Erreur lors de la recherche de patients:', err);
      setError('Erreur lors de la recherche de patients');
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSelect = async (patient) => {
    try {
      setLoading(true);
      setSelectedPatient(patient);
      
      // Extraire le codePatient du codeDossier
      const codePatient = patient.codePatient;
      
      // Charger le dossier du patient avec getPatientWithDossier
      const dossierData = await getPatientWithDossier(codePatient);
      
      setSelectedDossier(dossierData);
      setFormData(prev => ({
        ...prev,
        codePatient: patient.codePatient,
        nomPatient: patient.nomUtilisateur || '',
        prenomPatient: patient.prenomUtilisateur || '',
        codeDossier: dossierData?.codeDossier || ''
      }));
      
      setCurrentStep(2); // Passer à l'étape de sélection du médecin
    } catch (err) {
      console.error('Erreur lors de la sélection du patient:', err);
      setError('Erreur lors du chargement du dossier patient');
    } finally {
      setLoading(false);
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
      
      if (onComplete) {
        onComplete(result);
      }
    } catch (err) {
      console.error('Erreur lors de la création de la référence:', err);
      setError('Erreur lors de la création de la référence: ' + (err.message || 'Erreur inconnue'));
    } finally {
      setLoading(false);
    }
  };

  const renderPatientSearch = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🔍 Rechercher un patient
        </h3>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchPatient}
            onChange={(e) => {
              setSearchPatient(e.target.value);
              handlePatientSearch(e.target.value);
            }}
            placeholder="Rechercher par nom, prénom ou code patient..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {loading && (
            <div className="absolute right-3 top-3">
              <Loader className="h-4 w-4 animate-spin text-blue-500" />
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Résultats de recherche */}
      {patientResults.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Patients trouvés ({patientResults.length})</h4>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {patientResults.map((patient) => (
              <div
                key={patient.codePatient}
                onClick={() => handlePatientSelect(patient)}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <User className="h-8 w-8 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {patient.nomUtilisateur} {patient.prenomUtilisateur}
                      </p>
                      <p className="text-sm text-gray-500">
                        Code: {patient.codePatient} | Âge: {patient.age || '-'} ans | 
                        Sexe: {patient.sexe || '-'} | Téléphone: {patient.telephone || '-'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Email: {patient.email || '-'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {searchPatient.length >= 2 && patientResults.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          Aucun patient trouvé pour "{searchPatient}"
        </div>
      )}
    </div>
  );

  const renderMedecinSelection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🩺 Sélectionner un médecin à {selectedHospital?.nom}
        </h3>
        
        {selectedPatient && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <p className="font-medium text-blue-900">Patient sélectionné:</p>
            <p className="text-blue-700">
              {selectedPatient.nomUtilisateur} {selectedPatient.prenomUtilisateur} ({selectedPatient.codePatient})
            </p>
          </div>
        )}
      </div>

      {loading && (
        <div className="text-center py-8">
          <Loader className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
          <p className="text-gray-500">Chargement des médecins...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
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
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
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
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {medecins.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          Aucun médecin disponible à cet hôpital
        </div>
      )}
    </div>
  );

  const renderReferenceDetails = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📋 Détails de la référence
        </h3>
        
        {/* Récapitulatif */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-2">
          <p><strong>Patient:</strong> {selectedPatient?.nomUtilisateur} {selectedPatient?.prenomUtilisateur}</p>
          <p><strong>Hôpital de destination:</strong> {selectedHospital?.nom}</p>
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
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return renderPatientSearch();
      case 2:
        return renderMedecinSelection();
      case 3:
        return renderReferenceDetails();
      default:
        return renderPatientSearch();
    }
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return selectedPatient !== null;
      case 2:
        return selectedMedecin !== null;
      case 3:
        return formData.motifReference && formData.typeReference && formData.dateReference;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canGoNext() && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Retour</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Référencer un patient pour {selectedHospital?.nom}
                </h1>
                <p className="text-gray-600">
                  {selectedHospital?.adresse}, {selectedHospital?.region}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Patient</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-4">
              <div
                className={`h-1 bg-blue-600 transition-all duration-300 ${
                  currentStep >= 2 ? 'w-full' : 'w-0'
                }`}
              />
            </div>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Médecin</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-4">
              <div
                className={`h-1 bg-blue-600 transition-all duration-300 ${
                  currentStep >= 3 ? 'w-full' : 'w-0'
                }`}
              />
            </div>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                3
              </div>
              <span className="ml-2 text-sm font-medium">Détails</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <div>
            {currentStep > 1 && (
              <button
                onClick={handlePrevious}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Précédent
              </button>
            )}
          </div>
          <div className="flex space-x-3">
            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                disabled={!canGoNext() || loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canGoNext() || loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading && <Loader className="h-4 w-4 animate-spin" />}
                <span>Créer la référence</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateReferenceFromMap;
