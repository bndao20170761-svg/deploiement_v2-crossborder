import axios from 'axios';
// ...
import ClinicalInfoStep from "./ClinicalInfoStep";
// ...
import PatientForm  from "./PatientForm";
// Dans ton render/switch:

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  User,
  Stethoscope,
  Heart,
  Activity
} from 'lucide-react';
import SearchPatient from './SearchPatient';
import SearchDoctor from './SearchDoctor';
import { getTranslation } from '../utils/translations';
import { createReference } from './referenceService';
import { getAllPatients } from '../services/patientService';
import { getAllDoctors } from './doctorService';
import { updateReference } from '../services/referenceService';
import { normalizePatientList } from '../utils/patientUtils';

const ReferenceWizard = ({ onComplete, onCancel, language,initialData  }) => {
  // Debug log IMMÉDIAT
  console.log("🚀 ReferenceWizard: DÉBUT DU COMPOSANT");
  
const userId = localStorage.getItem("userId");
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  // Debug log au montage du composant
  console.log("🔄 ReferenceWizard: Composant monté, userId:", userId);


  // --- State ---
  const [currentStep, setCurrentStep] = useState(() => {
    if (!userId) return 1;
    const savedStep = sessionStorage.getItem(`wizardStep_${userId}`);
    const stepNumber = parseInt(savedStep, 10);
    return savedStep && stepNumber >= 1 && stepNumber <= 5 ? stepNumber : 1;
  });

  // État principal avec restauration depuis sessionStorage
   const [wizardData, setWizardData] = useState(() => {
     try {
       if (!userId) return initialData || {};
       const saved = sessionStorage.getItem(`wizardData_${userId}`);
       return saved ? JSON.parse(saved) : initialData || {};
     } catch (error) {
       console.error("Erreur de lecture sessionStorage:", error);
       return initialData || {};
     }
   });


 // Sauvegarde automatique dans sessionStorage
  useEffect(() => {
    try {
      if (userId) {
        sessionStorage.setItem(`wizardData_${userId}`, JSON.stringify(wizardData));
      }
    } catch (error) {
      console.error("Erreur sauvegarde données:", error);
    }
  }, [wizardData, userId]);

  // Sauvegarde automatique du step
  useEffect(() => {
    try {
      if (userId) {
        sessionStorage.setItem(`wizardStep_${userId}`, currentStep.toString());
      }
    } catch (error) {
      console.error("Erreur sauvegarde step:", error);
    }
  }, [currentStep, userId]);

  useEffect(() => {
    try {
      localStorage.setItem('referenceWizardStep', currentStep.toString());
    } catch (error) {
      console.error("Erreur sauvegarde étape:", error);
    }
  }, [currentStep]);





  const initialState = {
   active: true,
     date: "",
     etat: true,
     site: "",
     statut: "EN_ATTENTE",
     type: "MEDICAL",
     validation: false,
     codeMedecin: "",
     patientId: "",

     patient: null,
     doctor: null,

     // ✅ Renseignements cliniques
     renseignementClinique: {
       poidsKg: "",
       traitementARV: false,
       traitementtb: false,
       transaminase: "",
       transaminaseAsat: "",
       transaminaseAlat: "",
       cd4Dernier: "",
       cd4DebutTraitement: "",
       cd4Inclusion: "",
       chargeViraleNiveau: "",
       hbNiveau: "",
       lymphocytesTotaux: "",
       allergie: "",
       creatinemie: "",
       cracheBaar: "",
       aghbs: "",
       autreAnalyse: false,
       autreTraitement: false,
       resultatTrans: "",

       // ✅ Dates
       date: "",
       dateTransaminase: "",
       dateCd4Dernier: "",
       dateCd4DebutTraitement: "",
       dateCd4Inclusion: "",
       dateDebutChargeVirale: "",
       dateHb: "",
       dateLymphocytes: "",
       dateAllergie: "",
       dateCreatinemie: "",
       dateCracheBaar: "",
       dateAghbs: "",
       dateAutreAnalyse: "",
       dateDebutARV: "",

       // ✅ Listes imbriquées
       protocoles1s: [{ protocole1ereLigne: "", dateProtocole1: "" }],
       protocoles2s: [{ protocole2emeLigne: "", dateProtocole2: "" }],
       protocolesTheraps: [{ therapie: "", dateTherapie: "" }],
       profils: [
         {
           dateConfirmation: "",
           indetermine: false,
           profil1: false,
           profil12: false,
           profil2: false,
         },
       ],
       stades: [
         {
           stade1: false,
           stade2: false,
           stade3: false,
           stade4: false,
         },
       ],
     },

     // ✅ Motif (conforme à ton DTO backend)
     motif: {
         autresAPreciser: false,
         changementAdresse: { permanent: false, temporaire: false },
         motifAutres: { autresMotif: "" },
         motifServs: { arv: false, bilan: false, io: false, ptme: false, suivi: false }
       }
     };




const [showNewPatientForm, setShowNewPatientForm] = useState(false);

// Navigation unifiée pour les sous-étapes cliniques
const [subStep, setSubStep] = useState(1);
const totalSubSteps = 7; // 7 sous-étapes cliniques

// Fonctions de navigation unifiées
const nextStep = () => {
  if (currentStep === 4) {
    // Dans l'étape clinique, gérer les sous-étapes
    if (subStep < totalSubSteps) {
      setSubStep(subStep + 1);
    } else {
      // Passer à l'étape suivante (résumé)
      setCurrentStep(5);
      setSubStep(1); // Reset pour la prochaine fois
    }
  } else {
    // Navigation normale entre étapes
    setCurrentStep(prev => Math.min(prev + 1, 5));
  }
};

const prevStep = () => {
  if (currentStep === 4) {
    // Dans l'étape clinique, gérer les sous-étapes
    if (subStep > 1) {
      setSubStep(subStep - 1);
    } else {
      // Revenir à l'étape précédente (motif)
      setCurrentStep(3);
    }
  } else {
    // Navigation normale entre étapes
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }
};



  const steps = [
    { number: 1, title: getTranslation('patient', language), icon: User },
    { number: 2, title: getTranslation('doctorSelection', language), icon: Stethoscope },
    { number: 3, title: getTranslation('hivReferenceReason', language), icon: Heart },
    { number: 4, title: getTranslation('hivClinicalInfo', language), icon: Activity },
    { number: 5, title: getTranslation('summary', language), icon: Check },
  ];







const nextSubStep = () => {
  if (subStep < totalSubSteps) {
    setSubStep(subStep + 1);
  } else {
    nextStep(); // passe à l’étape 5
    setSubStep(1); // reset
  }
};

const prevSubStep = () => {
  if (subStep > 1) {
    setSubStep(subStep - 1);
  } else {
    prevStep(); // revient à l’étape 3
  }
};

// Fonction de validation pour permettre la navigation
const canProceed = () => {
  switch (currentStep) {
    case 1:
      return wizardData.patient !== null;
    case 2:
      return wizardData.doctor !== null;
    case 3:
      return wizardData.changementAdresse !== null || wizardData.autresAPreciser || wizardData.servicesEnabled;
    case 4:
      return true; // Les sous-étapes cliniques sont optionnelles
    default:
      return true;
  }
};




 useEffect(() => {
   let isMounted = true;

   async function fetchData() {
     try {
       console.log("🔄 ReferenceWizard: Chargement données...");
       
       // Charger les patients
       console.log("🔄 ReferenceWizard: Chargement patients...");
       const patientsData = await getAllPatients();
       console.log("✅ ReferenceWizard: Patients reçus:", patientsData);
       
       // Charger les doctors
       console.log("🔄 ReferenceWizard: Chargement doctors...");
       const doctorsData = await getAllDoctors();
       console.log("✅ ReferenceWizard: Doctors reçus:", doctorsData);
       
      if (isMounted) {
        // ✅ CORRECTION: Normaliser les données avant de les passer aux composants de recherche
        const normalizedPatients = normalizePatientList(patientsData || []);
        // Normaliser doctors (doctors peuvent avoir des structures différentes aussi)
        const normalizedDoctors = Array.isArray(doctorsData) ? doctorsData.map(doctor => ({
          ...doctor,
          nomUtilisateur: doctor.nom || doctor.nomUtilisateur || doctor.nomUser || '',
          prenomUtilisateur: doctor.prenom || doctor.prenomUtilisateur || doctor.prenomUser || '',
          codeDoctor: doctor.codeDoctor || doctor.code || doctor.id || '',
        })) : [];
        
        setPatients(normalizedPatients);
        setDoctors(normalizedDoctors);
        console.log("✅ ReferenceWizard: State mis à jour:", { 
          patientsCount: normalizedPatients?.length, 
          doctorsCount: normalizedDoctors?.length,
          patientsArray: normalizedPatients,
          doctorsArray: normalizedDoctors
        });
      }
     } catch (err) {
       console.error("❌ ReferenceWizard: Erreur chargement:", err);
       if (isMounted) console.error('Erreur chargement des données :', err);
     }
   }

   fetchData();

   return () => {
     isMounted = false;
   };
 }, []);











console.log(
  "wizardData saved:",
  JSON.parse(sessionStorage.getItem(`wizardData_${userId}`) || "{}")
);
console.log(
  "wizardCurrentStep saved:",
  sessionStorage.getItem(`wizardStep_${userId}`)
);

 const handlePatientCreated = async (newPatient) => {
   // Ajouter le patient à la liste des patients
   setPatients((prev) => [...prev, newPatient]);

   // Sélectionner ce patient dans le wizard
   setWizardData((prev) => ({ ...prev, patient: newPatient }));

   // Masquer le formulaire d'ajout
   setShowNewPatientForm(false);
 };


  const handlePatientSelect = (patient) =>
    setWizardData((prev) => ({ ...prev, patient }));

  const handleDoctorSelect = (doctor) =>
    setWizardData((prev) => ({ ...prev, doctor }));
const isNonEmptyString = (value) => typeof value === 'string' && value.trim() !== '';













  const mapSuiviType = (label) => {
    switch (label) {
      case 'IO': return 'IRREGULIER';
      case 'PTME': return 'REGULIER';
      case 'Perdu de vue': return 'PERDU_DE_VUE';
      case 'Transféré': return 'TRANSFERE';
      default: return null;
    }
  };
 const handleComplete = async () => {

  if (userId) {
       sessionStorage.removeItem(`wizardData_${userId}`);
       sessionStorage.removeItem(`wizardStep_${userId}`);
     }
   const rc = wizardData.renseignementClinique;

   // 🔹 1) Construire le DTO (ton mapping existant est nickel)
   const motifChangements = wizardData.changementAdresse
     ? {
         permanent: wizardData.changementAdresse.permanent || false,
         temporaire: wizardData.changementAdresse.temporaire || false,
       }
     : { permanent: false, temporaire: false };

   const motifAutres = {
     autresMotif: wizardData.autresAPreciser ? wizardData.autresMotif || "" : "",
   };

   const motifServs = wizardData.servicesEnabled
     ? {
         arv: wizardData.services?.arv || false,
         bilan: wizardData.services?.bilan || false,
         io: wizardData.services?.io || false,
         ptme: wizardData.services?.ptme || false,
         suivi: wizardData.services?.suivi || false,
       }
     : { arv: false, bilan: false, io: false, ptme: false, suivi: false };

   const motif = {
     autresAPreciser: wizardData.autresAPreciser || false,
     changementAdresse:
       motifChangements.permanent || motifChangements.temporaire || false,
     services: Object.values(motifServs).some((v) => v === true),
     motifAutres,
     motifChangements,
     motifServs,
   };

   const dto = {
     active: wizardData.active,
     date: wizardData.date,
     etat: wizardData.etat,
     site: wizardData.site,
     statut: wizardData.statut,
     type: wizardData.type,
     validation: wizardData.validation,
     codeMedecin: wizardData.codeMedecin || wizardData.doctor?.codeDoctor,
     patientId: wizardData.patientId || wizardData.patient?.codePatient,

     renseignementClinique: {
       poidsKg: rc.poidsKg || "",
       traitementARV: rc.traitementARV || false,
       traitementtb: rc.traitementtb || false,
       allergie: rc.allergie || "",
       aghbs: rc.aghbs || "",
       autreAnalyse: rc.autreAnalyse || false,
       autreTraitement: rc.autreTraitement || false,
       resultatTrans: rc.resultatTrans || "",

       cd4DebutTraitement: rc.cd4DebutTraitement || "",
       cd4Dernier: rc.cd4Dernier || "",
       cd4Inclusion: rc.cd4Inclusion || "",
       chargeViraleNiveau: rc.chargeViraleNiveau || "",
       cracheBaar: rc.cracheBaar || "",
       creatinemie: rc.creatinemie || "",
       hbNiveau: rc.hbNiveau || "",
       lymphocytesTotaux: rc.lymphocytesTotaux || "",
       transaminase: rc.transaminase || "",
       transaminaseAsat: rc.transaminaseAsat || "",
       transaminaseAlat: rc.transaminaseAlat || "",

       // dates
       date: rc.date || "",
       dateDebutARV: rc.dateDebutARV || "",
       dateTransaminase: rc.dateTransaminase || "",
       dateCd4Dernier: rc.dateCd4Dernier || "",
       dateCd4DebutTraitement: rc.dateCd4DebutTraitement || "",
       dateCd4Inclusion: rc.dateCd4Inclusion || "",
       dateDebutChargeVirale: rc.dateDebutChargeVirale || "",
       dateHb: rc.dateHb || "",
       dateLymphocytes: rc.dateLymphocytes || "",
       dateAllergie: rc.dateAllergie || "",
       dateCreatinemie: rc.dateCreatinemie || "",
       dateCracheBaar: rc.dateCracheBaar || "",
       dateAghbs: rc.dateAghbs || "",
       dateAutreAnalyse: rc.dateAutreAnalyse || "",

       // listes imbriquées
       profils: rc.profils?.map((p) => ({
         dateConfirmation: p.dateConfirmation || "",
         indetermine: p.indetermine || false,
         profil1: p.profil1 || false,
         profil12: p.profil12 || false,
         profil2: p.profil2 || false,
       })) || [],

       stades: rc.stades?.map((s) => ({
         stade1: s.stade1 || false,
         stade2: s.stade2 || false,
         stade3: s.stade3 || false,
         stade4: s.stade4 || false,
       })) || [],

       protocoles1s: rc.protocoles1s?.map((p) => ({
         protocole1ereLigne: p.protocole1ereLigne || "",
         dateProtocole1: p.dateProtocole1 || "",
       })) || [],

       protocoles2s: rc.protocoles2s?.map((p) => ({
         protocole2emeLigne: p.protocole2emeLigne || "",
         dateProtocole2: p.dateProtocole2 || "",
       })) || [],

       protocolesTheraps: rc.protocolesTheraps?.map((t) => ({
         therapie: t.therapie || "",
         dateTherapie: t.dateTherapie || "",
       })) || [],
     },

     motif,
   };

   // 🔹 2) Token
   const token = localStorage.getItem("token");
   if (!token) {
     console.error("❌ Token manquant, impossible d'envoyer la référence");
     return;
   }

   try {
     let response;

     if (wizardData.id) {
       // ✏️ Mode édition → PUT/PATCH
       response = await axios.put(
         `${process.env.REACT_APP_GATEWAY_URL || 'http://localhost:8081'}/api/references/${wizardData.id}`,
         dto,
         {
           headers: {
             Authorization: `Bearer ${token}`,
             "Content-Type": "application/json",
           },
         }
       );
       console.log("✏️ Référence mise à jour :", response.data);
     } else {
       // 🆕 Mode création → POST
       response = await axios.post(
         `${process.env.REACT_APP_GATEWAY_URL || 'http://localhost:8081'}/api/references/New_ref`,
         dto,
         {
           headers: {
             Authorization: `Bearer ${token}`,
             "Content-Type": "application/json",
           },
         }
       );
       console.log("✅ Référence enregistrée :", response.data);
     }

     if (onComplete) {
       onComplete(response.data);
       localStorage.removeItem("wizardData");
       localStorage.removeItem("wizardCurrentStep");
       setWizardData(initialState);
       setCurrentStep(1);
     }
   } catch (error) {
     if (error.response) {
       console.error("❌ Erreur HTTP :", error.response.status, error.response.data);
     } else {
       console.error("❌ Erreur Axios :", error.message);
     }
   }
 };


  const renderStepContent = () => {
    switch (currentStep) {
     case 1:
       return (
         <div className="space-y-6">
           <h2 className="text-2xl font-bold">Sélection du Patient</h2>

           {!showNewPatientForm ? (
             <>
               <SearchPatient
                 patients={patients}
                 onSelect={handlePatientSelect}
                 selectedPatient={wizardData.patient}
               />

               {/* Bouton pour ajouter un patient si aucun trouvé */}
               <button
                 onClick={() => setShowNewPatientForm(true)}
                 className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
               >
                 ➕ Ajouter un patient
               </button>
             </>
           ) : (
             <PatientForm
               initialData={null}
               onSave={handlePatientCreated}
               onCancel={() => setShowNewPatientForm(false)}
             />
           )}
         </div>
       );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Sélection du Médecin</h2>
            <SearchDoctor
              doctors={doctors}
              onSelect={handleDoctorSelect}
              selectedDoctor={wizardData.doctor}
            />
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">
              {getTranslation("motif_reference", language)}
            </h2>

             {/* Changement d'adresse */}
                 <div className="flex items-center space-x-2">
                   <input
                     type="checkbox"
                     checked={wizardData.changementAdresse !== null}
                     onChange={(e) =>
                       setWizardData((prev) => ({
                         ...prev,
                         changementAdresse: e.target.checked
                           ? { permanent: false, temporaire: false }
                           : null,
                         autresAPreciser: e.target.checked ? false : prev.autresAPreciser, // désactive Autre
                         autresMotif: '',
                       }))
                     }
                   />
                   <label>{getTranslation("changement_adresse", language)}</label>
                 </div>

                 {wizardData.changementAdresse && (
                   <div className="flex space-x-4">
                     {["temporaire", "permanent"].map((option) => (
                       <label key={option} className="flex items-center space-x-2">
                         <input
                           type="radio"
                           name="changementAdresse"
                           value={option}
                           checked={
                             (option === "temporaire" && wizardData.changementAdresse?.temporaire) ||
                             (option === "permanent" && wizardData.changementAdresse?.permanent)
                           }
                           onChange={() =>
                             setWizardData((prev) => ({
                               ...prev,
                               changementAdresse: {
                                 permanent: option === "permanent",
                                 temporaire: option === "temporaire",
                               },
                             }))
                           }
                         />
                         <span>{getTranslation(option, language)}</span>
                       </label>
                     ))}
                   </div>
                 )}

                 {/* Autre à préciser */}
                 <div className="flex items-center space-x-2">
                   <input
                     type="checkbox"
                     checked={wizardData.autresAPreciser}
                     onChange={(e) =>
                       setWizardData((prev) => ({
                         ...prev,
                         autresAPreciser: e.target.checked,
                         autresMotif: '',
                         changementAdresse: e.target.checked ? null : prev.changementAdresse,
                       }))
                     }
                     disabled={wizardData.changementAdresse !== null}
                   />
                   <label>{getTranslation("autre_a_preciser", language)}</label>
                 </div>

                 {wizardData.autresAPreciser && (
                   <input
                     type="text"
                     value={wizardData.autresMotif}
                     onChange={(e) =>
                       setWizardData((prev) => ({
                         ...prev,
                         autresMotif: e.target.value,
                       }))
                     }
                     className="w-full px-3 py-2 border rounded"
                   />
                 )}
  {/* Services */}
                      {/* Checkbox pour activer/désactiver les services */}
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={wizardData.servicesEnabled}
                          onChange={(e) =>
                            setWizardData((prev) => ({
                              ...prev,
                              servicesEnabled: e.target.checked,
                              services: {
                                arv: false,
                                bilan: false,
                                io: false,
                                ptme: false,
                                suivi: false
                              },
                            }))
                          }
                        />
                        <label>{getTranslation("services", language)}</label>
                      </div>

                      {/* Si services activés, afficher les cases individuelles */}
                      {wizardData.servicesEnabled && (
                        <div className="flex flex-wrap gap-4">
                          {[
                            { key: "arv", label: "ARV" },
                            { key: "io", label: "IO" },
                            { key: "bilan", label: "BILAN" },
                            { key: "ptme", label: "PTME" },
                            { key: "suivi", label: "SimpleSuivi" }
                          ].map(({ key, label }) => (
                            <label key={key} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={wizardData.services?.[key] || false}
                                onChange={(e) =>
                                  setWizardData((prev) => ({
                                    ...prev,
                                    services: {
                                      ...prev.services,
                                      [key]: e.target.checked
                                    }
                                  }))
                                }
                              />
                              <span>{getTranslation(label, language)}</span>
                            </label>
                          ))}
                        </div>


                       )}
          </div>

        );

   case 4:
     return (
       <ClinicalInfoStep
         wizardData={wizardData}
         setWizardData={setWizardData}
         language={language}
         subStep={subStep}

         totalSubSteps={totalSubSteps}
         nextStep={nextStep} // pour avancer automatiquement à l’étape 5
         prevStep={prevStep} // pour revenir à l’étape 3 si subStep=1
       />
     );




      case 5:
        const rc = wizardData.renseignementClinique;
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Résumé des Informations</h2>

            {/* Patient */}
            <div className="p-4 border rounded-lg shadow-sm bg-gray-50">
              <h3 className="font-semibold text-lg mb-2">Patient</h3>
              <p><span className="font-medium">Nom :</span> {wizardData.patient?.nomUtilisateur || "-"}</p>
              <p><span className="font-medium">Prénom :</span> {wizardData.patient?.prenomUtilisateur || "-"}</p>
              <p><span className="font-medium">Code Patient :</span> {wizardData.patient?.codePatient || "-"}</p>
            </div>

            {/* Médecin */}
            <div className="p-4 border rounded-lg shadow-sm bg-gray-50">
              <h3 className="font-semibold text-lg mb-2">Médecin</h3>
              <p><span className="font-medium">Nom :</span> {wizardData.doctor?.nomUtilisateur || "-"}</p>
              <p><span className="font-medium">Prénom :</span> {wizardData.doctor?.prenomUtilisateur || "-"}</p>
              <p><span className="font-medium">Code Médecin :</span> {wizardData.doctor?.codeDoctor || "-"}</p>
            </div>

            {/* Motif */}
            <div className="p-4 border rounded-lg shadow-sm bg-gray-50">
              <h3 className="font-semibold text-lg mb-2">Motif de Référence</h3>
              <p><span className="font-medium">Changement adresse :</span>
                {wizardData.motif?.motifChangements?.temporaire ? "Temporaire" :
                 wizardData.motif?.motifChangements?.permanent ? "Permanent" : "Non"}
              </p>
              <p><span className="font-medium">Autres :</span> {wizardData.motif?.motifAutres?.autresMotif || "-"}</p>
              <p><span className="font-medium">Services :</span> {Object.entries(wizardData.motif?.motifServs || {})
                .filter(([k,v]) => v).map(([k]) => k.toUpperCase()).join(", ") || "-"}</p>
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

            {/* Protocoles ARV */}
            <div className="p-4 border rounded-lg shadow-sm bg-gray-50">
              <h3 className="font-semibold text-lg mb-2">Protocoles ARV</h3>
              {rc.protocoles1s?.map((p, idx) => (
                <p key={idx}>
                  <span className="font-medium">1ère ligne {idx+1} :</span> {p.protocole1ereLigne || "-"} ({p.dateProtocole1 || "-"})
                </p>
              ))}
              {rc.protocoles2s?.map((p, idx) => (
                <p key={idx}>
                  <span className="font-medium">2ème ligne {idx+1} :</span> {p.protocole2emeLigne || "-"} ({p.dateProtocole2 || "-"})
                </p>
              ))}
            </div>

            {/* TB */}
            {rc.traitementtb && (
              <div className="p-4 border rounded-lg shadow-sm bg-gray-50">
                <h3 className="font-semibold text-lg mb-2">Traitement TB</h3>
                {rc.protocolesTheraps?.map((t, idx) => (
                  <p key={idx}>
                    <span className="font-medium">Protocole {idx+1} :</span> {t.therapie || "-"} ({t.dateTherapie || "-"})
                  </p>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Étapes */}
      <div className="flex items-center justify-between mb-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;
          return (
            <div key={step.number} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                isCompleted ? 'bg-green-500 text-white' :
                isActive ? 'bg-green-50 text-green-600 border-green-600' :
                'bg-gray-50 text-gray-400 border-gray-300'
              }`}>
                {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>
              <div className="ml-2 text-xs">{step.title}</div>
              {index < steps.length - 1 && <div className="h-px bg-gray-300 w-4 mx-2" />}
            </div>
          );
        })}
      </div>

      <div className="bg-white shadow p-6 rounded-lg mb-4">{renderStepContent()}</div>

      <div className="flex justify-between">
        <button
          onClick={currentStep === 1 ? onCancel : prevStep}
          className="flex items-center px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {currentStep === 1 ? 'Annuler' : 'Précédent'}
        </button>

        {currentStep < 5 ? (
          <button
            onClick={nextStep}
            disabled={!canProceed()}
            className={`px-4 py-2 rounded text-white flex items-center ${
              canProceed() ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            Suivant <ArrowRight className="h-4 w-4 ml-2" />
          </button>
        ) : (
          <button
            onClick={handleComplete}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded flex items-center"
          >
            <Check className="h-4 w-4 mr-2" /> Envoyer
          </button>
        )}
      </div>
    </div>
  );
};

export default ReferenceWizard;