import React, { useState, useEffect, useContext } from "react";
import Header from "./assets/components/Header";
import Login from "./assets/components/Login";
import PatientForm from "./assets/components/PatientForm";
import PatientList from "./assets/components/PatientList";
// Vérifiez que ces chemins sont corrects
import AssistantForm from "./assets/components/AssistantForm";
import AssistantList from "./assets/components/AssistantList";
import CartographyContainer from './assets/components/CartographyContainer';
import DoctorForm from "./assets/components/DoctorForm";
import DoctorList from "./assets/components/DoctorList";
import MemberForm from "./assets/components/MemberForm";
import MemberList from "./assets/components/MemberList"; // Import correct
import AssociationForm from "./assets/components/AssociationForm";
import AssociationList from "./assets/components/AssociationList";
import HospitalForm from "./assets/components/HospitalForm";
import HospitalList from "./assets/components/HospitalList";
import { AuthContext } from "./assets/components/AuthContext";
import { getTranslation } from "./assets/utils/translations";

// Supprimez cette ligne en double
// import { AuthProvider } from './assets/components/AuthProvider';

import {
  createPatient,
  getAllPatients,
  updatePatient,
  deletePatient as deletePatientService,
} from "./assets/components/patientService";


import {
  createAssistant,
  getAllAssistants,
  updateAssistant,
  deleteAssistant as deleteAssistantService,
} from "./assets/services/assistantService";

import {
  getAllMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember
} from "./assets/services/membreService";

import {
  createAssociation,
  getAllAssociations,
  updateAssociation,
  deleteAssociation as deleteAssociationService,
} from "./assets/services/associationService";

import {
  createDoctor,
  updateDoctor,
    getHopitauxDisponibles,

  deleteDoctor as deleteDoctorService,
  getAllDoctors,
} from "./assets/services/doctorService";

import {
  createHospital,
  getAllHospitals,
  updateHospital,
  deleteHospital as deleteHospitalService,
} from "./assets/services/hospitalService";

function App() {
  const { isAuthenticated, user, loading } = useContext(AuthContext);
  // ... le reste de votre code
 const [currentView, setCurrentView] = useState("cartography");
  const [isCartographyOpen, setIsCartographyOpen] = useState(true);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [members, setMembers] = useState([]);
  const [associations, setAssociations] = useState([]);
  const [assistants, setAssistants] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [editingPatient, setEditingPatient] = useState(null);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  // Ajoutez cette ligne avec les autres états d'édition
  const [editingAssistant, setEditingAssistant] = useState(null);
  const [editingAssociation, setEditingAssociation] = useState(null);
  const [editingHospital, setEditingHospital] = useState(null);
  const [language, setLanguage] = useState("fr");
  const [selectedPatient, setSelectedPatient] = useState(null);
 const [activeMenu, setActiveMenu] = useState("patients");

// --- Navigation / Langue ---


const handleLanguageChange = (newLanguage) => {
  setLanguage(newLanguage);
  localStorage.setItem("selectedLanguage", newLanguage);
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
        const data = await getAllPatients();
        setPatients(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("❌ Erreur lors du chargement des patients :", error);
      }
    };
    fetchPatients();
  }, [isAuthenticated]);

   useEffect(() => {
      if (!isAuthenticated) return;
      const fetchAssistants = async () => {
        try {
          const data = await getAllAssistants();
          setAssistants(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error("❌ Erreur lors du chargement des patients :", error);
        }
      };
      fetchAssistants();
    }, [isAuthenticated]);
  // --- Chargement doctors ---


  // --- Chargement members ---
// --- Chargement members ---
useEffect(() => {
  console.log("🔄 useEffect déclenché - isAuthenticated:", isAuthenticated);

  if (!isAuthenticated) {
    console.log("🔒 Non authentifié - Arrêt du chargement des membres");
    return;
  }

  console.log("✅ Authentifié - Début du chargement des membres");

  const fetchMembers = async () => {
    try {
      console.log("📡 Appel à getAllMembers()...");
      const data = await getAllMembers();
      console.log("✅ Réponse de getAllMembers():", data);

      // Vérification approfondie
      if (data === undefined) {
        console.warn("⚠️ Les données sont undefined");
        setMembers([]);
        return;
      }

      if (data === null) {
        console.warn("⚠️ Les données sont null");
        setMembers([]);
        return;
      }

      console.log("🔍 Analyse détaillée des données:");
      console.log("Type de données:", typeof data);
      console.log("Est un array?", Array.isArray(data));

      let membersData = [];

      if (Array.isArray(data)) {
        membersData = data;
        console.log(`📊 ${data.length} membres dans le tableau principal`);
      }
      else if (data && typeof data === 'object') {
        console.log("Clés de l'objet:", Object.keys(data));

        // Recherche de tableaux dans les propriétés de l'objet
        for (const key in data) {
          if (Array.isArray(data[key])) {
            console.log(`📦 Tableau trouvé dans la clé '${key}':`, data[key]);
            membersData = data[key];
            break;
          }
        }

        if (membersData.length === 0) {
          console.warn("⚠️ Aucun tableau trouvé dans l'objet, exploration complète:", data);
        }
      }

      console.log("🎯 Données finales pour setMembers:", membersData);
      setMembers(membersData);

    } catch (error) {
      console.error("❌ Erreur lors du chargement des membres :", error);

      // Données mock pour tester l'affichage
      const mockData = [
        {
          id: 1,
          code: "MEMTEST",
          pseudo: "MBRTEST",
          associationCode: "ASSO001",
          associationPseudo: "Test Association",
          utilisateurId: 46,
          nomUtilisateur: "Fatima",
          prenomUtilisateur: "Mbaye",
          emailUser: "MEMBRE_LU1JFB",
          nomCompletUtilisateur: "Mbaye Fatima"
        },
        {
          id: 2,
          code: "MEMTEST2",
          pseudo: "MBRTEST2",
          associationCode: "ASSO002",
          associationPseudo: "Test Association 2",
          utilisateurId: 47,
          nomUtilisateur: "Diallo",
          prenomUtilisateur: "Amadou",
          emailUser: "amadou.diallo@example.com",
          nomCompletUtilisateur: "Amadou Diallo"
        }
      ];

      console.log("🔄 Utilisation des données mock pour test");
      setMembers(mockData);
    }
  };

  fetchMembers();
}, [isAuthenticated]);

  // --- Chargement associations ---
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchAssociations = async () => {
      try {
        const data = await getAllAssociations();
        setAssociations(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("❌ Erreur lors du chargement des associations :", error);
      }
    };
    fetchAssociations();
  }, [isAuthenticated]);

  // --- Chargement hospitals ---
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchHospitals = async () => {
      try {
        console.log('🔄 Début du chargement des hôpitaux...');
        console.log('Token:', localStorage.getItem('token'));

        const data = await getAllHospitals();
        console.log('✅ Hôpitaux chargés avec succès:', data);

        setHospitals(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('❌ Erreur complète lors du chargement des hôpitaux:', error);
        console.error('Message:', error.message);
        console.error('Response data:', error.response?.data);

        // Affichez un message d'erreur à l'utilisateur
        alert('Erreur lors du chargement des hôpitaux: ' + error.message);
      }
    };

    fetchHospitals();
  }, [isAuthenticated]);

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
      setCurrentView("patientList");
    } catch (error) {
      console.error("❌ Erreur API patient :", error);
    }
  };






  const handlePatientCancel = () => {
    setEditingPatient(null);
    setCurrentView("patientList");
  };

  const handleEditPatient = (patient) => {
    setEditingPatient(patient);
    setCurrentView("addPatient");
  };

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setCurrentView("PatientView");
  };

  const handleDeletePatient = async (codePatient) => {
    try {
      await deletePatientService(codePatient);
      setPatients((prev) => prev.filter((p) => p.codePatient !== codePatient));
    } catch (error) {
      console.error("❌ Erreur suppression patient :", error);
    }
  };

// --- Chargement doctors ---
useEffect(() => {
  if (!isAuthenticated) return;

  const fetchDoctors = async () => {
    try {
      console.log("📡 Chargement des médecins...");
      const data = await getAllDoctors();
      console.log("✅ Médecins chargés :", data);
      setDoctors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("❌ Erreur lors du chargement des médecins :", error);
      setDoctors([]); // éviter crash si API échoue
    }
  };

  fetchDoctors();
}, [isAuthenticated]);



  const handleDoctorSave = async (doctorData) => {
    try {
      if (editingDoctor) {
        const code = editingDoctor.codeDoctor;
        if (!code) throw new Error("codeDoctor manquant pour la mise à jour");

        // Appel API pour update
        const updatedDoctor = await updateDoctor(code, doctorData);

        // Mettre à jour la liste
        setDoctors((prev) =>
          prev.map((d) => (d.codeDoctor === code ? updatedDoctor : d))
        );
      } else {
        // Création
        const savedDoctor = await createDoctor(doctorData);
        setDoctors((prev) => [...prev, savedDoctor]);
      }

      // Réinitialiser l'édition et retourner à la liste
      setEditingDoctor(null);
      setCurrentView("doctorList");
    } catch (error) {
      console.error("❌ Erreur API docteur :", error);
      alert("Erreur lors de l'enregistrement du médecin");
    }
  };

const handleEditDoctor = (doctor) => {
  if (!doctor.codeDoctor) {
    console.error("❌ Aucun codeDoctor trouvé pour ce médecin", doctor);
    alert("Impossible de modifier : codeDoctor manquant");
    return;
  }
  setEditingDoctor(doctor);
  setCurrentView("addDoctor");
};
// ➤ Annulation ajout/édition médecin



const handleDeleteDoctor = async (codeDoctor) => {
  if (!codeDoctor) {
    alert("Erreur: codeDoctor manquant pour la suppression");
    return;
  }

  if (!window.confirm("Voulez-vous vraiment supprimer ce médecin ?")) return;

  try {
    await deleteDoctorService(codeDoctor);
    setDoctors((prev) => prev.filter((d) => d.codeDoctor !== codeDoctor));
  } catch (error) {
    console.error("❌ Erreur suppression médecin :", error);
    alert("Erreur lors de la suppression du médecin");
  }
};


 const handleDoctorCancel = () => {
   setEditingDoctor(null);
   setCurrentView("doctorList");
 };




const handleDeleteAssistant = async (codeAssistant) => {
  try {
    await deleteAssistantService(codeAssistant);
    setAssistants((prev) => prev.filter((a) => a.codeAssistant !== codeAssistant));
  } catch (error) {
    console.error("❌ Erreur suppression assistant :", error);
  }
};
// --- Gestion assistants ---
const handleAssistantCancel = () => {
  setEditingAssistant(null);
  setCurrentView("assistantList");
};

const handleEditAssistant = (assistant) => {
  setEditingAssistant(assistant);
  setCurrentView("addAssistant");
};

// Votre fonction handleAssistantSave existe déjà, assurez-vous qu'elle est correcte :
const handleAssistantSave = async (assistantData) => {
  try {
    if (editingAssistant) {
      await updateAssistant(editingAssistant.codeAssistant, assistantData);
      setAssistants((prev) =>
        prev.map((a) =>
          a.codeAssistant === editingAssistant.codeAssistant ? assistantData : a
        )
      );
    } else {
      const savedAssistant = await createAssistant(assistantData);
      setAssistants((prev) => [...prev, savedAssistant]);
    }
    setEditingAssistant(null);
    setCurrentView("assistantList");
  } catch (error) {
    console.error("❌ Erreur API assistant :", error);
  }
};
  // --- Gestion members ---
  const handleMemberSave = async (memberData) => {
    try {
      if (editingMember) {
        await updateMember(editingMember.id, memberData);
        setMembers((prev) =>
          prev.map((m) => (m.id === editingMember.id ? memberData : m))
        );
      } else {
        const savedMember = await createMember(memberData);
        setMembers((prev) => [...prev, savedMember]);
      }
      setEditingMember(null);
      setCurrentView("memberList");
    } catch (error) {
      console.error("❌ Erreur API membre :", error);
    }
  };

// Dans votre composant App
const [availableHospitals, setAvailableHospitals] = useState([]);

// Ajoutez cet useEffect pour charger les hôpitaux disponibles
useEffect(() => {
  if (!isAuthenticated) return;

  const fetchAvailableHospitals = async () => {
    try {
      console.log('🔄 Chargement des hôpitaux disponibles...');
      const data = await getHopitauxDisponibles();
      console.log('✅ Hôpitaux disponibles chargés:', data);
      setAvailableHospitals(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des hôpitaux disponibles:', error);
      // Fallback: utiliser la liste complète des hôpitaux
      setAvailableHospitals(hospitals.filter(h => h.active));
    }
  };

  fetchAvailableHospitals();
}, [isAuthenticated, hospitals]); // Dépend de hospitals pour le fallback


const [availableHospitalAssist, setAvailableHospitalAssist] = useState([]);

// Ajoutez cet useEffect pour charger les hôpitaux disponibles
useEffect(() => {
  if (!isAuthenticated) return;

  const fetchAvailableHospitalAssist = async () => {
    try {
      console.log('🔄 Chargement des hôpitaux disponibles...');
      const data = await getHopitauxDisponibles();
      console.log('✅ Hôpitaux disponibles chargés:', data);
      setAvailableHospitalAssist(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des hôpitaux disponibles:', error);
      // Fallback: utiliser la liste complète des hôpitaux
      setAvailableHospitalAssist(hospitals.filter(h => h.active));
    }
  };

  fetchAvailableHospitalAssist();
}, [isAuthenticated, hospitals]); // Dépend de hospitals pour le fallback


  const handleMemberCancel = () => {
    setEditingMember(null);
    setCurrentView("memberList");
  };

  const handleEditMember = (member) => {
    setEditingMember(member);
    setCurrentView("addMember");
  };

  const handleDeleteMember = async (id) => {
    try {
      await deleteMember(id);
      setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch (error) {
      console.error("❌ Erreur suppression membre :", error);
    }
  };

  // --- Gestion associations ---
  const handleAssociationSave = async (associationData) => {
    try {
      if (editingAssociation) {
        await updateAssociation(editingAssociation.codeAssociation, associationData);
        setAssociations((prev) =>
          prev.map((a) => (a.codeAssociation === editingAssociation.codeAssociation ? associationData : a))
        );
      } else {
        const savedAssociation = await createAssociation(associationData);
        setAssociations((prev) => [...prev, savedAssociation]);
      }
      setEditingAssociation(null);
      setCurrentView("associationList");
    } catch (error) {
      console.error("❌ Erreur API association :", error);
    }
  };

  const handleAssociationCancel = () => {
    setEditingAssociation(null);
    setCurrentView("associationList");
  };

  const handleEditAssociation = (association) => {
    setEditingAssociation(association);
    setCurrentView("addAssociation");
  };

  const handleDeleteAssociation = async (codeAssociation) => {
    try {
      await deleteAssociationService(codeAssociation);
      setAssociations((prev) => prev.filter((a) => a.codeAssociation !== codeAssociation));
    } catch (error) {
      console.error("❌ Erreur suppression association :", error);
    }
  };

  // --- Gestion hospitals ---
  const handleHospitalSave = async (hospitalData) => {
    try {
      if (editingHospital) {
        await updateHospital(editingHospital.id, hospitalData);
        setHospitals((prev) =>
          prev.map((h) => (h.id === editingHospital.id ? hospitalData : h))
        );
      } else {
        const savedHospital = await createHospital(hospitalData);
        setHospitals((prev) => [...prev, savedHospital]);
      }
      setEditingHospital(null);
      setCurrentView("hospitalList");
    } catch (error) {
      console.error("❌ Erreur API hôpital :", error);
    }
  };

  const handleHospitalCancel = () => {
    setEditingHospital(null);
    setCurrentView("hospitalList");
  };

  const handleEditHospital = (hospital) => {
    setEditingHospital(hospital);
    setCurrentView("addHospital");
  };

  const handleDeleteHospital = async (id) => {
    try {
      await deleteHospitalService(id);
      setHospitals((prev) => prev.filter((h) => h.id !== id));
    } catch (error) {
      console.error("❌ Erreur suppression hôpital :", error);
    }
  };

  // --- Navigation / Langue ---
 const handleMenuSelect = (view) => {
   setCurrentView(view);

   // Gestion cartographie
   if (view === "cartography") {
     setIsCartographyOpen(true);
   } else {
     setIsCartographyOpen(false);
   }

   // Gestion langue (si le view correspond à une langue)
   if (view === "fr" || view === "en" || view === "es") {
     setLanguage(view);
     localStorage.setItem("selectedLanguage", view);
   }
 };

  // --- Contenu principal ---
    // --- Contenu principal ---
    const renderContent = () => {
      if (isCartographyOpen) {
        return <CartographyContainer language={language} />;
      }

      switch (currentView) {
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
            />
          );

        case "addDoctor":
          return (
            <DoctorForm
              initialData={editingDoctor}
              hospitals={availableHospitals}
              onSave={handleDoctorSave}
              onCancel={handleDoctorCancel}
              language={language}
            />
          );

        case "addAssistant":
          return (
            <AssistantForm
              initialData={editingAssistant}
              onSave={handleAssistantSave}
              onCancel={handleAssistantCancel}
              language={language}
              hospitals={availableHospitalAssist} // ✅ gardez seulement UNE liste
            />
          );

        case "assistantList":
          return (
            <AssistantList
              assistants={assistants}
              language={language}
              onEdit={handleEditAssistant}
              onDelete={handleDeleteAssistant}
            />
          );

        case "doctorList":
          return (
            <DoctorList
              doctors={doctors}
              language={language}
              onEdit={handleEditDoctor}
              onDelete={handleDeleteDoctor}
            />
          );

        case "addMember":
          return (
            <MemberForm
              initialData={editingMember}
              onSave={handleMemberSave}
              onCancel={handleMemberCancel}
              language={language}
            />
          );

        case "memberList":
          return (
            <MemberList
              members={members}
              language={language}
              onEdit={handleEditMember}
              onDelete={handleDeleteMember}
              associations={associations}
            />
          );

        case "addAssociation":
          return (
            <AssociationForm
              initialData={editingAssociation}
              onSave={handleAssociationSave}
              onCancel={handleAssociationCancel}
              language={language}
            />
          );

        case "associationList":
          return (
            <AssociationList
              associations={associations}
              language={language}
              onEdit={handleEditAssociation}
              onDelete={handleDeleteAssociation}
            />
          );

        case "addHospital":
          return (
            <HospitalForm
              initialData={editingHospital}
              onSave={handleHospitalSave}
              onCancel={handleHospitalCancel}
              language={language}
            />
          );

        case "hospitalList":
          return (
            <HospitalList
              hospitals={hospitals}
              language={language}
              onEdit={handleEditHospital}
              onDelete={handleDeleteHospital}
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
        language={language}
        onLanguageChange={handleLanguageChange}
        patientCount={patients.length}
        doctorCount={doctors.length}
        memberCount={members.length}
        assistantCount={assistants.length}
        associationCount={associations.length}
        hospitalCount={hospitals.length}
      />
      <main className="flex-1">
        {renderContent()}
      </main>
    </div>
  );

  }

  export default App;
