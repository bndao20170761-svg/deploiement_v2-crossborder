import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Hospital, Calendar, FileText, Loader, Check, ChevronRight } from 'lucide-react';
import * as patientService from '../services/patientService';
import { getDoctorsByHospital, getCurrentDoctor } from '../services/doctorService';
import { getTranslation } from '../utils/translations';
import { normalizeDoctorsList } from '../utils/doctorMapper';
import SearchPatient from './SearchPatient';
import PatientForm from './PatientForm';

const CreateReferenceFromMap = ({ language = "fr", onBack, onComplete, selectedHospital }) => {
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
    emailReferenceur: ''
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
      // Robust fallback for various user field shapes
      const refCode = user?.codeDocteur || user?.codeDoctor || user?.id || '';
      const refFirst = user?.prenomUtilisateur || user?.prenom || user?.firstName || '';
      const refLast = user?.nomUtilisateur || user?.nom || user?.lastName || '';
      const refFullName = user?.nomComplet || user?.displayName || `${refFirst} ${refLast}`.trim() || user?.username || user?.email || '';

      setFormData(prev => ({
        ...prev,
        codeReferenceur: refCode,
        nomReferenceur: refFullName,
        telephoneReferenceur: user?.telephone || user?.phone || user?.mobile || '',
        emailReferenceur: user?.email || user?.username || ''
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
    const medCode = medecin?.codeDocteur || medecin?.codeDoctor || medecin?.code || '';
    const medName = medecin?.nomComplet || medecin?.nomAffichage || `${medecin?.prenom || ''} ${medecin?.nom || ''}`.trim();
    setFormData(prev => ({
      ...prev,
      codeDocteur: medCode,
      nomDocteur: medName
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

  // Étape 1: Sélection Patient (SearchPatient + PatientForm)
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

  // Étape 2: Sélection Médecin
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

  // Étape 3: Détails Référence + Confirmation
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

      {/* Bouton Créer la référence */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={loading || !formData.motifReference || !formData.typeReference || !formData.dateReference}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {loading && <Loader className="h-4 w-4 animate-spin" />}
          <span>📋 Créer la référence</span>
        </button>
      </div>
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

export default CreateReferenceFromMap;
