import React, { useState, useEffect, useContext } from "react";
import Header from "./components/Header";
import Login from "./components/Login";
import ReferenceWizard from "./components/ReferenceWizard";
import ReferenceList from "./components/ReferenceList";
import PatientView from "./components/PatientView";
import PatientForm from "./components/PatientForm";
import CartographyContainer from './components/CartographyContainer';
import FormulaireMultiEtapes from "./components/FormulaireMultiEtapes";
import FormulaireCompletFusionne from "./components/FormulaireCompletFusionne";
import PatientList from "./components/PatientList";
import { AuthContext } from "./components/AuthContext";
import { getTranslation } from "./utils/translations";
import DossierView from "./components/DossierView";

import {
  createPatient,
  getAllPatients,
  updatePatient,
  deletePatient as deletePatientService,
} from "./services/patientService";

import {
  createReference,
  getAllReferences,
  getReceivedReferences,
  getSentReferences,
  countRecuesNonLues,
  getCountReferencesEnvoyeesParAssistant,
  countEnvoyees,
} from "./services/referenceService";

function App() {
  const { isAuthenticated, user, loading } = useContext(AuthContext);

  const [currentView, setCurrentView] = useState("cartography");
  const [isCartographyOpen, setIsCartographyOpen] = useState(true);

  const [references, setReferences] = useState([]);
  const [patients, setPatients] = useState([]);
  const [editingPatient, setEditingPatient] = useState(null);
  const [language, setLanguage] = useState("fr");
  const [sentCount, setSentCount] = useState(0);
  const [sentCountAssist, setSentCountAssist] = useState(0);
  const [receivedCount, setReceivedCount] = useState(0);
  const [selectedPatient, setSelectedPatient] = useState(null);
const [selectedDossier, setSelectedDossier] = useState(null);
 const [activeMenu, setActiveMenu] = useState("patients");

// --- Navigation / Langue ---
const handleMenuSelect = (view) => {
  setCurrentView(view);
  if (view === "cartography") {
    setIsCartographyOpen(true);
  } else {
    setIsCartographyOpen(false);
  }
};


   const handleCartographyToggle = (isOpen) => {
     setIsCartographyOpen(isOpen);
     if (isOpen) {
       setActiveMenu('cartography');
     }
   };


  // --- Chargement langue ---
  useEffect(() => {
    const savedLanguage = localStorage.getItem("selectedLanguage");
    if (savedLanguage && ["fr", "en", "pt"].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  // --- Chargement patients ---
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchPatients = async () => {
      try {
        console.log("🔄 App.js: Chargement patients...");
        const data = await getAllPatients();
        console.log("✅ App.js: Patients reçus:", data);
        setPatients(Array.isArray(data) ? data : []);
        console.log("✅ App.js: Patients state mis à jour:", Array.isArray(data) ? data.length : 0, "patients");
      } catch (error) {
        console.error("❌ App.js: Erreur lors du chargement des patients :", error);
      }
    };
    fetchPatients();
  }, [isAuthenticated]);

   // --- Fonction pour charger patients ---
    const loadPatients = async () => {
      if (!isAuthenticated) return;
      try {
        const data = await getAllPatients();
        setPatients(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("❌ Erreur lors du chargement des patients :", error);
      }
    };

    useEffect(() => {
      loadPatients();
    }, [isAuthenticated]);

  // --- Chargement compteurs ---
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchCounts = async () => {
      try {
        const [envoyees, recuesNonLues, envoyeesAssist] = await Promise.all([
          countEnvoyees(),
          countRecuesNonLues(),
          getCountReferencesEnvoyeesParAssistant(),
        ]);

        setSentCount(envoyees || 0);
        setReceivedCount(recuesNonLues || 0);
        setSentCountAssist(envoyeesAssist || 0);
      } catch (error) {
        console.error("❌ Erreur lors du chargement des compteurs :", error);
        setSentCount(0);
        setReceivedCount(0);
        setSentCountAssist(0);
      }
    };
    fetchCounts();
  }, [isAuthenticated]);

  // --- Chargement références ---
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchReferences = async () => {
      try {
        let data = [];
        if (currentView === "sent") {
          data = await getSentReferences();
          setReferences(data.map((ref) => ({ ...ref, localStatus: "sent" })));
        } else if (currentView === "received") {
          data = await getReceivedReferences();
          setReferences(data.map((ref) => ({ ...ref, localStatus: "received" })));
        } else {
          const response = await getAllReferences();
          setReferences(response?.data || []);
        }
      } catch (error) {
        console.error("❌ Erreur lors du chargement des références :", error);
        setReferences([]);
      }
    };
    fetchReferences();
  }, [isAuthenticated, currentView]);

  // --- Gestion patients ---
const handlePatientSave = async (patientData) => {
  try {
    if (editingPatient) {
      await updatePatient(editingPatient.codePatient, patientData);
      setPatients((prev) =>
        prev.map((p) =>
          p.codePatient === editingPatient.codePatient ? patientData : p
        )
      );
    } else {
      const savedPatient = await createPatient(patientData);
      setPatients((prev) => [...prev, savedPatient]);
    }
    setEditingPatient(null);

    // 🔑 Redirection directe après sauvegarde
    setCurrentView("patientList");
  } catch (error) {
    console.error("❌ Erreur API patient :", error);
  }
};
const handleDossierCreated = (dossier) => {
  console.log("✅ Dossier créé :", dossier);
  setSelectedDossier(dossier);
  setCurrentView("DossierView"); // redirection vers l’affichage
};




  const handlePatientCancel = () => {
    setEditingPatient(null);
    setCurrentView("patientList");
  };

const handleViewDossier = (patient) => {
  setSelectedDossier(patient); // stocke le patient pour lequel on veut voir le dossier
  setCurrentView("dossierView"); // bascule la vue
};

  const handleEditPatient = (patient) => {
    setEditingPatient(patient);
    setCurrentView("addPatient");
  };
 const handleViewPatient = (patient) => {
   setSelectedPatient(patient);
   setCurrentView("patientView");
 };


  const handleDeletePatient = async (codePatient) => {
    try {
      await deletePatientService(codePatient);
      setPatients((prev) => prev.filter((p) => p.codePatient !== codePatient));
    } catch (error) {
      console.error("❌ Erreur suppression patient :", error);
    }
  };



  // --- Gestion références ---
  const handleWizardComplete = async (wizardData) => {
      try {
        const rc = wizardData.renseignementClinique || {};

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
          motif: {
            autresAPreciser: wizardData.autresAPreciser || false,
            changementAdresse:
              wizardData.changementAdresse?.permanent ||
              wizardData.changementAdresse?.temporaire ||
              false,
            services: Object.values(wizardData.services || {}).some((v) => v === true),
          },
        };

        await createReference(dto);
      } catch (error) {
        console.error("❌ Erreur création référence :", error);
      } finally {
        try {
          const sentRefs = await getSentReferences();
          setReferences(sentRefs.map((ref) => ({ ...ref, localStatus: "sent" })));
        } catch (err) {
          console.error("❌ Erreur récupération références envoyées :", err);
          setReferences([]);
        }
        setCurrentView("sent");
  }
  };
  const handleWizardCancel = () => setCurrentView("home");

  // --- Navigation / Langue ---
  //const handleMenuSelect = (view) => setCurrentView(view);
  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem("selectedLanguage", newLanguage);
  };

  // --- Contenu principal ---
  const renderContent = () => {
    if (isCartographyOpen) {
      return <CartographyContainer language={language} />;
    }

    switch (currentView) {
      case "add":
        return (
          <ReferenceWizard
            onComplete={handleWizardComplete}
            onCancel={handleWizardCancel}
            language={language}
          />
        );
      case "sent":
        return (
          <ReferenceList
            references={references}
            language={language}
            type="sent"
          />
        );
      case "received":
        return (
          <ReferenceList
            references={references}
            language={language}
            type="received"
          />
        );
      case "addPatient":
        return (
          <PatientForm
            initialData={editingPatient}
            onSave={handlePatientSave}
            onCancel={handlePatientCancel}
            language={language}
          />
        );
      case "patientList":
        return (
          <PatientList
            patients={patients}
            language={language}
            onEdit={handleEditPatient}
            onDelete={handleDeletePatient}
            onView={handleViewPatient}
            onViewDossier={handleViewDossier}
          />
        );
      case "patientView":
        return (
          <PatientView
            patient={selectedPatient}
            onUpdate={loadPatients}
            language={language}
            onViewDossier={handleViewDossier}
            onBack={() => setCurrentView("patientList")}
          />
        );
      case "dossierView":
        return (
          <DossierView
            patient={selectedDossier}
            language={language}
            onBack={() => setCurrentView("patientList")}
          />
        );
      case "FormulaireMultiEtapes":
        return (
          <FormulaireMultiEtapes
            initialData={editingPatient}
            onSave={handlePatientSave}
            onCancel={handlePatientCancel}
            language={language}
            onBack={() => setCurrentView("patientList")}
          />
        );
      case "FormulaireCompletFusionne":
        return (
          <FormulaireCompletFusionne
            initialData={editingPatient}
            onSave={handlePatientSave}
            onCancel={handlePatientCancel}
            language={language}
            onBack={() => setCurrentView("patientView")}
          />
        );
      default:
        return <CartographyContainer language={language} />;
    }
  };

  // --- Ici on sort de renderContent ---
  if (loading) return <div className="text-center py-20">Chargement...</div>;

  if (!isAuthenticated) return <Login />;
// Dans App.js - remplacez le return final par :
return (
  <div className="flex flex-col min-h-screen">
    <Header
      onMenuSelect={handleMenuSelect}
      onCartographyToggle={handleCartographyToggle}
      sentCount={sentCount}
      sentCountAssist={sentCountAssist}
      receivedCount={receivedCount}
      language={language}
      onLanguageChange={handleLanguageChange}
      patientCount={patients.length}
    />
    <main className="flex-1">
      {renderContent()}
    </main>
  </div>
);

}

export default App;
