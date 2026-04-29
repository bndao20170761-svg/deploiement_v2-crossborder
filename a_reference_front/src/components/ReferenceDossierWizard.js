import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, User, FileText, Hospital, Calendar, MessageSquare, Check, X, Eye, EyeOff, Loader } from 'lucide-react';
import referenceDossierService from '../services/referenceDossierService';
import * as patientService from '../services/patientService';
import { getHopitauxActifs, getPrestatairesByHopital } from '../services/hopitalService';
import { getCurrentDoctor, getDoctorsByHospital, getDoctorById } from '../services/doctorService';
import { getTranslation } from '../utils/translations';
import { normalizeDoctorsList } from '../utils/doctorMapper';
import PatientView from './PatientView';
import SearchPatient from './SearchPatient';
import PatientForm from './PatientForm';

const ReferenceDossierWizard = ({ language = "fr", onBack, onComplete, initialData = null }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // États pour les données
  const [formData, setFormData] = useState({
    codeReference: '',
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
    emailReferenceur: '',
    // Champs pour le motif de référence (modèle ReferenceWizard.js)
    changementAdresse: null,
    motifs: {},
    autresAPreciser: false,
    autresMotif: '',
    servicesEnabled: false,
    services: {
      arv: false,
      laboratoire: false,
      ptme: false,
      crc: false,
      pvvih: false
    },
    // Champs cliniques complets (modèle ClinicalInfoStep.js)
    poidsKg: '',
    traitementARV: false,
    traitementtb: false,
    transaminase: '',
    transaminaseAsat: '',
    transaminaseAlat: '',
    cd4Dernier: '',
    cd4DebutTraitement: '',
    cd4Inclusion: '',
    chargeViraleNiveau: '',
    hbNiveau: '',
    lymphocytesTotaux: '',
    allergie: '',
    creatinemie: '',
    cracheBaar: '',
    aghbs: '',
    autreAnalyse: false,
    autreTraitement: false,
    resultatTrans: '',
    // Dates
    date: '',
    dateTransaminase: '',
    dateCd4Dernier: '',
    dateCd4DebutTraitement: '',
    dateCd4Inclusion: '',
    dateDebutChargeVirale: '',
    dateHb: '',
    dateLymphocytes: '',
    dateAllergie: '',
    dateCreatinemie: '',
    dateCracheBaar: '',
    dateAghbs: '',
    dateAutreAnalyse: '',
    dateDebutARV: '',
    // Listes imbriquées
    protocoles1s: [{ protocole1ereLigne: "", dateProtocole1: "" }],
    protocoles2s: [{ protocole2emeLigne: "", dateProtocole2: "" }],
    protocolesTheraps: [{ therapie: "", dateTherapie: "" }],
    profils: [{ dateConfirmation: "", indetermine: false, profil1: false, profil12: false, profil2: false }],
    stades: [{ stade1: false, stade2: false, stade3: false, stade4: false }]
  });

  // États pour la recherche
  const [patients, setPatients] = useState([]);
  const [hopitaux, setHopitaux] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedHopital, setSelectedHopital] = useState(null);
  const [selectedMedecin, setSelectedMedecin] = useState(null);
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  
  // États pour les détails et visibilité
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [showHopitalDetails, setShowHopitalDetails] = useState(false);
  const [showMedecinDetails, setShowMedecinDetails] = useState(false);
  const [currentDoctor, setCurrentDoctor] = useState(null);
  const [loadingMedecins, setLoadingMedecins] = useState(false);
  
  // États pour les vues modales
  const [patientViewModal, setPatientViewModal] = useState(false);
  const [selectedPatientForView, setSelectedPatientForView] = useState(null);
  const [success, setSuccess] = useState(false);

  const totalSteps = 13; // 13 étapes : Patient, Hôpital, Médecin, Motif, 7 sections cliniques, Résumé, Confirmation

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setCurrentStep(13); // Mode édition (13 étapes maintenant)
    }
    fetchHopitaux();
    fetchPatients();
    // Charger le docteur connecté
    loadCurrentDoctor();
  }, [initialData]);

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
      // Robust fallbacks for different doctor object shapes
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

  
  const fetchPatients = async () => {
    try {
      console.log('🔄 ReferenceDossierWizard: Chargement des patients...');
      const data = await patientService.getAllPatients();
      console.log('✅ Patients chargés:', data);
      setPatients(data || []);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des patients:', error);
      setPatients([]);
    }
  };

  const fetchHopitaux = async () => {
    try {
      console.log('🔄 ReferenceDossierWizard: Chargement des hôpitaux...');
      const data = await getHopitauxActifs();
      console.log('✅ ReferenceDossierWizard: Hôpitaux reçus:', data);
      setHopitaux(data || []);
      console.log('✅ ReferenceDossierWizard: Hôpitaux définis dans le state:', data?.length || 0, 'hôpitaux');
    } catch (err) {
      console.error('❌ ReferenceDossierWizard: Erreur lors du chargement des hôpitaux:', err);
      setHopitaux([]);
    }
  };

  const fetchMedecins = async () => {
    try {
      setLoadingMedecins(true);
      console.log('🔄 ReferenceDossierWizard: Chargement des médecins pour l\'hôpital:', selectedHopital?.id);
      const data = await getDoctorsByHospital(selectedHopital.id);
      console.log('✅ ReferenceDossierWizard: Médecins reçus:', data);
      console.log('✅ ReferenceDossierWizard: Nombre de médecins:', data?.length || 0);
      
      // Normaliser les données des médecins
      const normalizedMedecins = normalizeDoctorsList(data);
      
      console.log('✅ ReferenceDossierWizard: Médecins normalisés:', normalizedMedecins);
      setMedecins(normalizedMedecins);
    } catch (err) {
      console.error('❌ ReferenceDossierWizard: Erreur lors du chargement des médecins:', err);
      setMedecins([]);
    } finally {
      setLoadingMedecins(false);
    }
  };

  
  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setFormData(prev => ({
      ...prev,
      codePatient: patient.codePatient,
      nomPatient: patient.nomUtilisateur || patient.nom || '',
      prenomPatient: patient.prenomUtilisateur || patient.prenom || ''
    }));
  };

  const handlePatientCreated = async (newPatient) => {
    // Ajouter le patient à la liste des patients
    setPatients((prev) => [...prev, newPatient]);
    // Sélectionner automatiquement le nouveau patient
    handlePatientSelect(newPatient);
    // Revenir à la sélection de patients
    setShowNewPatientForm(false);
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

  
  const closePatientView = () => {
    setPatientViewModal(false);
    setSelectedPatientForView(null);
  };

  
  const handleHopitalSelect = (hopital) => {
    setSelectedHopital(hopital);
    setSelectedMedecin(null);
    setFormData(prev => ({
      ...prev,
      codeHopital: hopital.id,
      nomHopital: hopital.nom,
      codeDocteur: currentDoctor?.codeDocteur || '',
      nomDocteur: currentDoctor?.nomDocteur || ''
    }));
  };

  const handleMedecinSelect = (medecin) => {
    setSelectedMedecin(medecin);
    setFormData(prev => ({
      ...prev,
      codeDocteur: medecin.codeDoctor || medecin.codeDocteur,
      nomDocteur: medecin.nomComplet || medecin.nomAffichage || `${medecin.prenomUtilisateur || ''} ${medecin.nomUtilisateur || ''}`.trim() || medecin.codeDoctor
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validation: le patient et le docteur doivent être sélectionnés
      if (!formData.codePatient) {
        setError('Veuillez sélectionner un patient');
        return;
      }
      if (!formData.codeDocteur) {
        setError('Veuillez sélectionner un docteur');
        return;
      }

      // Debug: afficher les données de validation
      console.log("🔍 Debug ReferenceDossierWizard - formData.motifs:", formData.motifs);
      console.log("🔍 Debug ReferenceDossierWizard - formData.autresAPreciser:", formData.autresAPreciser);
      console.log("🔍 Debug ReferenceDossierWizard - formData.autresMotif:", formData.autresMotif);
      
      // Transformer les données pour le backend - CLEANUP COMPLET
      const submissionData = {
        // Champs de base
        codeDossier: 'REF_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        codeReference: formData.codeReference || '',
        codePatient: formData.codePatient || '',
        nomPatient: formData.nomPatient || '',
        prenomPatient: formData.prenomPatient || '',
        codeHopital: formData.codeHopital || '',
        nomHopital: formData.nomHopital || '',
        codeDocteur: formData.codeDocteur || '',
        nomDocteur: formData.nomDocteur || '',
        typeReference: formData.typeReference || '',
        dateReference: formData.dateReference ? new Date(formData.dateReference).toISOString() : new Date().toISOString(),
        observations: formData.observations || '',
        codeReferenceur: formData.codeReferenceur || '',
        nomReferenceur: formData.nomReferenceur || '',
        telephoneReferenceur: formData.telephoneReferenceur || '',
        emailReferenceur: formData.emailReferenceur || '',
        
        // Transformer changementAdresse d'objet vers booléens séparés
        changementAdresse: formData.changementAdresse !== null,
        changementAdresseTemporaire: formData.changementAdresse?.temporaire || false,
        changementAdressePermanent: formData.changementAdresse?.permanent || false,
        autresAPreciser: formData.autresAPreciser || false,
        autresMotif: formData.autresMotif || '',
        
        // Transformer les motifs d'objet vers liste de MotifDto
        motifs: Object.entries(formData.motifs || {})
          .filter(([key, value]) => value === true)
          .map(([key]) => ({
            id: null,
            nomMotif: key,
            description: '',
            active: true
          })),
          
        // Transformer les services d'objet vers booléens séparés
        serviceArv: formData.services?.arv || false,
        serviceLaboratoire: formData.services?.laboratoire || false,
        servicePtme: formData.services?.ptme || false,
        serviceCrc: formData.services?.crc || false,
        servicePvvih: formData.services?.pvvih || false,
        
        // Champs cliniques
        poidsKg: formData.poidsKg || null,
        traitementARV: formData.traitementARV || false,
        traitementtb: formData.traitementtb || false,
        transaminase: formData.transaminase || '',
        transaminaseAsat: formData.transaminaseAsat || '',
        transaminaseAlat: formData.transaminaseAlat || '',
        cd4Dernier: formData.cd4Dernier || '',
        cd4DebutTraitement: formData.cd4DebutTraitement || '',
        cd4Inclusion: formData.cd4Inclusion || '',
        chargeViraleNiveau: formData.chargeViraleNiveau || '',
        hbNiveau: formData.hbNiveau || '',
        lymphocytesTotaux: formData.lymphocytesTotaux || '',
        allergie: formData.allergie || '',
        creatinemie: formData.creatinemie || '',
        cracheBaar: formData.cracheBaar || '',
        aghbs: formData.aghbs || '',
        autreAnalyse: formData.autreAnalyse || false,
        autreTraitement: formData.autreTraitement || false,
        resultatTrans: formData.resultatTrans || ''
      };
      
      // Supprimer explicitement les champs objets problématiques qui pourraient rester
      // Pas besoin de supprimer motifs car on l'a déjà transformé en liste
      // Pas besoin de supprimer services car on utilise les booléens séparés
      
      console.log("🔍 Debug ReferenceDossierWizard - submissionData:", submissionData);

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
        return renderPatientStep();
      case 2:
        return renderHopitalStep();
      case 3:
        return renderMedecinStep();
      case 4:
        return renderReferenceStep();
      case 5:
        return renderClinicalSection1();
      case 6:
        return renderClinicalSection2();
      case 7:
        return renderClinicalSection3();
      case 8:
        return renderClinicalSection4();
      case 9:
        return renderClinicalSection5();
      case 10:
        return renderClinicalSection6();
      case 11:
        return renderClinicalSection7();
      case 12:
        return renderSummaryStep();
      case 13:
        return renderConfirmationStep();
      default:
        return null;
    }
  };

  const renderPatientStep = () => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <User className="w-5 h-5 mr-2 text-blue-600" />
        Étape 1: Sélection du Patient
      </h2>

      {!showNewPatientForm ? (
        <>
          <SearchPatient
            patients={patients}
            onSelect={handlePatientSelect}
            selectedPatient={selectedPatient}
            language={language}
          />

          {/* Bouton pour ajouter un patient si aucun trouvé */}
          <button
            onClick={() => setShowNewPatientForm(true)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            ➕ {getTranslation('addPatient', language) || 'Ajouter un patient'}
          </button>
        </>
      ) : (
        <PatientForm
          initialData={null}
          onSave={handlePatientCreated}
          onCancel={() => setShowNewPatientForm(false)}
          language={language}
        />
      )}
    </div>
  );

  const renderHopitalStep = () => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <Hospital className="w-5 h-5 mr-2 text-purple-600" />
        Étape 2: Sélection de l'Hôpital de Destination
      </h2>

      {/* Debug: Afficher le nombre d'hôpitaux */}
      <div className="mb-4 p-2 bg-gray-100 rounded text-sm">
        Debug: {hopitaux.length} hôpitaux chargés
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sélectionner un hôpital
        </label>
        <select
          value={selectedHopital?.id || ''}
          onChange={(e) => {
            const hopital = hopitaux.find(h => h.id === parseInt(e.target.value));
            if (hopital) handleHopitalSelect(hopital);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        >
          <option value="">Choisir un hôpital...</option>
          {hopitaux.map((hopital) => (
            <option key={hopital.id} value={hopital.id}>
              {hopital.nom}
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
            <div><strong>Nom:</strong> {selectedHopital.nom}</div>
            <div><strong>Ville:</strong> {selectedHopital.ville}</div>
          </div>
        </div>
      )}
    </div>
  );

  const renderMedecinStep = () => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <User className="w-5 h-5 mr-2 text-green-600" />
        Étape 3: Sélection du Médecin
      </h2>

      {loadingMedecins ? (
        <div className="flex items-center justify-center py-8">
          <Loader className="animate-spin text-green-500" size={24} />
          <span className="ml-2 text-gray-600">Chargement des médecins...</span>
        </div>
      ) : medecins.length > 0 ? (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sélectionner un médecin
          </label>
          <select
            value={selectedMedecin?.codeDoctor || ''}
            onChange={(e) => {
              const medecin = medecins.find(m => m.codeDoctor === e.target.value);
              if (medecin) handleMedecinSelect(medecin);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Choisir un médecin...</option>
            {medecins.map((medecin) => (
              <option key={medecin.codeDoctor} value={medecin.codeDoctor}>
                {medecin.nomComplet || `${medecin.prenomUtilisateur} ${medecin.nomUtilisateur}`} - {medecin.fonction || 'Spécialiste'} ({medecin.codeDoctor})
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">Aucun médecin trouvé pour cet hôpital</p>
        </div>
      )}

      {selectedMedecin && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-green-900">Médecin sélectionné:</h3>
            <button
              onClick={handleMedecinUnselect}
              className="p-1 hover:bg-green-200 rounded"
            >
              <X size={16} className="text-green-600" />
            </button>
          </div>
          <div className="text-sm mt-2 space-y-1">
            <div><strong>Nom:</strong> {selectedMedecin.nomComplet || selectedMedecin.nomAffichage || `${selectedMedecin.prenomUtilisateur || selectedMedecin.prenomDocteur || ''} ${selectedMedecin.nomUtilisateur || selectedMedecin.nomDocteur || ''}`.trim() || selectedMedecin.codeDoctor}</div>
            <div><strong>Code:</strong> {selectedMedecin.codeDoctor}</div>
            <div><strong>Fonction:</strong> {selectedMedecin.fonction || selectedMedecin.specialite || 'Non spécifiée'}</div>
            <div><strong>Téléphone:</strong> {selectedMedecin.telephone || 'Non spécifié'}</div>
            <div><strong>Email:</strong> {selectedMedecin.email || 'Non spécifié'}</div>
            <div><strong>Lieu d'exercice:</strong> {selectedMedecin.lieuExercice || 'Non spécifié'}</div>
          </div>
        </div>
      )}
    </div>
  );

  const renderReferenceStep = () => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <FileText className="w-5 h-5 mr-2 text-indigo-600" />
        Étape 4: Motif de la Référence
      </h2>

      <div className="space-y-6">
        {/* Changement d'adresse - modèle ReferenceWizard.js */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.changementAdresse !== null}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                changementAdresse: e.target.checked
                  ? { permanent: false, temporaire: false }
                  : null,
                autresAPreciser: e.target.checked ? false : prev.autresAPreciser,
                autresMotif: '',
              }))
            }
          />
          <label>{getTranslation("changement_adresse", language)}</label>
        </div>

        {formData.changementAdresse && (
          <div className="flex space-x-4">
            {["temporaire", "permanent"].map((option) => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="changementAdresse"
                  value={option}
                  checked={
                    (option === "temporaire" && formData.changementAdresse?.temporaire) ||
                    (option === "permanent" && formData.changementAdresse?.permanent)
                  }
                  onChange={() =>
                    setFormData((prev) => ({
                      ...prev,
                      changementAdresse: {
                        temporaire: option === "temporaire",
                        permanent: option === "permanent",
                      },
                    }))
                  }
                />
                <span>{getTranslation(option, language)}</span>
              </label>
            ))}
          </div>
        )}

        {/* Motifs de référence - modèle ReferenceWizard.js */}
        <div className="space-y-2">
          <p className="font-medium">{getTranslation("motif_reference", language)}</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              "rupture_arv",
              "effet_indesirable",
              "echec_therapeutique",
              "toxicite_medicamenteuse",
            ].map((option) => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.motifs?.[option] || false}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      motifs: {
                        ...prev.motifs,
                        [option]: e.target.checked,
                      },
                    }))
                  }
                />
                <span>{getTranslation(option, language)}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Autre à préciser */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.autresAPreciser}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                autresAPreciser: e.target.checked,
                autresMotif: '',
                changementAdresse: e.target.checked ? null : prev.changementAdresse,
              }))
            }
            disabled={formData.changementAdresse !== null}
          />
          <label>{getTranslation("autre_a_preciser", language)}</label>
        </div>

        {formData.autresAPreciser && (
          <input
            type="text"
            value={formData.autresMotif}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                autresMotif: e.target.value,
              }))
            }
            className="w-full px-3 py-2 border rounded"
          />
        )}

        {/* Services */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.servicesEnabled}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                servicesEnabled: e.target.checked,
                services: {
                  arv: false,
                  laboratoire: false,
                  ptme: false,
                  crc: false,
                  pvvih: false,
                  ...prev.services,
                },
              }))
            }
          />
          <label>{getTranslation("services", language)}</label>
        </div>

        {formData.servicesEnabled && (
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: "arv", label: "ARV" },
              { key: "laboratoire", label: "Laboratoire" },
              { key: "ptme", label: "PTME" },
              { key: "crc", label: "CRC" },
              { key: "pvvih", label: "PVVIH" },
            ].map((service) => (
              <label key={service.key} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.services?.[service.key] || false}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      services: {
                        ...prev.services,
                        [service.key]: e.target.checked,
                      },
                    }))
                  }
                />
                <span>{service.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Boutons de navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={() => setCurrentStep(3)}
          className="flex items-center px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Précédent
        </button>
        <button
          onClick={() => setCurrentStep(5)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Suivant → Poids et Stades OMS
        </button>
      </div>
    </div>
  );

  // Étape 4: Section 1 - Poids et Stades OMS (Section1Component)
  const renderClinicalSection1 = () => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <FileText className="w-5 h-5 mr-2 text-indigo-600" />
        Étape 5: Poids et Stades OMS
      </h2>

      <div className="space-y-6">
        {/* Poids */}
        <div className="p-4 border rounded-lg bg-gray-50">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {getTranslation("weight", language) || "Poids (kg)"}
          </label>
          <input
            type="number"
            value={formData.poidsKg ?? ""}
            onChange={(e) =>
              setFormData((prev) => ({ 
                ...prev, 
                poidsKg: e.target.value ? parseFloat(e.target.value) : "" 
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            step="0.1"
            min="0"
            placeholder="Ex: 70.5"
          />
        </div>

        {/* Stades OMS */}
        <div className="p-4 border rounded-lg bg-gray-50">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {getTranslation("whoStage", language) || "Stade OMS"}
          </label>
          <div className="grid grid-cols-2 gap-4">
            {["stade1", "stade2", "stade3", "stade4"].map((field, index) => (
              <label key={field} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.stades?.[0]?.[field] || false}
                  onChange={(e) => {
                    const updated = [...(formData.stades || [])];
                    if (!updated[0]) updated[0] = {};
                    updated[0][field] = e.target.checked;
                    setFormData((prev) => ({ ...prev, stades: updated }));
                  }}
                />
                <span>Stade {field.replace('stade', '')}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Profils VIH */}
        <div className="p-4 border rounded-lg bg-gray-50">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {getTranslation("hivProfile", language) || "Profil VIH"}
          </label>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-4">
              {["profil1", "profil2", "profil12", "indetermine"].map((field) => (
                <label key={field} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.profils?.[0]?.[field] || false}
                    onChange={(e) => {
                      const updated = [...(formData.profils || [])];
                      if (!updated[0]) updated[0] = {};
                      updated[0][field] = e.target.checked;
                      setFormData((prev) => ({ ...prev, profils: updated }));
                    }}
                  />
                  <span>{field}</span>
                </label>
              ))}
            </div>
            <div>
              <span className="block text-xs text-gray-600 mb-1">
                {getTranslation("confirmationDate", language) || "Date de confirmation"}
              </span>
              <input
                type="date"
                value={formData.profils?.[0]?.dateConfirmation || ""}
                onChange={(e) => {
                  const updated = [...(formData.profils || [])];
                  if (!updated[0]) updated[0] = {};
                  updated[0].dateConfirmation = e.target.value;
                  setFormData((prev) => ({ ...prev, profils: updated }));
                }}
                className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Boutons de navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={() => setCurrentStep(4)}
          className="flex items-center px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Précédent
        </button>
        <button
          onClick={() => setCurrentStep(6)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Suivant → Traitement ARV
        </button>
      </div>
    </div>
  );

  // Étape 5: Section 2 - Traitement ARV (Section2Component)
  const renderClinicalSection2 = () => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <FileText className="w-5 h-5 mr-2 text-indigo-600" />
        Étape 6: Traitement ARV
      </h2>

      <div className="space-y-6">
        {/* Traitement ARV */}
        <div className="p-4 border rounded-lg bg-gray-50">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.traitementARV || false}
              onChange={(e) => setFormData(prev => ({ ...prev, traitementARV: e.target.checked }))}
            />
            <span>{getTranslation("treatmentARV", language) || "Sous ARV"}</span>
          </label>

          {/* Protocoles 1ère ligne */}
          {formData.traitementARV &&
            (formData.protocoles1s || []).map((p, i) => (
              <div key={`p1-${i}`} className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {getTranslation("firstLineProtocol", language) || "Protocole 1ère ligne"}
                </label>
                <input
                  type="text"
                  value={p.protocole1ereLigne || ""}
                  onChange={(e) => {
                    const updated = [...(formData.protocoles1s || [])];
                    updated[i].protocole1ereLigne = e.target.value;
                    setFormData(prev => ({ ...prev, protocoles1s: updated }));
                  }}
                  className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  value={p.dateProtocole1 || ""}
                  onChange={(e) => {
                    const updated = [...(formData.protocoles1s || [])];
                    updated[i].dateProtocole1 = e.target.value;
                    setFormData(prev => ({ ...prev, protocoles1s: updated }));
                  }}
                  className="border p-2 rounded w-full mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}

          {/* Protocoles 2ème ligne */}
          {formData.traitementARV &&
            (formData.protocoles2s || []).map((p, i) => (
              <div key={`p2-${i}`} className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {getTranslation("secondLineProtocol", language) || "Protocole 2ème ligne"}
                </label>
                <input
                  type="text"
                  value={p.protocole2emeLigne || ""}
                  onChange={(e) => {
                    const updated = [...(formData.protocoles2s || [])];
                    updated[i].protocole2emeLigne = e.target.value;
                    setFormData(prev => ({ ...prev, protocoles2s: updated }));
                  }}
                  className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  value={p.dateProtocole2 || ""}
                  onChange={(e) => {
                    const updated = [...(formData.protocoles2s || [])];
                    updated[i].dateProtocole2 = e.target.value;
                    setFormData(prev => ({ ...prev, protocoles2s: updated }));
                  }}
                  className="border p-2 rounded w-full mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
        </div>
      </div>

      {/* Boutons de navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={() => setCurrentStep(5)}
          className="flex items-center px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Précédent
        </button>
        <button
          onClick={() => setCurrentStep(7)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Suivant → CD4
        </button>
      </div>
    </div>
  );

  // Étape 6: Section 3 - CD4 (Section3Component)
  const renderClinicalSection3 = () => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <FileText className="w-5 h-5 mr-2 text-indigo-600" />
        Étape 7: CD4
      </h2>

      <div className="space-y-6">
        {[
          ["cd4DebutTraitement", "dateCd4DebutTraitement"],
          ["cd4Dernier", "dateCd4Dernier"],
          ["cd4Inclusion", "dateCd4Inclusion"],
        ].map(([field, dateField]) => (
          <div key={field} className="p-4 border rounded-lg bg-gray-50">
            <label className="block font-medium mb-2">
              {getTranslation(field, language) || field}
            </label>
            <input
              type="number"
              value={formData[field] ?? ""}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, [field]: e.target.value ? parseFloat(e.target.value) : "" }))
              }
              className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={formData[dateField] || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, [dateField]: e.target.value }))}
              className="border p-2 rounded w-full mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
      </div>

      {/* Boutons de navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={() => setCurrentStep(6)}
          className="flex items-center px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Précédent
        </button>
        <button
          onClick={() => setCurrentStep(8)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Suivant → Analyses biologiques
        </button>
      </div>
    </div>
  );

  // Étape 7: Section 4 - Analyses biologiques (Section4Component)
  const renderClinicalSection4 = () => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <FileText className="w-5 h-5 mr-2 text-indigo-600" />
        Étape 8: Analyses biologiques
      </h2>

      <div className="space-y-6">
        {/* Charge virale */}
        <div className="p-4 border rounded-lg bg-gray-50">
          <label className="block font-medium mb-2">
            {getTranslation("viralLoad", language) || "Charge virale"}
          </label>
          <input
            type="number"
            value={formData.chargeViraleNiveau ?? ""}
            onChange={(e) =>
              setFormData(prev => ({ ...prev, chargeViraleNiveau: e.target.value ? parseFloat(e.target.value) : "" }))
            }
            className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={formData.dateDebutChargeVirale || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, dateDebutChargeVirale: e.target.value }))}
            className="border p-2 rounded w-full mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Lymphocytes totaux */}
        <div className="p-4 border rounded-lg bg-gray-50">
          <label className="block font-medium mb-2">
            {getTranslation("lymphocytesTotaux", language) || "Lymphocytes totaux"}
          </label>
          <input
            type="number"
            value={formData.lymphocytesTotaux ?? ""}
            onChange={(e) =>
              setFormData(prev => ({ ...prev, lymphocytesTotaux: e.target.value ? parseFloat(e.target.value) : "" }))
            }
            className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={formData.dateLymphocytes || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, dateLymphocytes: e.target.value }))}
            className="border p-2 rounded w-full mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Hémoglobine */}
        <div className="p-4 border rounded-lg bg-gray-50">
          <label className="block font-medium mb-2">
            {getTranslation("hbNiveau", language) || "Hémoglobine (Hb)"}
          </label>
          <input
            type="number"
            value={formData.hbNiveau ?? ""}
            onChange={(e) =>
              setFormData(prev => ({ ...prev, hbNiveau: e.target.value ? parseFloat(e.target.value) : "" }))
            }
            className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={formData.dateHb || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, dateHb: e.target.value }))}
            className="border p-2 rounded w-full mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Boutons de navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={() => setCurrentStep(7)}
          className="flex items-center px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Précédent
        </button>
        <button
          onClick={() => setCurrentStep(9)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Suivant → Analyses microbiologiques
        </button>
      </div>
    </div>
  );

  // Étape 8: Section 5 - Analyses microbiologiques (Section5Component)
  const renderClinicalSection5 = () => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <FileText className="w-5 h-5 mr-2 text-indigo-600" />
        Étape 9: Analyses microbiologiques
      </h2>

      <div className="space-y-6">
        {/* Crachat BAAR */}
        <div className="p-4 border rounded-lg bg-gray-50">
          <label className="block font-medium mb-2">
            {getTranslation("cracheBaar", language) || "Crachat BAAR"}
          </label>
          <input
            type="text"
            value={formData.cracheBaar || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, cracheBaar: e.target.value }))}
            className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={formData.dateCracheBaar || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, dateCracheBaar: e.target.value }))}
            className="border p-2 rounded w-full mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* AgHBs */}
        <div className="p-4 border rounded-lg bg-gray-50">
          <label className="block font-medium mb-2">AgHBs</label>
          <input
            type="text"
            value={formData.aghbs || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, aghbs: e.target.value }))}
            className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={formData.dateAghbs || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, dateAghbs: e.target.value }))}
            className="border p-2 rounded w-full mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Transaminases */}
        <div className="p-4 border rounded-lg bg-gray-50">
          <label className="block font-medium mb-2">
            {getTranslation("transaminase", language) || "Transaminases"}
          </label>
          <input
            type="text"
            value={formData.transaminase || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, transaminase: e.target.value }))}
            className="border p-2 rounded w-full mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <label className="block text-sm text-gray-700">ASAT</label>
          <input
            type="text"
            value={formData.transaminaseAsat || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, transaminaseAsat: e.target.value }))}
            className="border p-2 rounded w-full mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <label className="block text-sm text-gray-700">ALAT</label>
          <input
            type="text"
            value={formData.transaminaseAlat || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, transaminaseAlat: e.target.value }))}
            className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={formData.dateTransaminase || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, dateTransaminase: e.target.value }))}
            className="border p-2 rounded w-full mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Autre analyse */}
        <div className="p-4 border rounded-lg bg-gray-50">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.autreAnalyse || false}
              onChange={(e) => setFormData(prev => ({ ...prev, autreAnalyse: e.target.checked }))}
            />
            <span>{getTranslation("otherAnalysis", language) || "Autre analyse"}</span>
          </label>
          <input
            type="date"
            value={formData.dateAutreAnalyse || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, dateAutreAnalyse: e.target.value }))}
            className="border p-2 rounded w-full mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Boutons de navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={() => setCurrentStep(8)}
          className="flex items-center px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Précédent
        </button>
        <button
          onClick={() => setCurrentStep(10)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Suivant → Traitement TB
        </button>
      </div>
    </div>
  );

  // Étape 9: Section 6 - Traitement TB (Section6Component)
  const renderClinicalSection6 = () => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <FileText className="w-5 h-5 mr-2 text-indigo-600" />
        Étape 10: Traitement TB
      </h2>

      <div className="space-y-6">
        <div className="p-4 border rounded-lg bg-gray-50">
          {/* Traitement TB */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.traitementtb || false}
              onChange={(e) => setFormData(prev => ({ ...prev, traitementtb: e.target.checked }))}
            />
            <span>{getTranslation("tbTreatment", language) || "Traitement TB"}</span>
          </label>

          {/* Protocole thérapeutique */}
          {formData.traitementtb &&
            (formData.protocolesTheraps || []).map((t, i) => (
              <div key={`t-${i}`} className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {getTranslation("therapyProtocol", language) || "Protocole thérapeutique"}
                </label>
                <input
                  type="text"
                  value={t.therapie || ""}
                  onChange={(e) => {
                    const updated = [...(formData.protocolesTheraps || [])];
                    updated[i].therapie = e.target.value;
                    setFormData(prev => ({ ...prev, protocolesTheraps: updated }));
                  }}
                  className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  value={t.dateTherapie || ""}
                  onChange={(e) => {
                    const updated = [...(formData.protocolesTheraps || [])];
                    updated[i].dateTherapie = e.target.value;
                    setFormData(prev => ({ ...prev, protocolesTheraps: updated }));
                  }}
                  className="border p-2 rounded w-full mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
        </div>
      </div>

      {/* Boutons de navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={() => setCurrentStep(9)}
          className="flex items-center px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Précédent
        </button>
        <button
          onClick={() => setCurrentStep(11)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Suivant → Autre traitement
        </button>
      </div>
    </div>
  );

  // Étape 10: Section 7 - Autre traitement (Section7Component)
  const renderClinicalSection7 = () => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <FileText className="w-5 h-5 mr-2 text-indigo-600" />
        Étape 11: Autre traitement
      </h2>

      <div className="space-y-6">
        <div className="p-4 border rounded-lg bg-gray-50">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.autreTraitement || false}
              onChange={(e) => setFormData(prev => ({ ...prev, autreTraitement: e.target.checked }))}
            />
            <span>{getTranslation("otherTreatment", language) || "Autre traitement"}</span>
          </label>
          <input
            type="date"
            value={formData.dateAutreAnalyse || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, dateAutreAnalyse: e.target.value }))}
            className="border p-2 rounded w-full mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Boutons de navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={() => setCurrentStep(10)}
          className="flex items-center px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Précédent
        </button>
        <button
          onClick={() => setCurrentStep(12)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Suivant → Résumé
        </button>
      </div>
    </div>
  );

  // Étape 11: Résumé des informations (modèle ReferenceWizard.js)
  const renderSummaryStep = () => {
    // Debug: afficher les données du patient et médecin
    console.log("🔍 Debug - selectedPatient:", selectedPatient);
    console.log("🔍 Debug - selectedMedecin:", selectedMedecin);
    
    const rc = {
      poidsKg: formData.poidsKg,
      traitementARV: formData.traitementArv,
      cd4DebutTraitement: formData.cd4DebutTraitement,
      cd4Dernier: formData.cd4Dernier,
      chargeViraleNiveau: formData.chargeViraleNiveau,
      hbNiveau: formData.hbNiveau,
      lymphocytesTotaux: formData.lymphocytesTotaux,
      cracheBaar: formData.cracheBaar,
      aghbs: formData.aghbs,
      transaminase: formData.transaminase,
      autreAnalyse: formData.autreAnalyse,
      autreTraitement: formData.autreTraitement,
      protocoles1s: formData.protocoles1s,
      protocoles2s: formData.protocoles2s,
      traitementtb: formData.traitementtb,
      protocolesTheraps: formData.protocolesTheraps
    };

    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-indigo-600" />
          Étape 12: Résumé des Informations
        </h2>

        <div className="space-y-6">
          {/* Patient */}
          <div className="p-4 border rounded-lg shadow-sm bg-gray-50">
            <h3 className="font-semibold text-lg mb-2">Patient</h3>
            <p><span className="font-medium">Nom :</span> {formData.nomPatient || selectedPatient?.nomUtilisateur || "-"}</p>
            <p><span className="font-medium">Prénom :</span> {formData.prenomPatient || selectedPatient?.prenomUtilisateur || "-"}</p>
            <p><span className="font-medium">Code Patient :</span> {formData.codePatient || selectedPatient?.codePatient || "-"}</p>
          </div>

          {/* Médecin */}
          <div className="p-4 border rounded-lg shadow-sm bg-gray-50">
            <h3 className="font-semibold text-lg mb-2">Médecin</h3>
            <p><span className="font-medium">Nom :</span> {
              (() => {
                const nomComplet = formData.nomDocteur || selectedMedecin?.nomComplet || selectedMedecin?.nomAffichage || selectedMedecin?.nomUtilisateur || selectedMedecin?.nom || "";
                if (nomComplet && nomComplet.includes(" ")) {
                  const parts = nomComplet.split(" ");
                  return parts[parts.length - 1] || nomComplet; // Dernier élément = nom
                }
                return nomComplet;
              })()
            }</p>
            <p><span className="font-medium">Prénom :</span> {
              (() => {
                const nomComplet = formData.nomDocteur || selectedMedecin?.nomComplet || selectedMedecin?.nomAffichage || selectedMedecin?.nomUtilisateur || selectedMedecin?.nom || "";
                if (nomComplet && nomComplet.includes(" ")) {
                  const parts = nomComplet.split(" ");
                  return parts.slice(0, -1).join(" ") || ""; // Tout sauf le dernier = prénom(s)
                }
                return selectedMedecin?.prenomUtilisateur || selectedMedecin?.prenomDocteur || selectedMedecin?.prenom || "-";
              })()
            }</p>
            <p><span className="font-medium">Code Médecin :</span> {formData.codeDocteur || selectedMedecin?.codeDoctor || selectedMedecin?.codeDocteur || "-"}</p>
          </div>

          {/* Motif */}
          <div className="p-4 border rounded-lg shadow-sm bg-gray-50">
            <h3 className="font-semibold text-lg mb-2">Motif de Référence</h3>
            <p><span className="font-medium">Changement adresse :</span>
              {formData.changementAdresse?.temporaire ? "Temporaire" :
               formData.changementAdresse?.permanent ? "Permanent" : "Non"}
            </p>
            <p><span className="font-medium">Autres :</span> {formData.autresMotif || "-"}</p>
            <p><span className="font-medium">Services :</span> {Object.entries(formData.services || {})
              .filter(([k,v]) => v).map(([k]) => k.toUpperCase()).join(", ") || "-"}
            </p>
          </div>

          {/* Renseignements Cliniques */}
          <div className="p-4 border rounded-lg shadow-sm bg-gray-50">
            <h3 className="font-semibold text-lg mb-2">Renseignements Cliniques</h3>
            <div className="grid grid-cols-2 gap-4">
              <p><span className="font-medium">Poids :</span> {rc.poidsKg || "-"}</p>
              <p><span className="font-medium">Traitement ARV :</span> {rc.traitementARV ? "Oui" : "Non"}</p>
              <p><span className="font-medium">CD4 Début :</span> {rc.cd4DebutTraitement || "-"}</p>
              <p><span className="font-medium">CD4 Dernier :</span> {rc.cd4Dernier || "-"}</p>
              <p><span className="font-medium">Charge Virale :</span> {rc.chargeViraleNiveau || "-"}</p>
              <p><span className="font-medium">Hb :</span> {rc.hbNiveau || "-"}</p>
              <p><span className="font-medium">Lymphocytes :</span> {rc.lymphocytesTotaux || "-"}</p>
              <p><span className="font-medium">Crache BAAR :</span> {rc.cracheBaar || "-"}</p>
              <p><span className="font-medium">Ag HBs :</span> {rc.aghbs || "-"}</p>
              <p><span className="font-medium">Transaminases :</span> {rc.transaminase || "-"}</p>
              <p><span className="font-medium">Autre Analyse :</span> {rc.autreAnalyse ? "Oui" : "Non"}</p>
              <p><span className="font-medium">Autre Traitement :</span> {rc.autreTraitement ? "Oui" : "Non"}</p>
            </div>
          </div>
        </div>

        {/* Boutons de navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setCurrentStep(11)}
            className="flex items-center px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Précédent
          </button>
          <button
            onClick={() => setCurrentStep(13)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Suivant → Confirmation
          </button>
        </div>
      </div>
    );
  };

  const renderConfirmationStep = () => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <Check className="w-5 h-5 mr-2 text-green-600" />
        Étape 13: Confirmation
      </h2>

      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-4">Récapitulatif de la référence</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Patient:</span>
            <span className="font-medium">
              {formData.nomPatient} {formData.prenomPatient}
            </span>
          </div>
          
                    
          <div className="flex justify-between">
            <span className="text-gray-600">Hôpital:</span>
            <span className="font-medium">{formData.nomHopital}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Médecin:</span>
            <span className="font-medium">{formData.nomDocteur}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Type:</span>
            <span className="font-medium">{formData.typeReference}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Date:</span>
            <span className="font-medium">{formData.dateReference}</span>
          </div>
          
          {formData.motifReference && (
            <div>
              <span className="text-gray-600 block mb-1">Motif:</span>
              <p className="text-sm bg-white p-2 rounded border">{formData.motifReference}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
        <p className="text-blue-800 text-sm">
          En cliquant sur "Créer la référence", vous confirmez que toutes les informations sont correctes.
        </p>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} className="mr-2" />
          Retour
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
          Précédent
        </button>
        
        {currentStep === 1 && (
          <button
            onClick={nextStep}
            disabled={!selectedPatient || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
          </button>
        )}
        
        {currentStep === 2 && (
          <button
            onClick={nextStep}
            disabled={!selectedHopital || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
          </button>
        )}
        
        {currentStep === 3 && (
          <button
            onClick={nextStep}
            disabled={!selectedMedecin || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
          </button>
        )}
        
        {currentStep === 4 && (
          <button
            onClick={nextStep}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
          </button>
        )}
        
        {currentStep >= 5 && currentStep <= 12 && (
          <button
            onClick={nextStep}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
          </button>
        )}
        
        {currentStep === 13 && (
          <button
            onClick={handleSubmit}
            disabled={loading || success}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {success ? 'Référence créée!' : 'Créer la référence'}
          </button>
        )}
      </div>

      {/* Modales pour les vues détaillées */}
      {patientViewModal && selectedPatientForView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Détails du Patient</h2>
                <button
                  onClick={closePatientView}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <X size={20} />
                </button>
              </div>
              <PatientView patient={selectedPatientForView} language={language} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferenceDossierWizard;
