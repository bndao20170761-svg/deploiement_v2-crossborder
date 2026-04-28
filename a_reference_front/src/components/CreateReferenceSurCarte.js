import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Hospital, Calendar, FileText, Loader, Check, ChevronRight } from 'lucide-react';
import referenceDossierService from '../services/referenceDossierService';
import * as patientService from '../services/patientService';
import { getDoctorsByHospital, getCurrentDoctor } from '../services/doctorService';
import { getTranslation } from '../utils/translations';
import { normalizeDoctorsList } from '../utils/doctorMapper';
import SearchPatient from './SearchPatient';
import PatientForm from './PatientForm';

const CreateReferenceSurCarte = ({ language = "fr", onBack, onComplete, selectedHospital }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // États pour les données
  const [formData, setFormData] = useState({
    codeReference: '',
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
  const [medecins, setMedecins] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedMedecin, setSelectedMedecin] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);

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
    fetchPatients();
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

  const fetchPatients = async () => {
    try {
      const data = await patientService.getAllPatients();
      setPatients(data || []);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des patients:', error);
      setPatients([]);
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
    setPatients((prev) => [...prev, newPatient]);
    handlePatientSelect(newPatient);
    setShowNewPatientForm(false);
  };

  const handleMedecinSelect = (medecin) => {
    setSelectedMedecin(medecin);
    setFormData(prev => ({
      ...prev,
      codeDocteur: medecin.codeDocteur,
      nomDocteur: `${medecin.prenom} ${medecin.nom}`.trim()
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validation: le patient et le médecin doivent être sélectionnés
      if (!formData.codePatient) {
        setError('Veuillez sélectionner un patient');
        return;
      }
      if (!formData.codeDocteur) {
        setError('Veuillez sélectionner un médecin');
        return;
      }
      if (!formData.motifReference) {
        setError('Veuillez renseigner le motif de la référence');
        return;
      }
      if (!formData.typeReference) {
        setError('Veuillez sélectionner le type de référence');
        return;
      }

      const submissionData = {
        ...formData,
        dateReference: formData.dateReference ? new Date(formData.dateReference).toISOString() : new Date().toISOString()
      };

      const result = await referenceDossierService.createReference(submissionData);
      
      // Afficher un message de succès
      alert('Référence créée avec succès !');
      
      // Rediriger ou appeler le callback
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

  // Étape 1: Sélection Patient (exactement comme ReferenceWizard.js)
  const renderPatientSearch = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          👤 Sélectionner un patient
        </h3>
        
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

      {/* Patient sélectionné */}
      {selectedPatient && !showNewPatientForm && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-3">👤 Patient sélectionné</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <strong>Nom:</strong> {selectedPatient.nomUtilisateur} {selectedPatient.prenomUtilisateur}
            </div>
            <div>
              <strong>Code:</strong> {selectedPatient.codePatient}
            </div>
            <div>
              <strong>Âge:</strong> {selectedPatient.age} ans
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
          
          {/* Actions */}
          <div className="flex justify-end">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Suivant → Sélectionner un médecin
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );

  // Étape 2: Sélection Médecin (copié de CreateReferenceFromMap.js)
  const renderMedecinSelection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🩺 Sélectionner un médecin à {selectedHospital?.nom}
        </h3>
        
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
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedMedecin?.codeDocteur === medecin.codeDocteur
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        Dr {medecin.prenomUtilisateur} {medecin.nomUtilisateur}
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

        {medecins.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            Aucun médecin disponible à cet hôpital
          </div>
        )}

        {/* Actions - Bouton Suivant */}
        {selectedMedecin && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Suivant → Détails de la référence
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Étape 3: Motif de la Référence (modèle ReferenceWizard.js)
  const renderReferenceDetails = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📋 Motif de la Référence
        </h3>

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
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Boutons de navigation */}
      <div className="mt-6 flex justify-between">
        <button
          onClick={() => setCurrentStep(2)}
          className="flex items-center px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Précédent
        </button>
        <button
          onClick={() => setCurrentStep(4)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Suivant → Informations cliniques
        </button>
      </div>
    </div>
  );

  // Étape 4: Section 1 - Poids et Stades OMS (Section1Component)
  const renderClinicalSection1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📋 Poids et Stades OMS
        </h3>

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
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Boutons de navigation */}
      <div className="mt-6 flex justify-between">
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
          Suivant → Traitement ARV
        </button>
      </div>
    </div>
  );

  // Étape 5: Section 2 - Traitement ARV (Section2Component)
  const renderClinicalSection2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📋 Traitement ARV
        </h3>

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
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Boutons de navigation */}
      <div className="mt-6 flex justify-between">
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
          Suivant → CD4
        </button>
      </div>
    </div>
  );

  // Étape 6: Section 3 - CD4 (Section3Component)
  const renderClinicalSection3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📋 CD4
        </h3>

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
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Boutons de navigation */}
      <div className="mt-6 flex justify-between">
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
          Suivant → Analyses biologiques
        </button>
      </div>
    </div>
  );

  // Étape 7: Section 4 - Analyses biologiques (Section4Component)
  const renderClinicalSection4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📋 Analyses biologiques
        </h3>

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
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Boutons de navigation */}
      <div className="mt-6 flex justify-between">
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
          Suivant → Analyses microbiologiques
        </button>
      </div>
    </div>
  );

  // Étape 7: Traitements
  const renderTreatmentsStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📋 Traitements
        </h3>

        <div className="space-y-6">
          {/* Traitement ARV */}
          <div className="p-4 border rounded-lg bg-gray-50">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {getTranslation("arvTreatment", language) || "Traitement ARV"}
            </label>
            <textarea
              value={formData.traitementArv ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, traitementArv: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Décrivez le traitement ARV en cours..."
            />
          </div>

          {/* Autre traitement */}
          <div className="p-4 border rounded-lg bg-gray-50">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {getTranslation("otherTreatment", language) || "Autre traitement"}
            </label>
            <textarea
              value={formData.autreTraitement ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, autreTraitement: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Autres traitements en cours..."
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Boutons de navigation */}
      <div className="mt-6 flex justify-between">
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
          Suivant → Résumé
        </button>
      </div>
    </div>
  );

  // Étape 8: Section 5 - Analyses microbiologiques (Section5Component)
  const renderClinicalSection5 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📋 Analyses microbiologiques
        </h3>

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
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Boutons de navigation */}
      <div className="mt-6 flex justify-between">
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
          Suivant → Traitement TB
        </button>
      </div>
    </div>
  );

  // Étape 9: Section 6 - Traitement TB (Section6Component)
  const renderClinicalSection6 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📋 Traitement TB
        </h3>

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
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Boutons de navigation */}
      <div className="mt-6 flex justify-between">
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
          Suivant → Autre traitement
        </button>
      </div>
    </div>
  );

  // Étape 10: Section 7 - Autre traitement (Section7Component)
  const renderClinicalSection7 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📋 Autre traitement
        </h3>

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
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Boutons de navigation */}
      <div className="mt-6 flex justify-between">
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
          Suivant → Résumé
        </button>
      </div>
    </div>
  );

  // Étape 11: Confirmation et création
  const renderConfirmationStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📋 Confirmation de la référence
        </h3>
        
        {/* Récapitulatif */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-2">
          <p><strong>Patient:</strong> {selectedPatient?.nomUtilisateur} {selectedPatient?.prenomUtilisateur}</p>
          <p><strong>Hôpital de destination:</strong> {selectedHospital?.nom}</p>
          <p><strong>Médecin destinataire:</strong> Dr {selectedMedecin?.nomComplet || selectedMedecin?.nomAffichage || `${selectedMedecin?.prenomUtilisateur || ''} ${selectedMedecin?.nomUtilisateur || ''}`.trim() || selectedMedecin?.codeDoctor}</p>
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

      {/* Bouton Créer la référence */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={loading || !formData.typeReference || !formData.dateReference}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {loading && <Loader className="h-4 w-4 animate-spin" />}
          <span>📋 Créer la référence</span>
        </button>
      </div>
    </div>
  );

  // Étape 5: Résumé des informations (modèle ReferenceWizard.js)
  const renderSummaryStep = () => {
    // Debug: afficher les données du patient et médecin
    console.log("🔍 Debug CreateReferenceSurCarte - selectedPatient:", selectedPatient);
    console.log("🔍 Debug CreateReferenceSurCarte - selectedMedecin:", selectedMedecin);
    console.log("🔍 Debug CreateReferenceSurCarte - formData:", formData);
    
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
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📋 Résumé des Informations
          </h3>

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
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Boutons de navigation */}
        <div className="mt-6 flex justify-between">
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
            Suivant → Confirmation
          </button>
        </div>
      </div>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return renderPatientSearch();
      case 2:
        return renderMedecinSelection();
      case 3:
        return renderReferenceDetails();
      case 4:
        return renderClinicalSection1();
      case 5:
        return renderClinicalSection2();
      case 6:
        return renderClinicalSection3();
      case 7:
        return renderClinicalSection4();
      case 8:
        return renderClinicalSection5();
      case 9:
        return renderClinicalSection6();
      case 10:
        return renderClinicalSection7();
      case 11:
        return renderSummaryStep();
      case 12:
        return renderConfirmationStep();
      default:
        return renderPatientSearch();
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>← Retour</span>
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

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default CreateReferenceSurCarte;
