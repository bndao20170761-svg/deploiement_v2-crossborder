import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, User, FileText, Hospital, Calendar, MessageSquare, Check, X, Eye, EyeOff, Loader } from 'lucide-react';
import referenceDossierService from '../services/referenceDossierService';
import * as patientService from '../services/patientService';
import { getAllHospitals, getPrestatairesByHopital } from '../services/hopitalService';
import { getCurrentDoctor, getDoctorsByHospital } from '../services/doctorService';
import { getTranslation } from '../utils/translations';
import { normalizeDoctorsList, getDoctorDisplayName } from '../utils/doctorMapper';

const ReferenceDossierForm = ({ language = "fr", onBack, onComplete, initialData = null }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
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

  const totalSteps = 5;

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setCurrentStep(5); // Mode édition
    }
    fetchHopitaux();
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

  // Chargement des médecins quand un hôpital est sélectionné
  useEffect(() => {
    if (selectedHopital) {
      fetchMedecins();
    } else {
      setMedecins([]);
    }
  }, [selectedHopital]);

  const loadCurrentDoctor = async () => {
    try {
      const doctor = await getCurrentDoctor();
      setCurrentDoctor(doctor);
      // Pré-remplir le formulaire avec le docteur connecté
      const docCode = doctor?.codeDocteur || doctor?.codeDoctor || doctor?.codePrestataire || doctor?.code || doctor?.id || '';
      const docFirst = doctor?.prenomUtilisateur || doctor?.prenom || doctor?.firstName || '';
      const docLast = doctor?.nomUtilisateur || doctor?.nom || doctor?.lastName || '';
      const docFull = doctor?.nomComplet || doctor?.displayName || `${docFirst} ${docLast}`.trim() || doctor?.username || doctor?.email || '';
      setFormData(prev => ({
        ...prev,
        codeDocteur: docCode,
        nomDocteur: docFull,
        codeReferenceur: docCode,
        nomReferenceur: docFull,
        telephoneReferenceur: doctor?.telephone || doctor?.phone || '',
        emailReferenceur: doctor?.email || ''
      }));
    } catch (err) {
      console.error('Erreur lors du chargement du docteur connecté:', err);
    }
  };

  const searchPatients = async () => {
    try {
      const patients = await patientService.searchPatients(searchPatient);
      setPatientResults(patients || []);
    } catch (err) {
      console.error('Erreur lors de la recherche de patients:', err);
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

  const fetchHopitaux = async () => {
    try {
      const data = await getAllHospitals();
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
      const normalizedMedecins = normalizeDoctorsList(data);
      
      setMedecins(normalizedMedecins);
    } catch (err) {
      console.error('Erreur lors du chargement des médecins:', err);
    } finally {
      setLoadingMedecins(false);
    }
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setFormData(prev => ({
      ...prev,
      codePatient: patient.codePatient,
      nomPatient: patient.nom || patient.nomUtilisateur || '',
      prenomPatient: patient.prenom || patient.prenomUtilisateur || ''
    }));
    setSearchPatient('');
    setPatientResults([]);
    // Charger automatiquement les dossiers du patient
    if (patient.codePatient) {
      loadPatientDossiers(patient.codePatient);
    }
  };

  const handleDossierSelect = (dossier) => {
    setSelectedDossier(dossier);
    setFormData(prev => ({
      ...prev,
      codeDossier: dossier.codeDossier
    }));
  };

  const handleDossierUnselect = () => {
    setSelectedDossier(null);
    setFormData(prev => ({
      ...prev,
      codeDossier: ''
    }));
  };

  const handleHopitalSelect = (hopital) => {
    setSelectedHopital(hopital);
    setFormData(prev => ({
      ...prev,
      codeHopital: hopital.codeHopital,
      nomHopital: hopital.nomHopital
    }));
    setSelectedMedecin(null);
    setFormData(prev => ({
      ...prev,
      codeDocteur: currentDoctor?.codeDocteur || '',
      nomDocteur: currentDoctor?.nomDocteur || ''
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

  const handleMedecinSelect = (medecin) => {
    setSelectedMedecin(medecin);
    setFormData(prev => ({
      ...prev,
      codeDocteur: medecin.codeDoctor || medecin.codeDocteur || medecin.codePrestataire,
      nomDocteur: medecin.nomComplet || medecin.nomAffichage || medecin.nomDocteur || medecin.nomPrestataire || `${medecin.prenomUtilisateur || ''} ${medecin.nomUtilisateur || ''}`.trim() || medecin.codeDoctor
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

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validation: le docteur doit être sélectionné
      if (!formData.codeDocteur) {
        setError('Veuillez sélectionner un docteur');
        return;
      }

      const submissionData = {
        ...formData,
        dateReference: formData.dateReference ? new Date(formData.dateReference).toISOString() : new Date().toISOString()
      };

      let result;
      if (initialData) {
        result = await referenceDossierService.updateReference(initialData.codeReference, submissionData);
      } else {
        result = await referenceDossierService.createReference(submissionData);
      }

      setSuccess(true);
      setTimeout(() => {
        onComplete(result);
      }, 1500);

    } catch (err) {
      console.error('Erreur lors de la soumission:', err);
      setError(err.response?.data?.message || 'Erreur lors de la création de la référence');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Rendu des étapes
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {getTranslation('selectionnerPatient', language) || 'Sélectionner un patient'}
            </h3>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={getTranslation('rechercherPatient', language) || 'Rechercher un patient...'}
                value={searchPatient}
                onChange={(e) => setSearchPatient(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {patientResults.length > 0 && (
              <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                {patientResults.map((patient) => (
                  <div
                    key={patient.codePatient}
                    onClick={() => handlePatientSelect(patient)}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {patient.nom || patient.nomUtilisateur || '-'} {patient.prenom || patient.prenomUtilisateur || '-'}
                        </p>
                        <p className="text-sm text-gray-500">{patient.codePatient}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowPatientDetails(!showPatientDetails);
                        }}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Eye size={16} className="text-gray-600" />
                      </button>
                    </div>
                    {showPatientDetails && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                        <p><strong>{getTranslation('age', language)}:</strong> {patient.age} {getTranslation('ans', language)}</p>
                        <p><strong>{getTranslation('sexe', language)}:</strong> {patient.sexe}</p>
                        <p><strong>{getTranslation('telephone', language)}:</strong> {patient.telephone}</p>
                        <p><strong>{getTranslation('adressePermanente', language)}:</strong> {patient.adressePermanent}</p>
                        <p><strong>{getTranslation('profession', language)}:</strong> {patient.profession}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {selectedPatient && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-green-900">
                      {getTranslation('patientSelectionne', language) || 'Patient sélectionné'}:
                    </p>
                    <p className="text-green-700">
                      {selectedPatient.nom || selectedPatient.nomUtilisateur || '-'} {selectedPatient.prenom || selectedPatient.prenomUtilisateur || '-'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPatient(null);
                      setFormData(prev => ({ ...prev, codePatient: '', nomPatient: '', prenomPatient: '' }));
                      setDossierResults([]);
                      setSelectedDossier(null);
                    }}
                    className="p-1 hover:bg-green-200 rounded"
                  >
                    <X size={16} className="text-green-600" />
                  </button>
                </div>
              </div>
            )}

            {selectedPatient && (
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">
                  {getTranslation('dossiersPatient', language) || 'Dossiers du patient'}
                </h4>
                
                {loadingDossiers ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader className="animate-spin text-blue-500" size={24} />
                    <span className="ml-2 text-gray-600">
                      {getTranslation('chargementDossiers', language) || 'Chargement des dossiers...'}
                    </span>
                  </div>
                ) : dossierResults.length > 0 ? (
                  <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                    {dossierResults.map((dossier) => (
                      <div
                        key={dossier.codeDossier}
                        onClick={() => handleDossierSelect(dossier)}
                        className={`p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                          selectedDossier?.codeDossier === dossier.codeDossier ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{dossier.codeDossier}</p>
                            <p className="text-sm text-gray-500">
                              {dossier.identificationBiom || 'N/A'}
                            </p>
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
                            <p><strong>{getTranslation('code', language)}:</strong> {dossier.codeDossier}</p>
                            <p><strong>{getTranslation('idBiom', language)}:</strong> {dossier.identificationBiom || getTranslation('na', language)}</p>
                            <p><strong>{getTranslation('createPar', language)}:</strong> {dossier.doctorCreateNom || getTranslation('na', language)}</p>
                            <p><strong>{getTranslation('date', language)}:</strong> {dossier.dateCreation ? new Date(dossier.dateCreation).toLocaleDateString() : getTranslation('na', language)}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800">
                      {getTranslation('aucunDossier', language) || 'Aucun dossier trouvé pour ce patient'}
                    </p>
                  </div>
                )}

                {selectedDossier && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-blue-900">
                          {getTranslation('dossierSelectionne', language) || 'Dossier sélectionné'}:
                        </p>
                        <p className="text-blue-700">{selectedDossier.codeDossier}</p>
                      </div>
                      <button
                        onClick={handleDossierUnselect}
                        className="p-1 hover:bg-blue-200 rounded"
                      >
                        <X size={16} className="text-blue-600" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {getTranslation('selectionnerHopital', language) || 'Sélectionner un hôpital'}
            </h3>

            <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
              {hopitaux.map((hopital) => (
                <div
                  key={hopital.codeHopital}
                  onClick={() => handleHopitalSelect(hopital)}
                  className={`p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                    selectedHopital?.codeHopital === hopital.codeHopital ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{hopital.nomHopital}</p>
                      <p className="text-sm text-gray-500">{hopital.ville}, {hopital.pays}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowHopitalDetails(!showHopitalDetails);
                        }}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Eye size={16} className="text-gray-600" />
                      </button>
                      {selectedHopital?.codeHopital === hopital.codeHopital && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleHopitalUnselect();
                          }}
                          className="p-1 hover:bg-red-200 rounded"
                        >
                          <EyeOff size={16} className="text-red-600" />
                        </button>
                      )}
                    </div>
                  </div>
                  {showHopitalDetails && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                      <p><strong>Nom:</strong> {hopital.nomHopital}</p>
                      <p><strong>Ville:</strong> {hopital.ville}</p>
                      <p><strong>Pays:</strong> {hopital.pays}</p>
                      <p><strong>Téléphone:</strong> {hopital.telephone || 'N/A'}</p>
                      <p><strong>Email:</strong> {hopital.email || 'N/A'}</p>
                      <p><strong>Actif:</strong> {hopital.active ? 'Oui' : 'Non'}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {selectedHopital && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-blue-900">
                      {getTranslation('hopitalSelectionne', language) || 'Hôpital sélectionné'}:
                    </p>
                    <p className="text-blue-700">{selectedHopital.nomHopital}</p>
                  </div>
                  <button
                    onClick={handleHopitalUnselect}
                    className="p-1 hover:bg-blue-200 rounded"
                  >
                    <X size={16} className="text-blue-600" />
                  </button>
                </div>
              </div>
            )}

            {selectedHopital && (
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">
                  {getTranslation('medecinsHopital', language) || 'Médecins de l\'hôpital'}
                </h4>
                
                {loadingMedecins ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader className="animate-spin text-blue-500" size={24} />
                    <span className="ml-2 text-gray-600">
                      {getTranslation('chargementMedecins', language) || 'Chargement des médecins...'}
                    </span>
                  </div>
                ) : medecins.length > 0 ? (
                  <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                    {medecins.map((medecin) => (
                      <div
                        key={medecin.codeDocteur || medecin.codePrestataire || medecin.codeDoctor}
                        onClick={() => handleMedecinSelect(medecin)}
                        className={`p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition ${
                          selectedMedecin?.codeDocteur === medecin.codeDocteur ? 'bg-blue-50 border-left-4 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {medecin.nomComplet || `${medecin.prenomDocteur || ''} ${medecin.nomDocteur || ''}`.trim() || medecin.nomPrestataire || 'Médecin'}
                            </p>
                            <p className="text-sm text-gray-600">
                              {medecin.specialite || medecin.fonction || 'Médecin'}
                            </p>
                            <p className="text-xs text-gray-500">
                              Code: {medecin.codeDocteur || medecin.codePrestataire || medecin.codeDoctor}
                            </p>
                            {medecin.telephone && (
                              <p className="text-xs text-gray-500">
                                Tel: {medecin.telephone}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowMedecinDetails(!showMedecinDetails);
                              }}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              <Eye size={16} className="text-gray-600" />
                            </button>
                            {selectedMedecin?.codeDocteur === medecin.codeDocteur && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMedecinUnselect();
                                }}
                                className="p-1 hover:bg-red-200 rounded"
                              >
                                <EyeOff size={16} className="text-red-600" />
                              </button>
                            )}
                          </div>
                        </div>
                        {showMedecinDetails && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                            <p><strong>Nom:</strong> {medecin.nomDocteur || medecin.nomPrestataire}</p>
                            <p><strong>Spécialité:</strong> {medecin.specialite || 'N/A'}</p>
                            <p><strong>Téléphone:</strong> {medecin.telephone || 'N/A'}</p>
                            <p><strong>Email:</strong> {medecin.email || 'N/A'}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800">
                      {getTranslation('aucunMedecin', language) || 'Aucun médecin trouvé pour cet hôpital'}
                    </p>
                  </div>
                )}

                {selectedMedecin && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-blue-900">
                          {getTranslation('medecinSelectionne', language) || 'Médecin sélectionné'}:
                        </p>
                        <p className="text-blue-700">
                          {selectedMedecin.nomComplet || selectedMedecin.nomAffichage || selectedMedecin.nomDocteur || selectedMedecin.nomPrestataire || `${selectedMedecin.prenomUtilisateur || ''} ${selectedMedecin.nomUtilisateur || ''}`.trim() || selectedMedecin.codeDoctor}
                        </p>
                      </div>
                      <button
                        onClick={handleMedecinUnselect}
                        className="p-1 hover:bg-blue-200 rounded"
                      >
                        <X size={16} className="text-blue-600" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {getTranslation('informationsReference', language) || 'Informations de la référence'}
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {getTranslation('motifReference', language) || 'Motif de la référence'}
              </label>
              <textarea
                value={formData.motifReference}
                onChange={(e) => setFormData(prev => ({ ...prev, motifReference: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={getTranslation('decrivezMotif', language) || 'Décrivez le motif de la référence...'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {getTranslation('typeReference', language) || 'Type de référence'}
              </label>
              <select
                value={formData.typeReference}
                onChange={(e) => setFormData(prev => ({ ...prev, typeReference: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">
                  {getTranslation('selectionnerType', language) || 'Sélectionner un type'}
                </option>
                <option value="CONSULTATION">
                  {getTranslation('consultation', language) || 'Consultation'}
                </option>
                <option value="HOSPITALISATION">
                  {getTranslation('hospitalisation', language) || 'Hospitalisation'}
                </option>
                <option value="EXAMEN">
                  {getTranslation('examen', language) || 'Examen complémentaire'}
                </option>
                <option value="URGENCE">
                  {getTranslation('urgence', language) || 'Urgence'}
                </option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {getTranslation('dateReference', language) || 'Date de la référence'}
              </label>
              <input
                type="date"
                value={formData.dateReference}
                onChange={(e) => setFormData(prev => ({ ...prev, dateReference: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {getTranslation('observations', language) || 'Observations'}
              </label>
              <textarea
                value={formData.observations}
                onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={getTranslation('ajouterObservations', language) || 'Ajoutez des observations supplémentaires...'}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {getTranslation('confirmation', language) || 'Confirmation'}
            </h3>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-4">
                {getTranslation('recapitulatif', language) || 'Récapitulatif de la référence'}
              </h4>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">{getTranslation('patient', language) || 'Patient'}:</span>
                  <span className="font-medium">
                    {formData.nomPatient} {formData.prenomPatient}
                  </span>
                </div>
                
                {formData.codeDossier && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">{getTranslation('dossier', language) || 'Dossier'}:</span>
                    <span className="font-medium">{formData.codeDossier}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">{getTranslation('hopital', language) || 'Hôpital'}:</span>
                  <span className="font-medium">{formData.nomHopital}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">{getTranslation('medecin', language) || 'Médecin'}:</span>
                  <span className="font-medium">{formData.nomDocteur}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">{getTranslation('typeReference', language) || 'Type'}:</span>
                  <span className="font-medium">{formData.typeReference}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">{getTranslation('dateReference', language) || 'Date'}:</span>
                  <span className="font-medium">{formData.dateReference}</span>
                </div>
                
                {formData.motifReference && (
                  <div>
                    <span className="text-gray-600 block mb-1">{getTranslation('motif', language) || 'Motif'}:</span>
                    <p className="text-sm bg-white p-2 rounded border">{formData.motifReference}</p>
                  </div>
                )}
                
                {formData.observations && (
                  <div>
                    <span className="text-gray-600 block mb-1">{getTranslation('observations', language) || 'Observations'}:</span>
                    <p className="text-sm bg-white p-2 rounded border">{formData.observations}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-800 text-sm">
                {getTranslation('confirmationMessage', language) || 
                 'En cliquant sur "Créer la référence", vous confirmez que toutes les informations sont correctes.'}
              </p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            {success ? (
              <div className="text-center py-8">
                <Check className="mx-auto text-green-500 mb-4" size={64} />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {getTranslation('referenceCreee', language) || 'Référence créée avec succès!'}
                </h3>
                <p className="text-gray-600">
                  {getTranslation('referenceSuccessMessage', language) || 
                   'La référence de dossier a été créée et enregistrée avec succès.'}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {getTranslation('creationReference', language) || 'Création de la référence'}
                </h3>
                
                {error && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <p className="text-red-800">{error}</p>
                  </div>
                )}
                
                <div className="text-center py-8">
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <Loader className="animate-spin text-blue-500 mr-2" size={24} />
                      <span className="text-gray-600">
                        {getTranslation('creationEnCours', language) || 'Création en cours...'}
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {getTranslation('creerReference', language) || 'Créer la référence'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} className="mr-2" />
          {getTranslation('retour', language) || 'Retour'}
        </button>
        
        <div className="flex items-center space-x-2">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
            <div
              key={step}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === currentStep
                  ? 'bg-blue-600 text-white'
                  : step < currentStep
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step < currentStep ? <Check size={16} /> : step}
            </div>
          ))}
        </div>
      </div>

      {renderStep()}

      <div className="flex justify-between mt-8">
        <button
          onClick={prevStep}
          disabled={currentStep === 1 || loading || success}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {getTranslation('precedent', language) || 'Précédent'}
        </button>
        
        {currentStep < totalSteps && currentStep < 4 && (
          <button
            onClick={nextStep}
            disabled={
              (currentStep === 1 && !selectedPatient) ||
              (currentStep === 2 && !selectedHopital) ||
              loading
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {getTranslation('suivant', language) || 'Suivant'}
          </button>
        )}
        
        {currentStep === 4 && (
          <button
            onClick={nextStep}
            disabled={!formData.motifReference || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {getTranslation('confirmer', language) || 'Confirmer'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ReferenceDossierForm;
