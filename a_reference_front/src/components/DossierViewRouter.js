// src/components/DossierViewRouter.jsx
import React from "react";
import ViewDossierAdulte from "./ViewDossierAdulte";
import ViewDossierMineur from "./ViewDossierMineur";

// Fonction pour calculer l'âge
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

const DossierViewRouter = ({ patient, onBack, language = "fr", dossierProp = null }) => {
  // Calculer l'âge et déterminer si c'est un mineur (≤15 ans)
  const age = patient?.dateNaissance ? calculateAge(patient.dateNaissance) : null;
  const isMinor = age !== null && age <= 15;

  // Router vers la vue appropriée
  if (isMinor) {
    return (
      <ViewDossierMineur 
        patient={patient} 
        onBack={onBack} 
        language={language} 
        dossierProp={dossierProp} 
      />
    );
  } else {
    return (
      <ViewDossierAdulte 
        patient={patient} 
        onBack={onBack} 
        language={language} 
        dossierProp={dossierProp} 
      />
    );
  }
};

export default DossierViewRouter;
