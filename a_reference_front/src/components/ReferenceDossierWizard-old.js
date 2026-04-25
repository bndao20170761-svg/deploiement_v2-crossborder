import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, User, FileText, Hospital, Calendar, MessageSquare, Check, X, Eye, EyeOff, Loader } from 'lucide-react';
import referenceDossierService from '../services/referenceDossierService';
import * as patientService from '../services/patientService';
import { getAllHospitals, getHopitauxActifs, getPrestatairesByHopital } from '../services/hopitalService';
import { getCurrentDoctor, getDoctorsByHospital, getDoctorById } from '../services/doctorService';
import { getTranslation } from '../utils/translations';
import PatientView from './PatientView';
import DossierView from './DossierView';

const ReferenceDossierWizard = ({ language = "fr", onBack, onComplete, initialData = null }) => {
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
    codeHopital: '',
    nomHopital: '',
    codeDocteur: '',
    nomDocteur: '',
    motifReference: '',
    typeReference: '',
    dateReference: '',
    observations: '',
    codeReferenceur: '',
    nomReferenceur: '',
    telephoneReferenceur: '',
    emailReferenceur: ''
  });

  // États pour la recherche
  const [searchPatient, setSearchPatient] = useState('');
  const [searchDossier, setSearchDossier] = useState('');
  const [patientResults, setPatientResults] = useState([]);
  const [dossierResults, setDossierResults] = useState([]);
  const [hopitaux, setHopitaux] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDossier, setSelectedDossier] = useState(null);
  const [selectedHopital, setSelectedHopital] = useState(null);
  const [selectedMedecin, setSelectedMedecin] = useState(null);
  
  // États pour les détails et visibilité
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [showDossierDetails, setShowDossierDetails] = useState(false);
  const [showHopitalDetails, setShowHopitalDetails] = useState(false);
  const [showMedecinDetails, setShowMedecinDetails] = useState(false);
  const [currentDoctor, setCurrentDoctor] = useState(null);
  const [loadingDossiers, setLoadingDossiers] = useState(false);
  const [loadingMedecins, setLoadingMedecins] = useState(false);
  
  // États pour les vues modales
  const [patientViewModal, setPatientViewModal] = useState(false);
  const [dossierViewModal, setDossierViewModal] = useState(false);
  const [selectedPatientForView, setSelectedPatientForView] = useState(null);
  const [selectedDossierForView, setSelectedDossierForView] = useState(null);

  const totalSteps = 5;

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setCurrentStep(5); // Mode édition
    }
    fetchHopitaux();
    // Charger le docteur connecté
    loadCurrentDoctor();
  }, [initialData]);

  // Recherche de patients
  useEffect(() => {
    if (searchPatient.length >= 2) {
      searchPatients();
    } else {
      setPatientResults([]);
    }
  }, [searchPatient]);

  // Recherche de dossiers
  useEffect(() => {
    if (searchDossier.length >= 2 && selectedPatient) {
      searchDossiers();
    } else {
      setDossierResults([]);
    }
  }, [searchDossier, selectedPatient]);

  // Chargement des médecins quand un hôpital est sélectionné
  useEffect(() => {
    if (selectedHopital) {
      fetchMedecins();
    } else {
      setMedecins([]);
    }
  }, [selectedHopital]);

  const searchPatients = async () => {
    try {
      const patients = await patientService.searchPatients(searchPatient);
      setPatientResults(patients || []);
    } catch (err) {
      console.error('Erreur lors de la recherche de patients:', err);
    }
  };

  const searchDossiers = async () => {
    try {
      const dossiers = await referenceDossierService.getDossiersByPatientFromGestionPatient(selectedPatient.codePatient);
      setDossierResults(dossiers || []);
    } catch (err) {
      console.error('Erreur lors de la recherche de dossiers:', err);
    }
  };

  const fetchHopitaux = async () => {
    try {
      const data = await getHopitauxActifs();
      setHopitaux(data || []);
    } catch (err) {
      console.error('Erreur lors du chargement des hôpitaux:', err);
    }
  };

  const fetchMedecins = async () => {
    try {
      setLoadingMedecins(true);
      const data = await getDoctorsByHospital(selectedHopital.codeHopital);
      
      // Normaliser les données des médecins
      const normalizedMedecins = data?.map(medecin => ({
        ...medecin,
        prenomUtilisateur: medecin.utilisateur?.prenom || medecin.prenomUtilisateur || '',
        nomUtilisateur: medecin.utilisateur?.nom || medecin.nomUtilisateur || '',
        nomComplet: `${medecin.utilisateur?.prenom || medecin.prenomUtilisateur || ''} ${medecin.utilisateur?.nom || medecin.nomUtilisateur || ''}`.trim()
      })) || [];
      
      setMedecins(normalizedMedecins);
    } catch (err) {
      console.error('Erreur lors du chargement des médecins:', err);
    } finally {
      setLoadingMedecins(false);
    }
  };

  const loadCurrentDoctor = async () => {
    try {
      const doctor = await getCurrentDoctor();
      setCurrentDoctor(doctor);
      // Pré-remplir le formulaire avec le docteur connecté
      setFormData(prev => ({
        ...prev,
        codeDocteur: doctor.codeDocteur || doctor.codePrestataire,
        nomDocteur: doctor.nomDocteur || doctor.nomPrestataire || `${doctor.prenomUtilisateur} ${doctor.nomUtilisateur}`,
        codeReferenceur: doctor.codeDocteur || doctor.codePrestataire,
        nomReferenceur: doctor.nomDocteur || doctor.nomPrestataire || `${doctor.prenomUtilisateur} ${doctor.nomUtilisateur}`,
        telephoneReferenceur: doctor.telephone,
        emailReferenceur: doctor.email
      }));
    } catch (err) {
      console.error('Erreur lors du chargement du docteur connecté:', err);
    }
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setFormData(prev => ({
      ...prev,
      codePatient: patient.codePatient,
      nomPatient: patient.nomUtilisateur,
      prenomPatient: patient.prenomUtilisateur
    }));
    setSearchPatient('');
    setPatientResults([]);
    // Charger automatiquement les dossiers du patient
    if (patient.codePatient) {
      loadPatientDossiers(patient.codePatient);
    }
  };

  const loadPatientDossiers = async (codePatient) => {
    try {
      setLoadingDossiers(true);
      const dossiers = await referenceDossierService.getDossiersByPatientFromGestionPatient(codePatient);
      setDossierResults(dossiers || []);
      // Si un seul dossier, le sélectionner automatiquement
      if (dossiers && dossiers.length === 1) {
        setSelectedDossier(dossiers[0]);
        setFormData(prev => ({
          ...prev,
          codeDossier: dossiers[0].codeDossier
        }));
      }
    } catch (err) {
      console.error('Erreur lors du chargement des dossiers du patient:', err);
      setDossierResults([]);
    } finally {
      setLoadingDossiers(false);
    }
  };

  const handleDossierSelect = (dossier) => {
    setSelectedDossier(dossier);
    setFormData(prev => ({
      ...prev,
      codeDossier: dossier.codeDossier
    }));
    setSearchDossier('');
    setDossierResults([]);
  };

  const handleDossierUnselect = () => {
    setSelectedDossier(null);
    setFormData(prev => ({
      ...prev,
      codeDossier: ''
    }));
  };

  const handleHopitalUnselect = () => {
    setSelectedHopital(null);
    setMedecins([]);
    setSelectedMedecin(null);
    setFormData(prev => ({
      ...prev,
      codeHopital: '',
      nomHopital: '',
      codeDocteur: currentDoctor?.codeDocteur || '',
      nomDocteur: currentDoctor?.nomDocteur || ''
    }));
  };

  const handleMedecinUnselect = () => {
    setSelectedMedecin(null);
    setFormData(prev => ({
      ...prev,
      codeDocteur: currentDoctor?.codeDocteur || '',
      nomDocteur: currentDoctor?.nomDocteur || ''
    }));
  };

  // Fonctions pour les vues détaillées
  const handleViewPatient = (patient) => {
    setSelectedPatientForView(patient);
    setPatientViewModal(true);
  };

  const handleViewDossier = (dossier) => {
    setSelectedDossierForView(dossier);
    setDossierViewModal(true);
  };

  const closePatientView = () => {
    setPatientViewModal(false);
    setSelectedPatientForView(null);
  };

  const closeDossierView = () => {
    setDossierViewModal(false);
    setSelectedDossierForView(null);
  };

  const handleHopitalSelect = (hopital) => {
    setSelectedHopital(hopital);
    setSelectedMedecin(null);
    setFormData(prev => ({
      ...prev,
      codeHopital: hopital.codeHopital,
      nomHopital: hopital.nomHopital,
      codeDocteur: currentDoctor?.codeDocteur || '',
      nomDocteur: currentDoctor?.nomDocteur || ''
    }));
  };

  const handleMedecinSelect = (medecin) => {
    setSelectedMedecin(medecin);
    setFormData(prev => ({
      ...prev,
      codeDocteur: medecin.codeDoctor || medecin.codeDocteur || medecin.codePrestataire,
      nomDocteur: medecin.nomComplet || medecin.nomAffichage || medecin.nomDocteur || medecin.nomPrestataire || `${medecin.prenomUtilisateur || ''} ${medecin.nomUtilisateur || ''}`.trim() || medecin.codeDoctor
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const submissionData = {
        ...formData,
        dateReference: formData.dateReference || new Date().toISOString().split('T')[0]
      };

      let result;
      if (initialData) {
        result = await referenceDossierService.updateReference(initialData.codeReference, submissionData);
      } else {
        result = await referenceDossierService.createReference(submissionData);
      }

      setLoading(false);
      if (onComplete) {
        onComplete(result);
      }
    } catch (err) {
      console.error('Erreur lors de la soumission:', err);
      setError('Erreur lors de la création/mise à jour de la référence');
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return selectedPatient && selectedDossier;
      case 2:
        return selectedHopital;
      case 3:
        return selectedMedecin;
      case 4:
        return formData.motifReference && formData.typeReference;
      default:
        return true;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return renderPatientStep();
      case 2:
        return renderHopitalStep();
      case 3:
        return renderMedecinStep();
      case 4:
        return renderReferenceStep();
      case 5:
        return renderConfirmationStep();
      default:
        return null;
    }
  };

  const renderPatientStep = () => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <User className="w-5 h-5 mr-2 text-blue-600" />
        Étape 1: Sélection du Patient et du Dossier
      </h2>

      {/* Recherche patient */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rechercher un patient
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tapez le nom ou code du patient..."
            value={searchPatient}
            onChange={(e) => setSearchPatient(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {patientResults.length > 0 && (
          <div className="mt-2 border border-gray-300 rounded-lg max-h-40 overflow-y-auto">
            {patientResults.map((patient) => (
              <div
                key={patient.codePatient}
                onClick={() => handlePatientSelect(patient)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{patient.nom || patient.nomUtilisateur || '-'} {patient.prenom || patient.prenomUtilisateur || '-'}</div>
                    <div className="text-sm text-gray-500">{patient.codePatient}</div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewPatient(patient);
                    }}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Eye size={16} className="text-gray-600" />
                  </button>
                </div>
              ))}
            ))}
          </div>
        )}
      </div>

      {/* Patient sélectionné */}
      {selectedPatient && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-blue-900">Patient sélectionné:</h3>
            <button
              onClick={() => {
                setSelectedPatient(null);
                setFormData(prev => ({ ...prev, codePatient: '', nomPatient: '', prenomPatient: '' }));
                setDossierResults([]);
                setSelectedDossier(null);
              }}
              className="p-1 hover:bg-blue-200 rounded"
            >
              <X size={16} className="text-blue-600" />
            </button>
          </div>
          <div className="text-sm mt-2">
            <div><strong>Nom:</strong> {selectedPatient.nom || selectedPatient.nomUtilisateur || '-'} {selectedPatient.prenom || selectedPatient.prenomUtilisateur || '-'}</div>
            <div><strong>Code:</strong> {selectedPatient.codePatient}</div>
          </div>
        </div>
      )}

      {/* Recherche dossier */}
      {selectedPatient && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rechercher un dossier pour ce patient
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tapez le code du dossier..."
              value={searchDossier}
              onChange={(e) => setSearchDossier(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {dossierResults.length > 0 && (
            <div className="mt-2 border border-gray-300 rounded-lg max-h-40 overflow-y-auto">
              {dossierResults.map((dossier) => (
                <div
                  key={dossier.codeDossier}
                  onClick={() => handleDossierSelect(dossier)}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{dossier.codeDossier}</div>
                      <div className="text-sm text-gray-500">Créé le: {dossier.dateCreation ? new Date(dossier.dateCreation).toLocaleDateString('fr-FR') : 'Date inconnue'}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDossierDetails(!showDossierDetails);
                        }}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Eye size={16} className="text-gray-600" />
                      </button>
                      {selectedDossier?.codeDossier === dossier.codeDossier && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDossierUnselect();
                          }}
                          className="p-1 hover:bg-red-200 rounded"
                        >
                          <EyeOff size={16} className="text-red-600" />
                        </button>
                      )}
                    </div>
                  </div>
                  {showDossierDetails && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                      <p><strong>Code:</strong> {dossier.codeDossier}</p>
                      <p><strong>ID Biom:</strong> {dossier.identificationBiom || 'N/A'}</p>
                      <p><strong>Créé par:</strong> {dossier.doctorCreateNom || 'N/A'}</p>
                      <p><strong>Date:</strong> {dossier.dateCreation ? new Date(dossier.dateCreation).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dossier sélectionné */}
      {selectedDossier && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-green-900">Dossier sélectionné:</h3>
            <button
              onClick={handleDossierUnselect}
              className="p-1 hover:bg-green-200 rounded"
            >
              <X size={16} className="text-green-600" />
            </button>
          </div>
          <div className="text-sm mt-2">
            <div><strong>Code:</strong> {selectedDossier.codeDossier}</div>
            <div><strong>Date création:</strong> {new Date(selectedDossier.dateCreation).toLocaleDateString('fr-FR')}</div>
          </div>
        </div>
      )}
    </div>
  );

  const renderHopitalStep = () => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <Hospital className="w-5 h-5 mr-2 text-purple-600" />
        Étape 2: Sélection de l'Hôpital de Destination
      </h2>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sélectionner un hôpital
        </label>
        <select
          value={selectedHopital?.codeHopital || ''}
          onChange={(e) => {
            const hopital = hopitaux.find(h => h.codeHopital === e.target.value);
            handleHopitalSelect(hopital);
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Choisir un hôpital...</option>
          {hopitaux.map((hopital) => (
            <option key={hopital.codeHopital} value={hopital.codeHopital}>
              {hopital.nomHopital}
            </option>
          ))}
        </select>
      </div>

      {selectedHopital && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-purple-900">Hôpital sélectionné:</h3>
            <button
              onClick={handleHopitalUnselect}
              className="p-1 hover:bg-purple-200 rounded"
            >
              <X size={16} className="text-purple-600" />
            </button>
          </div>
          <div className="text-sm mt-2">
            <div><strong>Nom:</strong> {selectedHopital.nomHopital}</div>
            <div><strong>Code:</strong> {selectedHopital.codeHopital}</div>
            <div><strong>Adresse:</strong> {selectedHopital.adresseHopital || '-'}</div>
          </div>
        </div>
      )}
    </div>
  );

  const renderMedecinStep = () => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <User className="w-5 h-5 mr-2 text-orange-600" />
        Étape 3: Sélection du Médecin Destinataire
      </h2>

      {medecins.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Aucun médecin trouvé pour cet hôpital</p>
        </div>
      ) : (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sélectionner un médecin
          </label>
          <select
            value={selectedMedecin?.codePrestataire || ''}
            onChange={(e) => {
              const medecin = medecins.find(m => m.codePrestataire === e.target.value);
              handleMedecinSelect(medecin);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Choisir un médecin...</option>
            {medecins.map((medecin) => (
              <option key={medecin.codePrestataire} value={medecin.codePrestataire}>
                {medecin.nomPrestataire} - {medecin.typePrestataire}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedMedecin && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-orange-900">Médecin sélectionné:</h3>
            <button
              onClick={handleMedecinUnselect}
              className="p-1 hover:bg-orange-200 rounded"
            >
              <X size={16} className="text-orange-600" />
            </button>
          </div>
          <div className="text-sm mt-2">
            <div><strong>Nom:</strong> {selectedMedecin.nomComplet || selectedMedecin.nomAffichage || selectedMedecin.nomPrestataire || selectedMedecin.nomDocteur || `${selectedMedecin.prenomUtilisateur || ''} ${selectedMedecin.nomUtilisateur || ''}`.trim() || selectedMedecin.codeDoctor}</div>
            <div><strong>Type:</strong> {selectedMedecin.typePrestataire || selectedMedecin.fonction || selectedMedecin.specialite || 'Non spécifié'}</div>
            <div><strong>Téléphone:</strong> {selectedMedecin.telephone || selectedMedecin.telephonePrestataire || '-'}</div>
          </div>
        </div>
      )}
    </div>
  );

  const renderReferenceStep = () => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <FileText className="w-5 h-5 mr-2 text-green-600" />
        Étape 4: Détails de la Référence
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type de Référence *
          </label>
          <select
            value={formData.typeReference}
            onChange={(e) => setFormData(prev => ({ ...prev, typeReference: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Choisir un type...</option>
            <option value="CONSULTATION">Consultation</option>
            <option value="HOSPITALISATION">Hospitalisation</option>
            <option value="EXAMEN">Examen</option>
            <option value="SUIVI">Suivi</option>
            <option value="URGENCE">Urgence</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date de Référence
          </label>
          <input
            type="date"
            value={formData.dateReference}
            onChange={(e) => setFormData(prev => ({ ...prev, dateReference: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Motif de la Référence *
        </label>
        <textarea
          value={formData.motifReference}
          onChange={(e) => setFormData(prev => ({ ...prev, motifReference: e.target.value }))}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Décrivez le motif de la référence..."
        />
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Observations
        </label>
        <textarea
          value={formData.observations}
          onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Observations supplémentaires..."
        />
      </div>
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <Check className="w-5 h-5 mr-2 text-green-600" />
        Étape 5: Confirmation
      </h2>

      <div className="space-y-6">
        {/* Résumé */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-4">Résumé de la Référence</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><strong>Patient:</strong> {formData.nomPatient} {formData.prenomPatient}</div>
            <div><strong>Dossier:</strong> {formData.codeDossier}</div>
            <div><strong>Hôpital:</strong> {formData.nomHopital}</div>
            <div><strong>Médecin:</strong> {formData.nomDocteur}</div>
            <div><strong>Type:</strong> {formData.typeReference}</div>
            <div><strong>Date:</strong> {formData.dateReference}</div>
          </div>
          
          {formData.motifReference && (
            <div className="mt-4">
              <strong>Motif:</strong>
              <p className="mt-1 text-gray-700">{formData.motifReference}</p>
            </div>
          )}
          
          {formData.observations && (
            <div className="mt-4">
              <strong>Observations:</strong>
              <p className="mt-1 text-gray-700">{formData.observations}</p>
            </div>
          )}
        </div>

        {/* Informations du référenceur */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-4">Informations du Référenceur</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
              <input
                type="text"
                value={formData.nomReferenceur}
                onChange={(e) => setFormData(prev => ({ ...prev, nomReferenceur: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Votre nom"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
              <input
                type="tel"
                value={formData.telephoneReferenceur}
                onChange={(e) => setFormData(prev => ({ ...prev, telephoneReferenceur: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Votre téléphone"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.emailReferenceur}
                onChange={(e) => setFormData(prev => ({ ...prev, emailReferenceur: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Votre email"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* En-tête */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">
            {initialData ? '📝 Modifier une Référence' : '📋 Créer une Référence de Dossier'}
          </h1>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {getTranslation("retour", language) || "Retour"}
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Étape {currentStep} sur {totalSteps}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round((currentStep / totalSteps) * 100)}% complété
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">❌ {error}</p>
        </div>
      )}

      {/* Contenu de l'étape */}
      <div className="mb-6">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>

          {currentStep < totalSteps ? (
            <button
              onClick={nextStep}
              disabled={!validateCurrentStep()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Traitement...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  {initialData ? 'Mettre à Jour' : 'Créer la Référence'}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReferenceDossierWizard;
