// FormulaireCompletFusionne.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DossierView from "./DossierView";
import axios from "axios";
import { getTranslation } from '../utils/translations';
export default function FormulaireCompletFusionne({patient,language}) {
  const totalSteps = 16;
  const [step, setStep] = useState(1);
const [dossierCree, setDossierCree] = useState(null);
  const initialFormData = { /* mÃªme structure que formData ci-dessous */
   pereNomPrenoms: "",
   pereStatut: "",
   pereNiveauInstruction: "",
   pereProfession: "",
   pereStatutVih: "",
   pereTelephone: "",
   mereNomPrenoms: "",
   mereStatut: "",
   mereNiveauInstruction: "",
   mereProfession: "",
   mereStatutVih: "",
   mereTelephone: "",
   naissanceStructure: "",
   poidsNaissance: "",
   tailleNaissance: "",
   perimetreCranien: "",
   apgar: "",
   portesEntree: [],
   reference: "Non",
   dateReference: "",
   siteOrigine: "",
   dateTest: "",
   dateConfirmation: "",
   lieuTest: "",
   resultat: "",
   dateDebutETP: "",
   ageETP: "",
   annonceComplete: "",
   ageAnnonce: "",
   vaccins: [],
   autresVaccins: "",
   enfantProphylaxieArvNaissance: "",
   enfantProphylaxieCotrimoxazole: "",
   enfantAlimentation: [],
   enfantSevrageAgeMois: "",
   enfantNumeroSeropositif: "",
   mereTritherapieGrossesse: "",
   dateDebutARV: "",
   protocoleInitialArv: "",
   protocoleActuelArv: "",
   repondant1Nom: "",
   repondant1Lien: "",
   repondant1Niveau: "",
   repondant1Profession: "",
   repondant1Tel: "",
   repondant2Nom: "",
   repondant2Lien: "",
   repondant2Niveau: "",
   repondant2Profession: "",
   repondant2Tel: "",
   arvStadeOmsInitial: "",
   protocole: "",
   stadeOmsInitial: [],
   tuberculose: "",
   autresAnt: "",
   
   // âœ… CHAMPS MANQUANTS : Informations personnelles
   profession: "",
   statutFamilial: "",
   personneContact: "",
   telephoneContact: "",
   soutienNom: "",
   soutienPrenoms: "",
   soutienLien: "",
   soutienTelephone: "",
   soutienAdresse: "",
   
   // âœ… CHAMPS MANQUANTS : TAR
   stadeOms: "",
   dateDebutTar: "",
   protocoleInitialTar: "",
   
   // âœ… CHAMPS MANQUANTS : Autres infos
   nbGrossessesPtme: "",
   contraception: "",
   prep: "",
   maladiesChroniques: "",
   autresMaladiesChroniques: "",
   renseignementClinique: {
     poidsKg: "",
     traitementARV: false,
     traitementtb: false,
     allergie: "",
     aghbs: "",
     cd4DebutTraitement: "",
     cd4Dernier: "",
     chargeViraleNiveau: "",
     profils: { pediatrique: false, adulte: false, adolescent: false },
     stades: { stade1: false, stade2: false, stade3: false, stade4: false },
   },
   contacts: [],
   grossesses: [],
   bilans: [],
   suivis: [],
   fiches: [],
   tbFiches: [],
   suiviArvs: [],
 };
 const [formData, setFormData] = useState({
   // Parents
   pereNomPrenoms: "",
   pereStatut: "",
   pereNiveauInstruction: "",
   pereProfession: "",
   pereStatutVih: "",
   pereTelephone: "",

   mereNomPrenoms: "",
   mereStatut: "",
   mereNiveauInstruction: "",
   mereProfession: "",
   mereStatutVih: "",
   mereTelephone: "",

   // Naissance
   naissanceStructure: "",
   poidsNaissance: "",
   tailleNaissance: "",
   perimetreCranien: "",
   apgar: "",
   portesEntree: [],
   reference: "Non",
   dateReference: "",
   siteOrigine: "",

   // VIH / ETP
   dateTest: "",
   dateConfirmation: "",
   lieuTest: "",
   resultat: "",
   dateDebutETP: "",
   ageETP: "",
   annonceComplete: "",
   ageAnnonce: "",

   // Vaccins
   vaccins: [],
   autresVaccins: "",

   // Enfant exposÃ©
   enfantProphylaxieArvNaissance: "",
   enfantProphylaxieCotrimoxazole: "",
   enfantAlimentation: [],
   enfantSevrageAgeMois: "",
   enfantNumeroSeropositif: "",

   // Infos mÃ¨re
   mereTritherapieGrossesse: "",
   dateDebutARV: "",
   protocoleInitialArv: "",
   protocoleActuelArv: "",

   // RÃ©pondants lÃ©gaux
   repondant1Nom: "",
   repondant1Lien: "",
   repondant1Niveau: "",
   repondant1Profession: "",
   repondant1Tel: "",
   repondant2Nom: "",
   repondant2Lien: "",
   repondant2Niveau: "",
   repondant2Profession: "",
   repondant2Tel: "",

   // AntÃ©cÃ©dents & OMS
   arvStadeOmsInitial: "",
   protocole: "",
   stadeOmsInitial: [],
   tuberculose: "",
   autresAnt: "",
   
   // âœ… CHAMPS MANQUANTS : Informations personnelles
   profession: "",
   statutFamilial: "",
   personneContact: "",
   telephoneContact: "",
   soutienNom: "",
   soutienPrenoms: "",
   soutienLien: "",
   soutienTelephone: "",
   soutienAdresse: "",
   
   // âœ… CHAMPS MANQUANTS : TAR
   stadeOms: "",
   dateDebutTar: "",
   protocoleInitialTar: "",
   
   // âœ… CHAMPS MANQUANTS : Autres infos
   nbGrossessesPtme: "",
   contraception: "",
   prep: "",
   maladiesChroniques: "",
   autresMaladiesChroniques: "",

   // Renseignement clinique
   renseignementClinique: {
     poidsKg: "",
     traitementARV: false,
     traitementtb: false,
     allergie: "",
     aghbs: "",
     cd4DebutTraitement: "",
     cd4Dernier: "",
     chargeViraleNiveau: "",
     profils: {
       pediatrique: false,
       adulte: false,
       adolescent: false,
     },
     stades: {
       stade1: false,
       stade2: false,
       stade3: false,
       stade4: false,
     },
   },

   // ðŸ”¥ manquait ici
    contacts: [],
     grossesses: [],
     bilans: [],
     suivis: [],
     fiches: [],   // ðŸ”¥ manquait ici
     tbFiches: [],

       suiviArvs: [],// ðŸ”¥ dÃ©jÃ  prÃ©sent


 });

  const resetForm = () => {
    setFormData(JSON.parse(JSON.stringify(initialFormData)));
    setGrossesses([{ dateDiagnostic: "", rangCpn: "", dateProbableAcc: "", issue: "", dateReelle: "", modeAcc: "", allaitement: "", prophylaxie: "", protocole: "", dateDebutProtocole: "", pcr1: "", datePrelPcr: "", resultatPcr: "", serologie: "", datePrelSero: "", resultatSero: "" }]);
    setBilans([]);
    setIndexTests([]);
    setSuivis([]);
    setFiches([]);
    setTbFiches([]);
    setSuiviArvs([{ dateVisite: "", situationArv: "", changementLignePreciser: "", protocole: "", substitutionMotif: "", substitutionPrecision: "", stadeCliniqueOms: "", observanceCorrecte: "", evaluationNutritionnelle: "", classification: "", modeleSoinsNumero: "", prochainRdv: "" }]);
    setSuiviImmunovirologiques([]);
    setSuiviPathologiques([]);
    setDepistageFamiliales([]);
    setStep(1);
  };


  // Helpers pour tableaux (checkbox)
  const toggleArrayValue = (field, value) => {
    setFormData((prev) => {
      const arr = Array.isArray(prev[field]) ? [...prev[field]] : [];
      const idx = arr.indexOf(value);
      if (idx >= 0) arr.splice(idx, 1);
      else arr.push(value);
      return { ...prev, [field]: arr };
    });
  };

  // Toggle nested boolean for deep group (e.g., renseignementClinique.profils/stades)
  const toggleNestedGroupBoolean = (parentKey, groupKey, key) => {
    setFormData((prev) => {
      const updated = { ...prev };
      const parent = { ...(updated[parentKey] || {}) };
      const group = { ...(parent[groupKey] || {}) };
      group[key] = !group[key];
      parent[groupKey] = group;
      updated[parentKey] = parent;
      return updated;
    });
  };

  // Handle inputs
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }));
  };

  const prevStep = () => setStep((s) => Math.max(1, s - 1));
  const nextStep = () => setStep((s) => Math.min(totalSteps, s + 1));

  const ajouterContact = () => {
    setFormData((prev) => ({
      ...prev,
      contacts: [
        ...prev.contacts,
        {
          nom: "",
          type: "",
          age: "",
          sexe: "",
          statut: "",
          resultat: "",
          soins: "",
          id: "",
        },
      ],
    }));
  };

  const supprimerContact = (index) => {
    setFormData((prev) => {
      const updated = [...prev.contacts];
      updated.splice(index, 1);
      return { ...prev, contacts: updated };
    });
  };

  const mettreAJourContact = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.contacts];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, contacts: updated };
    });
  };

   const [grossesses, setGrossesses] = useState([
        {
          dateDiagnostic: "",
          rangCpn: "",
          dateProbableAcc: "",
          issue: "",
          dateReelle: "",
          modeAcc: "",
          allaitement: "",
          prophylaxie: "",
          protocole: "",
          dateDebutProtocole: "",
          pcr1: "",
          datePrelPcr: "",
          resultatPcr: "",
          serologie: "",
          datePrelSero: "",
          resultatSero: "",
        },
      ]);

      const ajouterGrossesse = () => {
        setGrossesses([
          ...grossesses,
          {
            dateDiagnostic: "",
            rangCpn: "",
            dateProbableAcc: "",
            issue: "",
            dateReelle: "",
            modeAcc: "",
            allaitement: "",
            prophylaxie: "",
            protocole: "",
            dateDebutProtocole: "",
            pcr1: "",
            datePrelPcr: "",
            resultatPcr: "",
            serologie: "",
            datePrelSero: "",
            resultatSero: "",
          },
        ]);
      };

      const supprimerGrossesse = (index) => {
        setGrossesses(grossesses.filter((_, i) => i !== index));
      };

      const majGrossesse = (index, champ, valeur) => {
        const newGrossesses = [...grossesses];
        newGrossesses[index][champ] = valeur;
        setGrossesses(newGrossesses);
      };

       const [bilans, setBilans] = useState([]);
       const [indexTests, setIndexTests] = useState([]);
// --- Gestion des bilans biologiques ---
// Dans ton useState global


// --- Gestion des bilans biologiques ---
const ajouterBilan = () => {
  setFormData((prev) => ({
    ...prev,
    bilans: [
      ...prev.bilans,
      {
        date: "",
        hb: "",
        vgm: "",
        ccmh: "",
        gb: "",
        neutrophiles: "",
        lymphocytes: "",
        plaquettes: "",
        alat: "",
        asat: "",
        glycemie: "",
        creatinine: "",
        aghbs: "",
        tb_lam: "",
        ag_crypto: "",
        genexpert: "",
        proteinurie: "",
        chol_total: "",
        hdl: "",
        ldl: "",
        triglycerides: "",
        depistage_col: "",
        syphilis: "",
      },
    ],
  }));
};

const nouveauDossier = {
      patientCode: patient?.codePatient,
      patientNom: patient?.nomUtilisateur,
      patientPrenom: patient?.prenomUtilisateur,
      dateCreation: new Date().toISOString(),
      // ... + les autres champs du formulaire
    };

const supprimerBilan = (index) => {
  setFormData((prev) => {
    const updated = [...prev.bilans];
    updated.splice(index, 1);
    return { ...prev, bilans: updated };
  });
};

const mettreAJourBilan = (index, field, value) => {
  setFormData((prev) => {
    const updated = [...prev.bilans];
    updated[index] = { ...updated[index], [field]: value };
    return { ...prev, bilans: updated };
  });
};



  const [suivis, setSuivis] = useState([]);

    // âž• Ajouter un suivi
    const ajouterSuivi = () => {
      setSuivis([
        ...suivis,
        {
          datePrelevement: "",
          dateResultat: "",
          resultatCV: "",
          dateCD4: "",
          resultatCD4: "",
          cd4Categorie: "", // >=200 ou <200
        },
      ]);
    };

    // âœï¸ Modifier un champ
    const modifierSuivi = (index, champ, valeur) => {
      const newSuivis = [...suivis];
      newSuivis[index][champ] = valeur;
      setSuivis(newSuivis);
    };

    // âŒ Supprimer un suivi
    const supprimerSuivi = (index) => {
      setSuivis(suivis.filter((_, i) => i !== index));
    };

  const [suiviss, setSuiviss] = useState([]);

  // âž• Ajouter un suivi
  const ajouterSuiviImmino = () => {
    setSuiviss([
      ...suiviss,
      {
        datePrelevement: "",
        dateResultat: "",
        resultatCV: "",
        dateCD4: "",
        resultatCD4: "",
        cd4Categorie: "", // >=200 ou <200
      },
    ]);
  };

  // âœï¸ Modifier un champ
  // Ajouter un suivi immunovirologique
  const ajouterSuiviImmuno = () => {
    setFormData((prev) => ({
      ...prev,
      suivis: [
        ...prev.suivis,
        {
          datePrelevement: "",
          dateResultat: "",
          resultatCV: "",
          dateCD4: "",
          cd4Categorie: "",
        },
      ],
    }));
  };

  // Supprimer un suivi immunovirologique
  const supprimerSuiviImmuno = (index) => {
    setFormData((prev) => {
      const updated = [...prev.suivis];
      updated.splice(index, 1);
      return { ...prev, suivis: updated };
    });
  };

  // Modifier un champ dâ€™un suivi immunovirologique
  const modifierSuiviImmuno = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.suivis];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, suivis: updated };
    });
  };


  const [fiches, setFiches] = useState([]);

 // Ajouter une fiche de suivi
 const ajouterFiche = () => {
   setFormData((prev) => ({
     ...prev,
     fiches: [
       ...prev.fiches,
       {
         date: "",
         taille: "",
         poids: "",
         imc: "",
         temperature: "",
         ta: "",
         pouls: "",
         rechercheTB: "",
         resultatTB: "",
         tpt: "",
         autresPathologies: "",
         dateAutrePatholo: "",
         cotrimoxazole: "",
       },
     ],
   }));
 };

 // Supprimer une fiche
 const supprimerFiche = (index) => {
   setFormData((prev) => {
     const updated = [...prev.fiches];
     updated.splice(index, 1);
     return { ...prev, fiches: updated };
   });
 };

 // Modifier une fiche
 const modifierFiche = (index, field, value) => {
   setFormData((prev) => {
     const updated = [...prev.fiches];
     updated[index] = { ...updated[index], [field]: value };
     return { ...prev, fiches: updated };
   });
 };


  // State
  const [tbFiches, setTbFiches] = useState([]);

  // Ajouter une ligne
  // Ajouter une nouvelle fiche TB
  const ajouterTbFiche = () => {
    setFormData((prev) => ({
      ...prev,
      tbFiches: [
        ...prev.tbFiches,
        {
          date: "",
          debut: "",
          fin: "",
          issu: "",
        },
      ],
    }));
  };

  // Supprimer une fiche TB
  const supprimerTbFiche = (index) => {
    setFormData((prev) => {
      const updated = [...prev.tbFiches];
      updated.splice(index, 1);
      return { ...prev, tbFiches: updated };
    });
  };

  // Mettre Ã  jour une valeur dâ€™une fiche TB
  const modifierTbFiche = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.tbFiches];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, tbFiches: updated };
    });
  };


 // Dans ton useState principal du formulaire
 const [suiviArvs, setSuiviArvs] = useState([
   {
     dateVisite: "",
     situationArv: "",
     changementLignePreciser: "",
     protocole: "",
     substitutionMotif: "",
     substitutionPrecision: "",
     stadeCliniqueOms: "",
     observanceCorrecte: "",
     evaluationNutritionnelle: "",
     classification: "",
     modeleSoinsNumero: "",
     prochainRdv: "",
   },
 ]);

 // PHASE 1: COLLECTIONS MANQUANTES
 const [suiviImmunovirologiques, setSuiviImmunovirologiques] = useState([]);
 const [suiviPathologiques, setSuiviPathologiques] = useState([]);
 const [depistageFamiliales, setDepistageFamiliales] = useState([]);

 // PHASE 3: Calcul d'âge et détection mineur/adulte
 const calculateAge = (birthDate) => {
   if (!birthDate) return null;
   const birth = new Date(birthDate);
   const today = new Date();
   let age = today.getFullYear() - birth.getFullYear();
   if (today.getMonth() - birth.getMonth() < 0 || (today.getMonth() - birth.getMonth() === 0 && today.getDate() < birth.getDate())) age--;
   return age;
 };
 const isMinor = patient?.dateNaissance ? calculateAge(patient.dateNaissance) <= 15 : false;

 // Fonctions de gestion du tableau
 const ajouterSuiviArv = () => {
   setSuiviArvs([
     ...suiviArvs,
     {
       dateVisite: "",
       situationArv: "",
       changementLignePreciser: "",
       protocole: "",
       substitutionMotif: "",
       substitutionPrecision: "",
       stadeCliniqueOms: "",
       observanceCorrecte: "",
       evaluationNutritionnelle: "",
       classification: "",
       modeleSoinsNumero: "",
       prochainRdv: "",
     },
   ]);
 };

 const supprimerSuiviArv = (index) => {
   setSuiviArvs(suiviArvs.filter((_, i) => i !== index));
 };

 const modifierSuiviArv = (index, field, value) => {
   const newData = [...suiviArvs];
   newData[index][field] = value;
   setSuiviArvs(newData);
 };



// âš¡ ajoute Ã§a tout en haut

const handleSubmit = async () => {
  const payload = {
    codeDossier: (patient?.codePatient + "-" + new Date().toISOString().split("T")[0] + "-DOC" + Math.random().toString(36).substr(2, 9).toUpperCase()),   // peut venir dâ€™un state
    codePatient: patient?.codePatient || "",
    identificationBiom: localStorage.getItem("irisTemplate") || localStorage.getItem("identificationBiom") || "",
    irisImageBase64: localStorage.getItem("irisImage") || "",
    pages: [
      {
        // SECTION I - PÃ¨re
        pereNomPrenoms: formData.pereNomPrenoms || "",
        pereStatut: formData.pereStatut || "",
        pereNiveauInstruction: formData.pereNiveauInstruction || "",
        pereProfession: formData.pereProfession || "",
        pereStatutVih: formData.pereStatutVih || "",
        pereTelephone: formData.pereTelephone || "",

        // SECTION I - MÃ¨re
        mereNomPrenoms: formData.mereNomPrenoms || "",
        mereStatut: formData.mereStatut || "",
        mereNiveauInstruction: formData.mereNiveauInstruction || "",
        mereProfession: formData.mereProfession || "",
        mereStatutVih: formData.mereStatutVih || "",
        mereTelephone: formData.mereTelephone || "",

        // SECTION II - Naissance
        naissanceStructure: formData.naissanceStructure || "",
        poidsNaissance: formData.poidsNaissance ? parseFloat(formData.poidsNaissance) : "",
        tailleNaissance: formData.tailleNaissance ? parseFloat(formData.tailleNaissance) : "",
        perimetreCranien: formData.perimetreCranien ? parseFloat(formData.perimetreCranien) : "",
        apgar: formData.apgar ? parseInt(formData.apgar, 10) : "",
        portesEntree: formData.portesEntree || "",

        // SECTION III - RÃ©fÃ©rence
        reference: formData.reference || "",
        dateReference: formData.dateReference || "",
        siteOrigine: formData.siteOrigine || "",

        // SECTION IV - Test
        dateTest: formData.dateTest || "",
        dateConfirmation: formData.dateConfirmation || "",
        lieuTest: formData.lieuTest || "",
        resultat: formData.resultat || "",

        // SECTION V - ETP et Annonce
        dateDebutETP: formData.dateDebutETP || "",
        ageETP: formData.ageETP ? parseInt(formData.ageETP, 10) : "",
        annonceComplete: formData.annonceComplete || "",
        ageAnnonce: formData.ageAnnonce ? parseInt(formData.ageAnnonce, 10) : "",

        // SECTION VI - Vaccins
        vaccins: formData.vaccins || "",
        autresVaccins: formData.autresVaccins || "",

        // SECTION VII - Prophylaxie et Alimentation
        enfantProphylaxieArvNaissance: formData.enfantProphylaxieArvNaissance || "",
        enfantProphylaxieCotrimoxazole: formData.enfantProphylaxieCotrimoxazole || "",
        enfantAlimentation: formData.enfantAlimentation || "",
        enfantSevrageAgeMois: formData.enfantSevrageAgeMois ? parseInt(formData.enfantSevrageAgeMois, 10) : "",
        enfantNumeroSeropositif: formData.enfantNumeroSeropositif ? parseInt(formData.enfantNumeroSeropositif, 10) : "",
        mereTritherapieGrossesse: formData.mereTritherapieGrossesse || "",

        // SECTION VIII - ARV Enfant
        dateDebutArv: formData.dateDebutArv || "",
        protocoleInitialArv: formData.protocoleInitialArv || "",
        protocoleActuelArv: formData.protocoleActuelArv || "",
        arvStadeOmsInitial: formData.arvStadeOmsInitial || "",
        stadeOmsInitial: formData.stadeOmsInitial || "",

        // SECTION IX - RÃ©pondants
        repondant1Nom: formData.repondant1Nom || "",
        repondant1Lien: formData.repondant1Lien || "",
        repondant1Niveau: formData.repondant1Niveau || "",
        repondant1Profession: formData.repondant1Profession || "",
        repondant1Tel: formData.repondant1Tel || "",
        repondant2Nom: formData.repondant2Nom || "",
        repondant2Lien: formData.repondant2Lien || "",
        repondant2Niveau: formData.repondant2Niveau || "",
        repondant2Profession: formData.repondant2Profession || "",
        repondant2Tel: formData.repondant2Tel || "",

        // SECTION X - AntÃ©cÃ©dents
        tuberculose: formData.tuberculose || "",
        autresAnt: formData.autresAnt || "",
        profession: formData.profession || "",
        statutFamilial: formData.statutFamilial || "",

        // SECTION XI - Personne de Contact et Soutien
        personneContact: formData.personneContact || "",
        telephoneContact: formData.telephoneContact || "",
        soutienNom: formData.soutienNom || "",
        soutienPrenoms: formData.soutienPrenoms || "",
        soutienLien: formData.soutienLien || "",
        soutienTelephone: formData.soutienTelephone || "",
        soutienAdresse: formData.soutienAdresse || "",

        // SECTION XII - Stade Adulte
        stadeOms: formData.stadeOms || "",
        dateDebutTar: formData.dateDebutTar || "",
        protocoleInitialTar: formData.protocoleInitialTar || "",

        // SECTION XIII - SantÃ© Maternelle
        nbGrossessesPtme: formData.nbGrossessesPtme || "",
        contraception: formData.contraception || "",
        prep: formData.prep || "",
        maladiesChroniques: formData.maladiesChroniques || "",
        autresMaladiesChroniques: formData.autresMaladiesChroniques || "",

        // Bilans
        bilans: bilans.map((b) => ({
          hb: b.hb || "",
          vgm: b.vgm || "",
          ccmh: b.ccmh || "",
          gb: b.gb || "",
          neutrophiles: b.neutrophiles || "",
          lymphocytes: b.lymphocytes || "",
          plaquettes: b.plaquettes || "",
          alat: b.alat || "",
          asat: b.asat || "",
          glycemie: b.glycemie || "",
          creat: b.creat || "",
          aghbs: b.aghbs || "",
          tb_lam: b.tb_lam || "",
          ag_crypto: b.ag_crypto || "",
          genexpert: b.genexpert || "",
          proteinurie: b.proteinurie || "",
          chol_total: b.chol_total || "",
          hdl: b.hdl || "",
          ldl: b.ldl || "",
          triglycerides: b.triglycerides || "",
          depistage_col: b.depistage_col || "",
          syphilis: b.syphilis || "",
        })),

        // PTME (grossesses)
        ptmes: grossesses.map((g) => ({
          dateDiagnostic: g.dateDiagnostic || "",
          rangCpn: g.rangCpn || "",
          dateProbableAcc: g.dateProbableAcc || "",
          issue: g.issue || "",
          dateReelle: g.dateReelle || "",
          modeAcc: g.modeAcc || "",
          allaitement: g.allaitement || "",
          prophylaxie: g.prophylaxie || "",
          protocole: g.protocole || "",
          dateDebutProtocole: g.dateDebutProtocole || "",
          pcr1: g.pcr1 || "",
          datePrelPcr: g.datePrelPcr || "",
          resultatPcr: g.resultatPcr || "",
          serologie: g.serologie || "",
          datePrelSero: g.datePrelSero || "",
          resultatSero: g.resultatSero || "",
        })),

        // DÃ©pistage familial
        depistageFamiliales: depistageFamiliales.map((d) => ({
          nom: d.nom || "",
          type: d.type || "",
          age: d.age ? parseInt(d.age, 10) : "",
          sexe: d.sexe || "",
          statut: d.statut || "",
          resultat: d.resultat || "",
          soins: d.soins || "",
        })) || [],

        // Suivi immunovirologique
        suiviImmunovirologiques: suiviImmunovirologiques.map((s) => ({
          datePrelevement: s.datePrelevement || "",
          dateResultat: s.dateResultat || "",
          resultatCV: s.resultatCV ? parseFloat(s.resultatCV) : "",
          dateCD4: s.dateCD4 || "",
          resultatCD4: s.resultatCD4 ? parseInt(s.resultatCD4, 10) : "",
          cd4Categorie: s.cd4Categorie || "",
        })) || [],

        // Suivi pathologique
        suiviPathologiques: suiviPathologiques.map((f) => ({
          date: f.date || "",
          taille: f.taille ? parseFloat(f.taille) : "",
          poids: f.poids ? parseFloat(f.poids) : "",
          imc: f.imc ? parseFloat(f.imc) : "",
          ta: f.ta || "",
          temperature: f.temperature ? parseFloat(f.temperature) : "",
          pouls: f.pouls ? parseInt(f.pouls, 10) : "",
          rechercheTB: f.rechercheTB || "",
          resultatTB: f.resultatTB || "",
          tpt: f.tpt || "",
          autresPathologies: f.autresPathologies || "",
          cotrimoxazole: f.cotrimoxazole || "",
        })) || [],

        // Suivi ARV
        suiviARVs: suiviArvs.map((a) => ({
          dateVisite: a.dateVisite || "",
          situationArv: a.situationArv || "",
          changementLignePreciser: a.changementLignePreciser || "",
          protocole: a.protocole || "",
          substitutionMotif: a.substitutionMotif || "",
          substitutionPrecision: a.substitutionPrecision || "",
          stadeCliniqueOms: a.stadeCliniqueOms || "",
          observanceCorrecte: a.observanceCorrecte || "",
          evaluationNutritionnelle: a.evaluationNutritionnelle || "",
          classification: a.classification || "",
          modeleSoinsNumero: a.modeleSoinsNumero || "",
          prochainRdv: a.prochainRdv || "",
        })),

        // Prise en charge TB
        priseEnChargeTbs: tbFiches.map((tb) => ({
          date: tb.date || "",
          debut: tb.debut || "",
          fin: tb.fin || "",
          issu: tb.issu || "",
        })),

        // ✅ Index Tests
        indexTests: indexTests.map((idx) => ({
          nom: idx.nom || "",
          type: idx.type || "",
          resultat: idx.resultat || "",
          date: idx.date || "",
        })) || [],
      },
    ],
  };

  try {
    const token = localStorage.getItem("token");

    const response = await axios.post(
      `${process.env.REACT_APP_GATEWAY_URL || 'http://localhost:8081'}/api/dossiers`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("âœ… SuccÃ¨s :", response.data);

         // âœ… Reset du formulaire uniquement en cas de succÃ¨s
         resetForm();
         // â¬‡ï¸ Afficher directement la vue dossier
         setDossierCree(response.data);

       } catch (error) {
         console.error("âŒ Erreur :", error);

         if (error.response?.status === 403) {
           alert("âš ï¸ AccÃ¨s refusÃ© : token manquant ou invalide.");
         } else {
           alert("âŒ Une erreur est survenue lors de la soumission.");
         }
       }
     };

     // âœ… Si un dossier est crÃ©Ã©, on bascule sur la vue dossier
    if (dossierCree) {
      return <DossierView dossier={dossierCree} language={language} />;
    }


  // Render rÃ©sumÃ© simple (Ã©tape finale)
  const Review = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">VÃ©rification avant envoi</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <strong>PÃ¨re:</strong> {formData.pereNomPrenoms} â€” {formData.pereTelephone}
        </div>
        <div>
          <strong>MÃ¨re:</strong> {formData.mereNomPrenoms} â€” {formData.mereTelephone}
        </div>
        <div>
          <strong>Naissance Structure:</strong> {formData.naissanceStructure}
        </div>
        <div>
          <strong>Porte(s) d'entrÃ©e:</strong> {formData.portesEntree.join(", ")}
        </div>
        <div>
          <strong>Date test:</strong> {formData.dateTest || formData.dateConfirmation}
        </div>
        <div>
          <strong>RÃ©sultat VIH:</strong> {formData.resultat}
        </div>
        <div>
          <strong>Vaccins:</strong> {formData.vaccins.join(", ")}
        </div>
        <div>
          <strong>Enfant - Prophylaxie ARV :</strong> {formData.enfantProphylaxieArvNaissance}
        </div>
        <div>
          <strong>MÃ¨re - TrithÃ©rapie :</strong> {formData.mereTritherapieGrossesse}
        </div>
        <div>
          <strong>ARV Stade OMS initial:</strong> {formData.arvStadeOmsInitial}
        </div>
        <div>
          <strong>Stades OMS:</strong> {formData.stadeOmsInitial.join(", ")}
        </div>
      </div>
      <div className="mt-4">
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          âœ… Confirmer et soumettre
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Formulaire mÃ©dical (multi-Ã©tapes)</h1>
        <div className="text-sm text-gray-600">
          Ã‰tape {step} / {totalSteps}
        </div>
      </div>

      {/* Step 1: Parents */}
     {step === 1 && (
       <div>
         <h2 className="text-lg font-semibold mb-3">
           ðŸ‘¨â€ðŸ‘©â€ðŸ‘§ {getTranslation("infosParents", language)}
         </h2>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {/* PÃ¨re */}
           <div className="p-4 border rounded">
             <h3 className="font-medium mb-2">{getTranslation("pere", language)}</h3>

             <input
               placeholder={getTranslation("nomPrenoms", language)}
               value={formData.pereNomPrenoms}
               onChange={(e) => handleChange("pereNomPrenoms", e.target.value)}
               className="w-full p-2 border rounded mb-2"
             />

             <label className="block text-sm">{getTranslation("statut", language)}</label>
             <select
               value={formData.pereStatut}
               onChange={(e) => handleChange("pereStatut", e.target.value)}
               className="w-full p-2 border rounded mb-2"
             >
               <option value="">{getTranslation("vide", language)}</option>
               <option value="Vivant">{getTranslation("vivant", language)}</option>
               <option value="Ne sait pas">{getTranslation("neSaitPas", language)}</option>
               <option value="DÃ©cÃ©dÃ©">{getTranslation("decede", language)}</option>
             </select>

             <label className="block text-sm">
               {getTranslation("niveauInstruction", language)}
             </label>
             <select
               value={formData.pereNiveauInstruction}
               onChange={(e) => handleChange("pereNiveauInstruction", e.target.value)}
               className="w-full p-2 border rounded mb-2"
             >
               <option value="">{getTranslation("vide", language)}</option>
               <option>{getTranslation("nonScolarise", language)}</option>
               <option>{getTranslation("elementaire", language)}</option>
               <option>{getTranslation("secondaire", language)}</option>
               <option>{getTranslation("superieur", language)}</option>
             </select>

             <label className="block text-sm">{getTranslation("profession", language)}</label>
             <input
               placeholder={getTranslation("profession", language)}
               value={formData.pereProfession}
               onChange={(e) => handleChange("pereProfession", e.target.value)}
               className="w-full p-2 border rounded mb-2"
             />

             <label className="block text-sm">
               {getTranslation("statutVih", language)}
             </label>
             <select
               value={formData.pereStatutVih}
               onChange={(e) => handleChange("pereStatutVih", e.target.value)}
               className="w-full p-2 border rounded mb-2"
             >
               <option value="">{getTranslation("vide", language)}</option>
               <option>{getTranslation("oui", language)}</option>
               <option>{getTranslation("non", language)}</option>
               <option>{getTranslation("neSaitPas", language)}</option>
             </select>

             <input
               placeholder={getTranslation("telephone", language)}
               value={formData.pereTelephone}
               onChange={(e) => handleChange("pereTelephone", e.target.value)}
               className="w-full p-2 border rounded"
             />
           </div>

           {/* MÃ¨re */}
           <div className="p-4 border rounded">
             <h3 className="font-medium mb-2">{getTranslation("mere", language)}</h3>

             <input
               placeholder={getTranslation("nomPrenoms", language)}
               value={formData.mereNomPrenoms}
               onChange={(e) => handleChange("mereNomPrenoms", e.target.value)}
               className="w-full p-2 border rounded mb-2"
             />

             <label className="block text-sm">{getTranslation("statut", language)}</label>
             <select
               value={formData.mereStatut}
               onChange={(e) => handleChange("mereStatut", e.target.value)}
               className="w-full p-2 border rounded mb-2"
             >
               <option value="">{getTranslation("vide", language)}</option>
               <option value="Vivante">{getTranslation("vivante", language)}</option>
               <option value="Ne sait pas">{getTranslation("neSaitPas", language)}</option>
               <option value="DÃ©cÃ©dÃ©e">{getTranslation("decedee", language)}</option>
             </select>

             <label className="block text-sm">
               {getTranslation("niveauInstruction", language)}
             </label>
             <select
               value={formData.mereNiveauInstruction}
               onChange={(e) => handleChange("mereNiveauInstruction", e.target.value)}
               className="w-full p-2 border rounded mb-2"
             >
               <option value="">{getTranslation("vide", language)}</option>
               <option>{getTranslation("nonScolarisee", language)}</option>
               <option>{getTranslation("elementaire", language)}</option>
               <option>{getTranslation("secondaire", language)}</option>
               <option>{getTranslation("superieur", language)}</option>
             </select>

             <label className="block text-sm">{getTranslation("profession", language)}</label>
             <input
               placeholder={getTranslation("profession", language)}
               value={formData.mereProfession}
               onChange={(e) => handleChange("mereProfession", e.target.value)}
               className="w-full p-2 border rounded mb-2"
             />

             <label className="block text-sm">
               {getTranslation("statutVih", language)}
             </label>
             <select
               value={formData.mereStatutVih}
               onChange={(e) => handleChange("mereStatutVih", e.target.value)}
               className="w-full p-2 border rounded mb-2"
             >
               <option value="">{getTranslation("vide", language)}</option>
               <option>{getTranslation("oui", language)}</option>
               <option>{getTranslation("non", language)}</option>
               <option>{getTranslation("neSaitPas", language)}</option>
             </select>

             <input
               placeholder={getTranslation("telephone", language)}
               value={formData.mereTelephone}
               onChange={(e) => handleChange("mereTelephone", e.target.value)}
               className="w-full p-2 border rounded"
             />
           </div>
         </div>
       </div>
     )}


    {/* Step 2: Naissance + porte d'entrÃ©e + rÃ©fÃ©rence */}
    {step === 2 && (
      <div>
        <h2 className="text-lg font-semibold mb-3">
          ðŸ¥ {getTranslation("naissance_portes_entree", language)}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Bloc Naissance */}
          <div className="p-4 border rounded">
            <label className="block">
              {getTranslation("naissance_structure", language)}
            </label>

            <div className="flex gap-3 mb-3">
              {["Oui", "Non"].map((o) => (
                <label key={o} className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="naissanceStructure"
                    value={o}
                    checked={formData.naissanceStructure === o}
                    onChange={(e) => handleChange("naissanceStructure", e.target.value)}
                  />
                  {getTranslation(o.toLowerCase(), language)}
                </label>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                placeholder={getTranslation("poids_naissance", language)}
                value={formData.poidsNaissance}
                onChange={(e) => handleChange("poidsNaissance", e.target.value)}
                className="p-2 border rounded"
              />
              <input
                placeholder={getTranslation("taille_naissance", language)}
                value={formData.tailleNaissance}
                onChange={(e) => handleChange("tailleNaissance", e.target.value)}
                className="p-2 border rounded"
              />
              <input
                placeholder={getTranslation("perimetre_cranien", language)}
                value={formData.perimetreCranien}
                onChange={(e) => handleChange("perimetreCranien", e.target.value)}
                className="p-2 border rounded"
              />
              <input
                placeholder={getTranslation("score_apgar", language)}
                value={formData.apgar}
                onChange={(e) => handleChange("apgar", e.target.value)}
                className="p-2 border rounded"
              />
            </div>
          </div>

          {/* Bloc Portes d'entrÃ©e + RÃ©fÃ©rence */}
          <div className="p-4 border rounded">
            <h3 className="font-medium mb-2">
              {getTranslation("portes_entree", language)}
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {[
                "pec_p",
                "aes_sexe_x",
                "tb_t",
                "don_sang_d",
                "ptme_m",
                "index_famille_f",
                "ist_i",
                "index_partenaire_k",
                "cdv_c",
                "auto_oriente_a",
                "aes_sang_s",
              ].map((key) => (
                <label key={key} className="flex gap-2 items-center">
                  <input
                    type="checkbox"
                    checked={formData.portesEntree.includes(key)}
                    onChange={() => toggleArrayValue("portesEntree", key)}
                  />
                  {getTranslation(key, language)}
                </label>
              ))}
            </div>

            <div className="mt-4">
              <label className="block">
                {getTranslation("reference", language)}
              </label>

              <div className="flex gap-3 mb-2">
                {["Oui", "Non"].map((o) => (
                  <label key={o} className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="reference"
                      value={o}
                      checked={formData.reference === o}
                      onChange={(e) => handleChange("reference", e.target.value)}
                    />
                    {getTranslation(o.toLowerCase(), language)}
                  </label>
                ))}
              </div>

              <input
                type="date"
                value={formData.dateReference}
                onChange={(e) => handleChange("dateReference", e.target.value)}
                className="p-2 border rounded w-full mb-2"
              />
              <input
                placeholder={getTranslation("site_origine", language)}
                value={formData.siteOrigine}
                onChange={(e) => handleChange("siteOrigine", e.target.value)}
                className="p-2 border rounded w-full"
              />
            </div>
          </div>
        </div>
      </div>
    )}

     {/* Step 3: Test VIH / ETP */}
     {step === 3 && (
       <div>
         <h2 className="text-lg font-semibold mb-3">
           ðŸ§ª {getTranslation("test_vih_etp", language)}
         </h2>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {/* Bloc Test VIH */}
           <div className="p-4 border rounded">
             <label>{getTranslation("date_test_vih", language)}</label>
             <input
               type="date"
               value={formData.dateTest}
               onChange={(e) => handleChange("dateTest", e.target.value)}
               className="w-full p-2 border rounded mb-2"
             />

             <label>{getTranslation("date_confirmation", language)}</label>
             <input
               type="date"
               value={formData.dateConfirmation}
               onChange={(e) => handleChange("dateConfirmation", e.target.value)}
               className="w-full p-2 border rounded mb-2"
             />

             <label>{getTranslation("lieu_test", language)}</label>
             <div className="flex gap-3 mb-2">
               {["structure_sanitaire", "autre"].map((key) => (
                 <label key={key} className="flex items-center gap-1">
                   <input
                     type="radio"
                     name="lieuTest"
                     value={key}
                     checked={formData.lieuTest === key}
                     onChange={(e) => handleChange("lieuTest", e.target.value)}
                   />
                   {getTranslation(key, language)}
                 </label>
               ))}
             </div>

             <label>{getTranslation("resultat", language)}</label>
             <div className="flex gap-3 mb-2">
               {["vih1", "vih2", "vih12"].map((key) => (
                 <label key={key} className="flex items-center gap-1">
                   <input
                     type="radio"
                     name="resultat"
                     value={key}
                     checked={formData.resultat === key}
                     onChange={(e) => handleChange("resultat", e.target.value)}
                   />
                   {getTranslation(key, language)}
                 </label>
               ))}
             </div>
           </div>

           {/* Bloc ETP */}
           <div className="p-4 border rounded">
             <label>{getTranslation("debut_etp", language)}</label>
             <input
               type="date"
               value={formData.dateDebutETP}
               onChange={(e) => handleChange("dateDebutETP", e.target.value)}
               className="w-full p-2 border rounded mb-2"
             />

             <label>{getTranslation("age_etp", language)}</label>
             <input
               type="number"
               value={formData.ageETP}
               onChange={(e) => handleChange("ageETP", e.target.value)}
               className="w-full p-2 border rounded mb-2"
             />

             <label>{getTranslation("date_annonce_complete", language)}</label>
             <input
               type="date"
               value={formData.annonceComplete}
               onChange={(e) => handleChange("annonceComplete", e.target.value)}
               className="w-full p-2 border rounded mb-2"
             />

             <label>{getTranslation("age_annonce", language)}</label>
             <input
               type="number"
               value={formData.ageAnnonce}
               onChange={(e) => handleChange("ageAnnonce", e.target.value)}
               className="w-full p-2 border rounded"
             />
           </div>
         </div>
       </div>
     )}


     {/* Step 4: Statut Vaccinal */}
     {step === 4 && (
       <div>
         <h2 className="text-lg font-semibold mb-3">
           ðŸ’‰ {getTranslation("statut_vaccinal", language)}
         </h2>
         <div className="grid grid-cols-2 gap-2 mb-3">
           {[
             "hepb0_24h",
             "bcg",
             "penta1",
             "penta2",
             "penta3",
             "vpo0",
             "vpo1",
             "vpo2",
             "vpo3",
             "pcv1",
             "pcv2",
             "pcv3",
             "rr1",
             "rr2",
             "vaa",
             "hpv1",
             "hpv2",
             "rota1",
             "rota2",
             "vpi",
           ].map((key) => (
             <label key={key} className="flex gap-2 items-center">
               <input
                 type="checkbox"
                 checked={formData.vaccins.includes(key)}
                 onChange={() => toggleArrayValue("vaccins", key)}
               />
               {getTranslation(key, language)}
             </label>
           ))}
         </div>

         <textarea
           placeholder={getTranslation("autres_vaccins", language)}
           value={formData.autresVaccins}
           onChange={(e) => handleChange("autresVaccins", e.target.value)}
           className="w-full p-2 border rounded"
         />
       </div>
     )}

 {/* Step 5: Enfant exposÃ© */}
 {step === 5 && (
   <div>
     <h2 className="text-lg font-semibold mb-3">
       ðŸ‘¶ {getTranslation("enfant_expose", language)}
     </h2>

     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
       {/* Bloc prophylaxie */}
       <div className="p-4 border rounded">
         <label>{getTranslation("prophylaxie_arv_naissance", language)}</label>
         <div className="flex gap-3 mb-2">
           {["oui", "non", "ne_sait_pas"].map((key) => (
             <label key={key} className="flex items-center gap-1">
               <input
                 type="radio"
                 name="enfantProphylaxieArvNaissance"
                 value={key}
                 checked={formData.enfantProphylaxieArvNaissance === key}
                 onChange={(e) =>
                   handleChange("enfantProphylaxieArvNaissance", e.target.value)
                 }
               />
               {getTranslation(key, language)}
             </label>
           ))}
         </div>

         <label>{getTranslation("prophylaxie_cotrimoxazole", language)}</label>
         <div className="flex gap-3 mb-2">
           {["oui", "non", "ne_sait_pas"].map((key) => (
             <label key={key} className="flex items-center gap-1">
               <input
                 type="radio"
                 name="enfantProphylaxieCotrimoxazole"
                 value={key}
                 checked={formData.enfantProphylaxieCotrimoxazole === key}
                 onChange={(e) =>
                   handleChange("enfantProphylaxieCotrimoxazole", e.target.value)
                 }
               />
               {getTranslation(key, language)}
             </label>
           ))}
         </div>
       </div>

       {/* Bloc alimentation */}
       <div className="p-4 border rounded">
         <label>{getTranslation("alimentation_enfant", language)}</label>
         <div className="flex flex-col mb-2">
           {["ame_arv", "ame_sans_arv", "aa", "autre"].map((key) => (
             <label key={key} className="flex items-center gap-2">
               <input
                 type="checkbox"
                 checked={formData.enfantAlimentation.includes(key)}
                 onChange={() => toggleArrayValue("enfantAlimentation", key)}
               />
               {getTranslation(key, language)}
             </label>
           ))}
         </div>

         <input
           placeholder={getTranslation("age_sevrage", language)}
           type="number"
           value={formData.enfantSevrageAgeMois}
           onChange={(e) =>
             handleChange("enfantSevrageAgeMois", e.target.value)
           }
           className="p-2 border rounded mb-2"
         />

         <input
           placeholder={getTranslation("numero_seropositif", language)}
           value={formData.enfantNumeroSeropositif}
           onChange={(e) =>
             handleChange("enfantNumeroSeropositif", e.target.value)
           }
           className="p-2 border rounded"
         />
       </div>
     </div>
   </div>
 )}

   {/* Step 6: Infos mÃ¨re + Renseignement clinique */}
   {step === 6 && (
     <div>
       <h2 className="text-lg font-semibold mb-3">
         ðŸ¤° {getTranslation("infos_mere_renseignement_clinique", language)}
       </h2>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         {/* Bloc infos mÃ¨re */}
         <div className="p-4 border rounded">
           <label>{getTranslation("tritherapie_pendant_grossesse", language)}</label>
           <div className="flex gap-3 mb-2">
             {["oui", "non", "ne_sait_pas"].map((key) => (
               <label key={key} className="flex items-center gap-1">
                 <input
                   type="radio"
                   value={key}
                   checked={formData.mereTritherapieGrossesse === key}
                   onChange={(e) =>
                     handleChange("mereTritherapieGrossesse", e.target.value)
                   }
                 />
                 {getTranslation(key, language)}
               </label>
             ))}
           </div>

           <label>{getTranslation("date_debut_arv_mere", language)}</label>
           <input
             type="date"
             value={formData.dateDebutARV}
             onChange={(e) => handleChange("dateDebutARV", e.target.value)}
             className="w-full p-2 border rounded mb-2"
           />

           <input
             placeholder={getTranslation("protocole_initial_arv", language)}
             value={formData.protocoleInitialArv}
             onChange={(e) => handleChange("protocoleInitialArv", e.target.value)}
             className="w-full p-2 border rounded mb-2"
           />

           <input
             placeholder={getTranslation("protocole_actuel_arv", language)}
             value={formData.protocoleActuelArv}
             onChange={(e) => handleChange("protocoleActuelArv", e.target.value)}
             className="w-full p-2 border rounded"
           />
         </div>

         {/* Bloc renseignement clinique */}
         <div className="p-4 border rounded">
           <h3 className="font-medium mb-2">
             {getTranslation("renseignement_clinique", language)}
           </h3>

           <input
             placeholder={getTranslation("poids_kg", language)}
             value={formData.renseignementClinique.poidsKg}
             onChange={(e) =>
               handleNestedChange("renseignementClinique", "poidsKg", e.target.value)
             }
             className="w-full p-2 border rounded mb-2"
           />

           <label className="flex items-center gap-2 mb-2">
             <input
               type="checkbox"
               checked={formData.renseignementClinique.traitementARV}
               onChange={(e) =>
                 handleNestedChange("renseignementClinique", "traitementARV", e.target.checked)
               }
             />
             {getTranslation("traitement_arv_cours", language)}
           </label>

           <label className="flex items-center gap-2 mb-2">
             <input
               type="checkbox"
               checked={formData.renseignementClinique.traitementtb}
               onChange={(e) =>
                 handleNestedChange("renseignementClinique", "traitementtb", e.target.checked)
               }
             />
             {getTranslation("traitement_tb", language)}
           </label>

           <input
             placeholder={getTranslation("allergie", language)}
             value={formData.renseignementClinique.allergie}
             onChange={(e) =>
               handleNestedChange("renseignementClinique", "allergie", e.target.value)
             }
             className="w-full p-2 border rounded mb-2"
           />

           <input
             placeholder={getTranslation("aghbs", language)}
             value={formData.renseignementClinique.aghbs}
             onChange={(e) =>
               handleNestedChange("renseignementClinique", "aghbs", e.target.value)
             }
             className="w-full p-2 border rounded"
           />
         </div>
       </div>

       {/* Profils & stades */}
       <div className="mt-4 p-4 border rounded">
         <h4 className="font-medium mb-2">{getTranslation("profils", language)}</h4>
         <div className="flex gap-3">
          {Object.keys(formData.renseignementClinique.profils).map((k) => (
             <label key={k} className="flex items-center gap-2">
               <input
                 type="checkbox"
                 checked={formData.renseignementClinique.profils[k]}
                onChange={() => toggleNestedGroupBoolean("renseignementClinique", "profils", k)}
               />
               {getTranslation(k, language)}
             </label>
           ))}
         </div>

         <h4 className="font-medium mt-3 mb-2">{getTranslation("stades_oms", language)}</h4>
         <div className="flex gap-3">
          {Object.keys(formData.renseignementClinique.stades).map((k) => (
             <label key={k} className="flex items-center gap-2">
               <input
                 type="checkbox"
                 checked={formData.renseignementClinique.stades[k]}
                onChange={() => toggleNestedGroupBoolean("renseignementClinique", "stades", k)}
               />
               {getTranslation(k, language)}
             </label>
           ))}
         </div>

         <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
           <input
             placeholder={getTranslation("cd4_debut_traitement", language)}
             value={formData.renseignementClinique.cd4DebutTraitement}
             onChange={(e) =>
               handleNestedChange("renseignementClinique", "cd4DebutTraitement", e.target.value)
             }
             className="p-2 border rounded"
           />
           <input
             placeholder={getTranslation("cd4_dernier", language)}
             value={formData.renseignementClinique.cd4Dernier}
             onChange={(e) =>
               handleNestedChange("renseignementClinique", "cd4Dernier", e.target.value)
             }
             className="p-2 border rounded"
           />
           <input
             placeholder={getTranslation("charge_virale", language)}
             value={formData.renseignementClinique.chargeViraleNiveau}
             onChange={(e) =>
               handleNestedChange("renseignementClinique", "chargeViraleNiveau", e.target.value)
             }
             className="p-2 border rounded"
           />
         </div>
       </div>
     </div>
   )}

     {/* Step 7: RÃ©pondants lÃ©gaux */}
     {step === 7 && (
       <div>
         <h2 className="text-lg font-semibold mb-3">
           ðŸ‘¥ {getTranslation("repondants_legaux", language)}
         </h2>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {/* RÃ©pondant 1 */}
           <div className="p-4 border rounded">
             <h3 className="font-medium mb-2">
               {getTranslation("repondant1", language)}
             </h3>
             <input
               placeholder={getTranslation("nom_prenoms", language)}
               value={formData.repondant1Nom}
               onChange={(e) => handleChange("repondant1Nom", e.target.value)}
               className="w-full p-2 border rounded mb-2"
             />
             <input
               placeholder={getTranslation("lien_parente", language)}
               value={formData.repondant1Lien}
               onChange={(e) => handleChange("repondant1Lien", e.target.value)}
               className="w-full p-2 border rounded mb-2"
             />
             <input
               placeholder={getTranslation("niveau_instruction", language)}
               value={formData.repondant1Niveau}
               onChange={(e) => handleChange("repondant1Niveau", e.target.value)}
               className="w-full p-2 border rounded mb-2"
             />
             <input
               placeholder={getTranslation("profession", language)}
               value={formData.repondant1Profession}
               onChange={(e) => handleChange("repondant1Profession", e.target.value)}
               className="w-full p-2 border rounded mb-2"
             />
             <input
               placeholder={getTranslation("telephone", language)}
               value={formData.repondant1Tel}
               onChange={(e) => handleChange("repondant1Tel", e.target.value)}
               className="w-full p-2 border rounded"
             />
           </div>

           {/* RÃ©pondant 2 */}
           <div className="p-4 border rounded">
             <h3 className="font-medium mb-2">
               {getTranslation("repondant2", language)}
             </h3>
             <input
               placeholder={getTranslation("nom_prenoms", language)}
               value={formData.repondant2Nom}
               onChange={(e) => handleChange("repondant2Nom", e.target.value)}
               className="w-full p-2 border rounded mb-2"
             />
             <input
               placeholder={getTranslation("lien_parente", language)}
               value={formData.repondant2Lien}
               onChange={(e) => handleChange("repondant2Lien", e.target.value)}
               className="w-full p-2 border rounded mb-2"
             />
             <input
               placeholder={getTranslation("niveau_instruction", language)}
               value={formData.repondant2Niveau}
               onChange={(e) => handleChange("repondant2Niveau", e.target.value)}
               className="w-full p-2 border rounded mb-2"
             />
             <input
               placeholder={getTranslation("profession", language)}
               value={formData.repondant2Profession}
               onChange={(e) => handleChange("repondant2Profession", e.target.value)}
               className="w-full p-2 border rounded mb-2"
             />
             <input
               placeholder={getTranslation("telephone", language)}
               value={formData.repondant2Tel}
               onChange={(e) => handleChange("repondant2Tel", e.target.value)}
               className="w-full p-2 border rounded"
             />
           </div>
         </div>
       </div>
     )}

     {/* Step 8: AntÃ©cÃ©dents mÃ©dicaux & Stade OMS */}
     {step === 8 && (
       <div>
         <h2 className="text-lg font-semibold mb-3">
           ðŸ’Š {getTranslation("antecedents_stade_oms", language)}
         </h2>

         <div className="p-4 border rounded mb-4">
           <label>{getTranslation("arv_stade_oms_initial", language)}</label>
           <div className="flex gap-3 mb-2">
             {[getTranslation("oui", language), getTranslation("non", language)].map((o) => (
               <label key={o} className="flex items-center gap-1">
                 <input
                   type="radio"
                   name="arvStadeOmsInitial"
                   value={o}
                   checked={formData.arvStadeOmsInitial === o}
                   onChange={(e) => handleChange("arvStadeOmsInitial", e.target.value)}
                 />
                 {o}
               </label>
             ))}
           </div>

           <input
             placeholder={getTranslation("protocole", language)}
             value={formData.protocole}
             onChange={(e) => handleChange("protocole", e.target.value)}
             className="w-full p-2 border rounded mb-3"
           />

           <label className="block mb-2">
             {getTranslation("stade_oms_initial", language)}
           </label>
           <div className="flex gap-3 mb-3">
             {["1", "2", "3", "4"].map((n) => (
               <label key={n} className="flex items-center gap-1">
                 <input
                   type="checkbox"
                   checked={formData.stadeOmsInitial.includes(n)}
                   onChange={() => toggleArrayValue("stadeOmsInitial", n)}
                 />
                 {n}
               </label>
             ))}
           </div>

           <label className="block mb-2">{getTranslation("tuberculose", language)}</label>
           <div className="flex gap-3">
             {[getTranslation("oui", language), getTranslation("non", language), getTranslation("ne_sait_pas", language)].map((o) => (
               <label key={o} className="flex items-center gap-1">
                 <input
                   type="radio"
                   name="tuberculose"
                   value={o}
                   checked={formData.tuberculose === o}
                   onChange={(e) => handleChange("tuberculose", e.target.value)}
                 />
                 {o}
               </label>
             ))}
           </div>

           <textarea
             placeholder={getTranslation("autres_antecedents", language)}
             value={formData.autresAnt}
             onChange={(e) => handleChange("autresAnt", e.target.value)}
             className="w-full p-2 border rounded mt-3"
           />
         </div>
       </div>
     )}

     {/* Step 9: Index Testing */}
     {step === 9 && (
       <div>
         <h2 className="text-lg font-semibold mb-3">
           ðŸ“Œ {getTranslation("index_testing", language)}
         </h2>
         <div className="p-4 border rounded-lg">
           <table className="w-full border-collapse">
             <thead>
               <tr className="bg-gray-100">
                 <th className="border p-2">#</th>
                 <th className="border p-2">{getTranslation("nom", language)}</th>
                 <th className="border p-2">{getTranslation("type", language)}</th>
                 <th className="border p-2">{getTranslation("age", language)}</th>
                 <th className="border p-2">{getTranslation("sexe", language)}</th>
                 <th className="border p-2">{getTranslation("statut_vih", language)}</th>
                 <th className="border p-2">{getTranslation("resultat_test", language)}</th>
                 <th className="border p-2">{getTranslation("enrole_soins", language)}</th>
                 <th className="border p-2">{getTranslation("numero_id", language)}</th>
                 <th className="border p-2">{getTranslation("actions", language)}</th>
               </tr>
             </thead>
             <tbody>
               {formData.contacts.map((c, i) => (
                 <tr key={i}>
                   <td className="border p-2">{i + 1}</td>
                   <td className="border p-2">
                     <input
                       type="text"
                       value={c.nom}
                       onChange={(e) => mettreAJourContact(i, "nom", e.target.value)}
                       className="border p-1 w-full"
                     />
                   </td>
                   <td className="border p-2">
                     <select
                       value={c.type}
                       onChange={(e) => mettreAJourContact(i, "type", e.target.value)}
                       className="border p-1 w-full"
                     >
                       <option value="">{getTranslation("vide", language)}</option>
                       <option value="1">{getTranslation("conjoint_partenaire", language)}</option>
                       <option value="2">{getTranslation("enfant_moins_15", language)}</option>
                       <option value="3">{getTranslation("cdi", language)}</option>
                     </select>
                   </td>
                   <td className="border p-2">
                     <input
                       type="number"
                       value={c.age}
                       onChange={(e) => mettreAJourContact(i, "age", e.target.value)}
                       className="border p-1 w-full"
                     />
                   </td>
                   <td className="border p-2">
                     <select
                       value={c.sexe}
                       onChange={(e) => mettreAJourContact(i, "sexe", e.target.value)}
                       className="border p-1 w-full"
                     >
                       <option value="">{getTranslation("vide", language)}</option>
                       <option value="M">{getTranslation("masculin", language)}</option>
                       <option value="F">{getTranslation("feminin", language)}</option>
                     </select>
                   </td>
                   <td className="border p-2">
                     <select
                       value={c.statut}
                       onChange={(e) => mettreAJourContact(i, "statut", e.target.value)}
                       className="border p-1 w-full"
                     >
                       <option value="">{getTranslation("vide", language)}</option>
                       <option value="P">{getTranslation("positif", language)}</option>
                       <option value="N">{getTranslation("negatif", language)}</option>
                       <option value="Inconnu">{getTranslation("inconnu", language)}</option>
                     </select>
                   </td>
                   <td className="border p-2">
                     <select
                       value={c.resultat}
                       onChange={(e) => mettreAJourContact(i, "resultat", e.target.value)}
                       className="border p-1 w-full"
                     >
                       <option value="">{getTranslation("vide", language)}</option>
                       <option value="P">{getTranslation("positif", language)}</option>
                       <option value="N">{getTranslation("negatif", language)}</option>
                     </select>
                   </td>
                   <td className="border p-2">
                     <select
                       value={c.soins}
                       onChange={(e) => mettreAJourContact(i, "soins", e.target.value)}
                       className="border p-1 w-full"
                     >
                       <option value="">{getTranslation("vide", language)}</option>
                       <option value="O">{getTranslation("oui", language)}</option>
                       <option value="N">{getTranslation("non", language)}</option>
                       <option value="NA">{getTranslation("na", language)}</option>
                     </select>
                   </td>
                   <td className="border p-2">
                     <input
                       type="text"
                       value={c.id}
                       onChange={(e) => mettreAJourContact(i, "id", e.target.value)}
                       className="border p-1 w-full"
                     />
                   </td>
                   <td className="border p-2 text-center">
                     <button
                       onClick={() => supprimerContact(i)}
                       className="px-2 py-1 bg-red-500 text-white rounded"
                     >
                       {getTranslation("supprimer", language)}
                     </button>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>

           <button
             onClick={ajouterContact}
             className="mt-3 px-4 py-2 bg-blue-500 text-white rounded"
           >
             + {getTranslation("ajouter_contact", language)}
           </button>
         </div>
       </div>
     )}

   {step === 10 && (
     <div>
       <h2 className="text-lg font-semibold mb-3">
         ðŸ‘©â€ðŸ¼ {getTranslation("section_ptme", language)}
       </h2>
       <div className="p-4 border rounded-lg">
         <div className="overflow-x-auto">
           <table className="min-w-max border-collapse text-sm">
             <thead>
               <tr className="bg-gray-100">
                 <th className="border p-2">#</th>
                 <th className="border p-2">{getTranslation("date_diag_grossesse", language)}</th>
                 <th className="border p-2">{getTranslation("rang_cpn_date_probable", language)}</th>
                 <th className="border p-2">{getTranslation("issue_date_reelle", language)}</th>
                 <th className="border p-2">{getTranslation("mode_accouchement", language)}</th>
                 <th className="border p-2">{getTranslation("allaitement", language)}</th>
                 <th className="border p-2">{getTranslation("prophylaxie_nn", language)}</th>
                 <th className="border p-2">{getTranslation("pcr1", language)}</th>
                 <th className="border p-2">{getTranslation("serologie", language)}</th>
                 <th className="border p-2">{getTranslation("actions", language)}</th>
               </tr>
             </thead>
             <tbody>
               {grossesses.map((g, i) => (
                 <tr key={i}>
                   <td className="border p-2">{i + 1}</td>
                   <td className="border p-2">
                     <input
                       type="date"
                       value={g.dateDiagnostic}
                       onChange={(e) => majGrossesse(i, "dateDiagnostic", e.target.value)}
                       className="border p-1 w-full"
                     />
                   </td>
                   <td className="border p-2">
                     <input
                       type="number"
                       value={g.rangCpn}
                       onChange={(e) => majGrossesse(i, "rangCpn", e.target.value)}
                       className="border p-1 w-16 mb-1"
                     />
                     <input
                       type="date"
                       value={g.dateProbableAcc}
                       onChange={(e) => majGrossesse(i, "dateProbableAcc", e.target.value)}
                       className="border p-1 w-full"
                     />
                   </td>
                   <td className="border p-2">
                     <select
                       value={g.issue}
                       onChange={(e) => majGrossesse(i, "issue", e.target.value)}
                       className="border p-1 w-full mb-1"
                     >
                       <option value="">{getTranslation("vide", language)}</option>
                       <option value="1">{getTranslation("avortement", language)}</option>
                       <option value="2">{getTranslation("accouchement_vivant", language)}</option>
                       <option value="3">{getTranslation("accouchement_mort_ne", language)}</option>
                     </select>
                     <input
                       type="date"
                       value={g.dateReelle}
                       onChange={(e) => majGrossesse(i, "dateReelle", e.target.value)}
                       className="border p-1 w-full"
                     />
                   </td>
                   <td className="border p-2">
                     <select
                       value={g.modeAcc}
                       onChange={(e) => majGrossesse(i, "modeAcc", e.target.value)}
                       className="border p-1 w-full"
                     >
                       <option value="">{getTranslation("vide", language)}</option>
                       <option value="1">{getTranslation("voie_basse", language)}</option>
                       <option value="2">{getTranslation("cesarienne", language)}</option>
                     </select>
                   </td>
                   <td className="border p-2">
                     <select
                       value={g.allaitement}
                       onChange={(e) => majGrossesse(i, "allaitement", e.target.value)}
                       className="border p-1 w-full"
                     >
                       <option value="">{getTranslation("vide", language)}</option>
                       <option value="1">{getTranslation("ame_arv", language)}</option>
                       <option value="2">{getTranslation("ame_sans_arv", language)}</option>
                       <option value="3">{getTranslation("aa", language)}</option>
                       <option value="4">{getTranslation("autre", language)}</option>
                     </select>
                   </td>
                   <td className="border p-2">
                     <select
                       value={g.prophylaxie}
                       onChange={(e) => majGrossesse(i, "prophylaxie", e.target.value)}
                       className="border p-1 w-full mb-1"
                     >
                       <option value="">{getTranslation("vide", language)}</option>
                       <option value="0">{getTranslation("oui", language)}</option>
                       <option value="1">{getTranslation("non", language)}</option>
                     </select>
                     <input
                       type="text"
                       value={g.protocole}
                       onChange={(e) => majGrossesse(i, "protocole", e.target.value)}
                       className="border p-1 w-full mb-1"
                       placeholder={getTranslation("protocole", language)}
                     />
                     <input
                       type="date"
                       value={g.dateDebutProtocole}
                       onChange={(e) => majGrossesse(i, "dateDebutProtocole", e.target.value)}
                       className="border p-1 w-full"
                     />
                   </td>
                   <td className="border p-2">
                     <select
                       value={g.pcr1}
                       onChange={(e) => majGrossesse(i, "pcr1", e.target.value)}
                       className="border p-1 w-full mb-1"
                     >
                       <option value="">{getTranslation("vide", language)}</option>
                       <option value="0">{getTranslation("oui", language)}</option>
                       <option value="1">{getTranslation("non", language)}</option>
                     </select>
                     <input
                       type="date"
                       value={g.datePrelPcr}
                       onChange={(e) => majGrossesse(i, "datePrelPcr", e.target.value)}
                       className="border p-1 w-full mb-1"
                     />
                     <input
                       type="text"
                       value={g.resultatPcr}
                       onChange={(e) => majGrossesse(i, "resultatPcr", e.target.value)}
                       className="border p-1 w-full"
                       placeholder={getTranslation("resultat", language)}
                     />
                   </td>
                   <td className="border p-2">
                     <select
                       value={g.serologie}
                       onChange={(e) => majGrossesse(i, "serologie", e.target.value)}
                       className="border p-1 w-full mb-1"
                     >
                       <option value="">{getTranslation("vide", language)}</option>
                       <option value="0">{getTranslation("oui", language)}</option>
                       <option value="1">{getTranslation("non", language)}</option>
                     </select>
                     <input
                       type="date"
                       value={g.datePrelSero}
                       onChange={(e) => majGrossesse(i, "datePrelSero", e.target.value)}
                       className="border p-1 w-full mb-1"
                     />
                     <input
                       type="text"
                       value={g.resultatSero}
                       onChange={(e) => majGrossesse(i, "resultatSero", e.target.value)}
                       className="border p-1 w-full"
                       placeholder={getTranslation("resultat", language)}
                     />
                   </td>
                   <td className="border p-2 text-center">
                     <button
                       onClick={() => supprimerGrossesse(i)}
                       className="px-2 py-1 bg-red-500 text-white rounded"
                     >
                       {getTranslation("supprimer", language)}
                     </button>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
         <button
           onClick={ajouterGrossesse}
           className="mt-3 px-4 py-2 bg-blue-500 text-white rounded"
         >
           + {getTranslation("ajouter_grossesse", language)}
         </button>
       </div>
     </div>
   )}
{step === 11 && (
  <div>
    <h2 className="text-lg font-semibold mb-3">
      ðŸ§ª {getTranslation("section_bilans", language)}
    </h2>
    <div className="p-4 border rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-max border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">{getTranslation("date", language)}</th>
              <th className="border p-2">{getTranslation("hb", language)}</th>
              <th className="border p-2">{getTranslation("vgm", language)}</th>
              <th className="border p-2">{getTranslation("ccmh", language)}</th>
              <th className="border p-2">{getTranslation("gb", language)}</th>
              <th className="border p-2">{getTranslation("neutrophiles", language)}</th>
              <th className="border p-2">{getTranslation("lymphocytes", language)}</th>
              <th className="border p-2">{getTranslation("plaquettes", language)}</th>
              <th className="border p-2">{getTranslation("alat", language)}</th>
              <th className="border p-2">{getTranslation("asat", language)}</th>
              <th className="border p-2">{getTranslation("glycemie", language)}</th>
              <th className="border p-2">{getTranslation("creatinine", language)}</th>
              <th className="border p-2">{getTranslation("aghbs", language)}</th>
              <th className="border p-2">{getTranslation("tb_lam", language)}</th>
              <th className="border p-2">{getTranslation("ag_crypto", language)}</th>
              <th className="border p-2">{getTranslation("genexpert", language)}</th>
              <th className="border p-2">{getTranslation("proteinurie", language)}</th>
              <th className="border p-2">{getTranslation("chol_total", language)}</th>
              <th className="border p-2">{getTranslation("hdl", language)}</th>
              <th className="border p-2">{getTranslation("ldl", language)}</th>
              <th className="border p-2">{getTranslation("triglycerides", language)}</th>
              <th className="border p-2">{getTranslation("depistage_col", language)}</th>
              <th className="border p-2">{getTranslation("syphilis", language)}</th>
              <th className="border p-2">{getTranslation("actions", language)}</th>
            </tr>
          </thead>
          <tbody>
            {formData.bilans.map((b, i) => (
              <tr key={i}>
                <td className="border p-2">
                  <input
                    type="date"
                    value={b.date}
                    onChange={(e) => mettreAJourBilan(i, "date", e.target.value)}
                    className="w-full border rounded p-1"
                  />
                </td>
                {[
                  "hb", "vgm", "ccmh", "gb", "neutrophiles",
                  "lymphocytes", "plaquettes", "alat", "asat",
                  "glycemie", "creatinine", "aghbs", "tb_lam",
                  "ag_crypto", "genexpert", "proteinurie",
                  "chol_total", "hdl", "ldl", "triglycerides",
                  "depistage_col", "syphilis"
                ].map((field) => (
                  <td key={field} className="border p-2">
                    <input
                      type="text"
                      value={b[field]}
                      onChange={(e) => mettreAJourBilan(i, field, e.target.value)}
                      className="w-full border rounded p-1"
                      placeholder={getTranslation(field, language)}
                    />
                  </td>
                ))}
                <td className="border p-2 text-center">
                  <button
                    onClick={() => supprimerBilan(i)}
                    className="px-2 py-1 bg-red-500 text-white rounded"
                  >
                    {getTranslation("supprimer", language)}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={ajouterBilan}
        className="mt-3 px-4 py-2 bg-blue-500 text-white rounded"
      >
        + {getTranslation("ajouter_bilan", language)}
      </button>
    </div>
  </div>
)}
{step === 12 && (
  <div>
    <h2 className="text-lg font-semibold mb-3">
      ðŸ« {getTranslation("section_tb", language)}
    </h2>
    <div className="p-4 border rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-max border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">{getTranslation("date", language)}</th>
              <th className="border p-2">{getTranslation("date_debut_traitement", language)}</th>
              <th className="border p-2">{getTranslation("date_fin_traitement", language)}</th>
              <th className="border p-2">{getTranslation("issu_traitement", language)}</th>
              <th className="border p-2">{getTranslation("actions", language)}</th>
            </tr>
          </thead>
          <tbody>
            {formData.tbFiches.map((f, i) => (
              <tr key={i}>
                <td className="border p-2">
                  <input
                    type="date"
                    value={f.date}
                    onChange={(e) => modifierTbFiche(i, "date", e.target.value)}
                    className="w-full border rounded p-1"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="date"
                    value={f.debut}
                    onChange={(e) => modifierTbFiche(i, "debut", e.target.value)}
                    className="w-full border rounded p-1"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="date"
                    value={f.fin}
                    onChange={(e) => modifierTbFiche(i, "fin", e.target.value)}
                    className="w-full border rounded p-1"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="text"
                    value={f.issu}
                    onChange={(e) => modifierTbFiche(i, "issu", e.target.value)}
                    className="w-full border rounded p-1"
                    placeholder={getTranslation("issu_traitement", language)}
                  />
                </td>
                <td className="border p-2 text-center">
                  <button
                    onClick={() => supprimerTbFiche(i)}
                    className="px-2 py-1 bg-red-500 text-white rounded"
                  >
                    {getTranslation("supprimer", language)}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={ajouterTbFiche}
        className="mt-3 px-4 py-2 bg-blue-500 text-white rounded"
      >
        + {getTranslation("ajouter_fiche", language)}
      </button>
    </div>
  </div>
)}
{step === 13 && (
  <div>
    <h2 className="text-lg font-semibold mb-3">
      ðŸ§¬ {getTranslation("section_immuno", language)}
    </h2>
    <div className="p-4 border rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-max border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">{getTranslation("date_prelevement", language)}</th>
              <th className="border p-2">{getTranslation("date_resultat", language)}</th>
              <th className="border p-2">{getTranslation("charge_virale", language)}</th>
              <th className="border p-2">{getTranslation("date_cd4", language)}</th>
              <th className="border p-2">{getTranslation("resultat_cd4", language)}</th>
              <th className="border p-2">{getTranslation("actions", language)}</th>
            </tr>
          </thead>
          <tbody>
            {formData.suivis.map((s, i) => (
              <tr key={i}>
                <td className="border p-2">
                  <input
                    type="date"
                    value={s.datePrelevement}
                    onChange={(e) => modifierSuiviImmuno(i, "datePrelevement", e.target.value)}
                    className="w-full border rounded p-1"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="date"
                    value={s.dateResultat}
                    onChange={(e) => modifierSuiviImmuno(i, "dateResultat", e.target.value)}
                    className="w-full border rounded p-1"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="number"
                    value={s.resultatCV}
                    onChange={(e) => modifierSuiviImmuno(i, "resultatCV", e.target.value)}
                    className="w-full border rounded p-1"
                    placeholder={getTranslation("charge_virale", language)}
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="date"
                    value={s.dateCD4}
                    onChange={(e) => modifierSuiviImmuno(i, "dateCD4", e.target.value)}
                    className="w-full border rounded p-1"
                  />
                </td>
                <td className="border p-2">
                  <select
                    value={s.cd4Categorie}
                    onChange={(e) => modifierSuiviImmuno(i, "cd4Categorie", e.target.value)}
                    className="w-full border rounded p-1"
                  >
                    <option value="">{getTranslation("choisir", language)}</option>
                    <option value=">=200">{getTranslation("cd4_sup200", language)}</option>
                    <option value="<200">{getTranslation("cd4_inf200", language)}</option>
                  </select>
                </td>
                <td className="border p-2 text-center">
                  <button
                    onClick={() => supprimerSuiviImmuno(i)}
                    className="px-2 py-1 bg-red-500 text-white rounded"
                  >
                    {getTranslation("supprimer", language)}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={ajouterSuiviImmuno}
        className="mt-3 px-4 py-2 bg-blue-500 text-white rounded"
      >
        + {getTranslation("ajouter_suivi", language)}
      </button>
    </div>
  </div>
)}
{step === 14 && (
  <div>
    <h2 className="text-lg font-semibold mb-3">
      ðŸ“‹ {getTranslation("section_fiche_suivi", language)}
    </h2>
    <div className="p-4 border rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-max border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">{getTranslation("date", language)}</th>
              <th className="border p-2">{getTranslation("taille", language)}</th>
              <th className="border p-2">{getTranslation("poids_imc", language)}</th>
              <th className="border p-2">{getTranslation("temperature", language)}</th>
              <th className="border p-2">{getTranslation("ta_pouls", language)}</th>
              <th className="border p-2">{getTranslation("tb", language)}</th>
              <th className="border p-2">{getTranslation("tpt", language)}</th>
              <th className="border p-2">{getTranslation("autres_pathologies", language)}</th>
              <th className="border p-2">{getTranslation("cotrimoxazole", language)}</th>
              <th className="border p-2">{getTranslation("actions", language)}</th>
            </tr>
          </thead>
          <tbody>
            {formData.fiches.map((f, i) => (
              <tr key={i}>
                <td className="border p-2">
                  <input
                    type="date"
                    value={f.date}
                    onChange={(e) => modifierFiche(i, "date", e.target.value)}
                    className="w-full border rounded p-1"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="number"
                    value={f.taille}
                    onChange={(e) => modifierFiche(i, "taille", e.target.value)}
                    className="w-full border rounded p-1"
                    placeholder={getTranslation("cm", language)}
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="number"
                    value={f.poids}
                    onChange={(e) => modifierFiche(i, "poids", e.target.value)}
                    className="w-full border rounded p-1"
                    placeholder={getTranslation("kg", language)}
                  />
                  <input
                    type="text"
                    value={f.imc}
                    onChange={(e) => modifierFiche(i, "imc", e.target.value)}
                    className="w-full border rounded p-1"
                    placeholder={getTranslation("imc", language)}
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="number"
                    value={f.temperature}
                    onChange={(e) => modifierFiche(i, "temperature", e.target.value)}
                    className="w-full border rounded p-1"
                    placeholder="Â°C"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="text"
                    value={f.ta}
                    onChange={(e) => modifierFiche(i, "ta", e.target.value)}
                    className="w-full border rounded p-1"
                    placeholder={getTranslation("ta", language)}
                  />
                  <input
                    type="number"
                    value={f.pouls}
                    onChange={(e) => modifierFiche(i, "pouls", e.target.value)}
                    className="w-full border rounded p-1"
                    placeholder={getTranslation("pouls", language)}
                  />
                </td>

                <td className="border p-2">
                  <select
                    value={f.rechercheTB}
                    onChange={(e) => modifierFiche(i, "rechercheTB", e.target.value)}
                    className="w-full border rounded p-1"
                  >
                    <option value="">{getTranslation("choisir", language)}</option>
                    <option value="0">{getTranslation("oui", language)}</option>
                    <option value="1">{getTranslation("non", language)}</option>
                  </select>

                  <select
                    value={f.resultatTB}
                    onChange={(e) => modifierFiche(i, "resultatTB", e.target.value)}
                    className="w-full border rounded p-1"
                  >
                    <option value="">{getTranslation("choisir", language)}</option>
                    <option value="0">{getTranslation("tb_non", language)}</option>
                    <option value="1">{getTranslation("tb_suspect", language)}</option>
                    <option value="2">{getTranslation("tb_confirme", language)}</option>
                  </select>
                </td>

                <td className="border p-2">
                  <select
                    value={f.tpt}
                    onChange={(e) => modifierFiche(i, "tpt", e.target.value)}
                    className="w-full border rounded p-1"
                  >
                    <option value="">{getTranslation("choisir", language)}</option>
                    <option value="0">{getTranslation("non", language)}</option>
                    <option value="1">{getTranslation("tpt_debut", language)}</option>
                    <option value="2">{getTranslation("tpt_encours", language)}</option>
                    <option value="3">{getTranslation("tpt_fin", language)}</option>
                  </select>
                </td>

                <td className="border p-2">
                  <input
                    type="text"
                    value={f.autresPathologies}
                    onChange={(e) => modifierFiche(i, "autresPathologies", e.target.value)}
                    className="w-full border rounded p-1"
                    placeholder={getTranslation("autres_pathologies", language)}
                  />
                  <input
                    type="date"
                    value={f.dateAutrePatholo}
                    onChange={(e) => modifierFiche(i, "dateAutrePatholo", e.target.value)}
                    className="w-full border rounded p-1"
                  />
                </td>

                <td className="border p-2">
                  <select
                    value={f.cotrimoxazole}
                    onChange={(e) => modifierFiche(i, "cotrimoxazole", e.target.value)}
                    className="w-full border rounded p-1"
                  >
                    <option value="">{getTranslation("choisir", language)}</option>
                    <option value="0">{getTranslation("oui", language)}</option>
                    <option value="1">{getTranslation("non", language)}</option>
                  </select>
                </td>

                <td className="border p-2 text-center">
                  <button
                    onClick={() => supprimerFiche(i)}
                    className="px-2 py-1 bg-red-500 text-white rounded"
                  >
                    {getTranslation("supprimer", language)}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={ajouterFiche}
        className="mt-3 px-4 py-2 bg-blue-500 text-white rounded"
      >
        + {getTranslation("ajouter_fiche", language)}
      </button>
    </div>
  </div>
)}

{/* Step 15 : Section XIV - Suivi thÃ©rapeutique ARV */}
{step === 15 && (
  <div>
    <h2 className="text-lg font-semibold mb-3">
      ðŸ’Š {getTranslation("sectionXIV", language)} : {getTranslation("suiviTherapeutiqueArv", language)}
    </h2>
    <div className="p-4 border rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-max border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">{getTranslation("dateVisite", language)}</th>
              <th className="border p-2">
                {getTranslation("situationArv", language)}<br />0=Pas / 1=Sous / 2=Chgt ligne / 3=Substitution
              </th>
              <th className="border p-2">
                {getTranslation("changementLignePreciser", language)}<br />1=Ligne2 / 2=Ligne3
              </th>
              <th className="border p-2">{getTranslation("protocole", language)}</th>
              <th className="border p-2">
                {getTranslation("substitutionMotif", language)}<br />1=ToxicitÃ© 2=Rupture 3=Autres
              </th>
              <th className="border p-2">{getTranslation("substitutionPrecision", language)}</th>
              <th className="border p-2">{getTranslation("stadeCliniqueOms", language)}</th>
              <th className="border p-2">
                {getTranslation("observanceCorrecte", language)}<br />0=Oui 1=Non
              </th>
              <th className="border p-2">
                {getTranslation("evaluationNutritionnelle", language)}<br />1=Maigreur 2=Bon 3=Surpoids 4=ObÃ©sitÃ©
              </th>
              <th className="border p-2">
                {getTranslation("classification", language)}<br />1=Bien portant 2=MVA 3=Stable 4=Non stable
              </th>
              <th className="border p-2">{getTranslation("modeleSoinsNumero", language)}</th>
              <th className="border p-2">{getTranslation("prochainRdv", language)}</th>
              <th className="border p-2">{getTranslation("actions", language)}</th>
            </tr>
          </thead>

          <tbody>
            {suiviArvs.map((row, i) => (
              <tr key={i}>
                <td className="border p-2">
                  <input
                    type="date"
                    value={row.dateVisite}
                    onChange={(e) => modifierSuiviArv(i, "dateVisite", e.target.value)}
                    className="w-full border rounded p-1"
                  />
                </td>

                <td className="border p-2">
                  <select
                    value={row.situationArv}
                    onChange={(e) => modifierSuiviArv(i, "situationArv", e.target.value)}
                    className="w-full border rounded p-1"
                  >
                    <option value="">--</option>
                    <option value="0">0 = {getTranslation("pasSousArv", language)}</option>
                    <option value="1">1 = {getTranslation("sousArv", language)}</option>
                    <option value="2">2 = {getTranslation("changementLigne", language)}</option>
                    <option value="3">3 = {getTranslation("substitutionMolecule", language)}</option>
                  </select>
                </td>

                <td className="border p-2">
                  <select
                    value={row.changementLignePreciser}
                    onChange={(e) => modifierSuiviArv(i, "changementLignePreciser", e.target.value)}
                    className="w-full border rounded p-1"
                    disabled={row.situationArv !== "2"}
                  >
                    <option value="">--</option>
                    <option value="1">1 = {getTranslation("ligne2", language)}</option>
                    <option value="2">2 = {getTranslation("ligne3", language)}</option>
                  </select>
                </td>

                <td className="border p-2">
                  <input
                    type="text"
                    value={row.protocole}
                    onChange={(e) => modifierSuiviArv(i, "protocole", e.target.value)}
                    className="w-full border rounded p-1"
                  />
                </td>

                <td className="border p-2">
                  <select
                    value={row.substitutionMotif}
                    onChange={(e) => modifierSuiviArv(i, "substitutionMotif", e.target.value)}
                    className="w-full border rounded p-1"
                    disabled={row.situationArv !== "3"}
                  >
                    <option value="">--</option>
                    <option value="1">1 = {getTranslation("toxicite", language)}</option>
                    <option value="2">2 = {getTranslation("ruptureStock", language)}</option>
                    <option value="3">3 = {getTranslation("autres", language)}</option>
                  </select>
                </td>

                <td className="border p-2">
                  <input
                    type="text"
                    value={row.substitutionPrecision}
                    onChange={(e) => modifierSuiviArv(i, "substitutionPrecision", e.target.value)}
                    className="w-full border rounded p-1"
                    placeholder={getTranslation("preciserSiMotif3", language)}
                    disabled={row.situationArv !== "3" || row.substitutionMotif !== "3"}
                  />
                </td>

                <td className="border p-2">
                  <select
                    value={row.stadeCliniqueOms}
                    onChange={(e) => modifierSuiviArv(i, "stadeCliniqueOms", e.target.value)}
                    className="w-full border rounded p-1"
                  >
                    <option value="">--</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                  </select>
                </td>

                <td className="border p-2">
                  <select
                    value={row.observanceCorrecte}
                    onChange={(e) => modifierSuiviArv(i, "observanceCorrecte", e.target.value)}
                    className="w-full border rounded p-1"
                  >
                    <option value="">--</option>
                    <option value="0">0 = {getTranslation("oui", language)}</option>
                    <option value="1">1 = {getTranslation("non", language)}</option>
                  </select>
                </td>

                <td className="border p-2">
                  <select
                    value={row.evaluationNutritionnelle}
                    onChange={(e) => modifierSuiviArv(i, "evaluationNutritionnelle", e.target.value)}
                    className="w-full border rounded p-1"
                  >
                    <option value="">--</option>
                    <option value="1">1 = {getTranslation("maigreur", language)}</option>
                    <option value="2">2 = {getTranslation("bonEtat", language)}</option>
                    <option value="3">3 = {getTranslation("surpoids", language)}</option>
                    <option value="4">4 = {getTranslation("obesite", language)}</option>
                  </select>
                </td>

                <td className="border p-2">
                  <select
                    value={row.classification}
                    onChange={(e) => modifierSuiviArv(i, "classification", e.target.value)}
                    className="w-full border rounded p-1"
                  >
                    <option value="">--</option>
                    <option value="1">1 = {getTranslation("bienPortant", language)}</option>
                    <option value="2">2 = {getTranslation("mva", language)}</option>
                    <option value="3">3 = {getTranslation("stable", language)}</option>
                    <option value="4">4 = {getTranslation("nonStable", language)}</option>
                  </select>
                </td>

                <td className="border p-2">
                  <input
                    type="text"
                    value={row.modeleSoinsNumero}
                    onChange={(e) => modifierSuiviArv(i, "modeleSoinsNumero", e.target.value)}
                    className="w-full border rounded p-1"
                    placeholder={getTranslation("numeroModele", language)}
                  />
                </td>

                <td className="border p-2">
                  <input
                    type="date"
                    value={row.prochainRdv}
                    onChange={(e) => modifierSuiviArv(i, "prochainRdv", e.target.value)}
                    className="w-full border rounded p-1"
                  />
                </td>

                <td className="border p-2 text-center">
                  <button
                    onClick={() => supprimerSuiviArv(i)}
                    className="px-2 py-1 bg-red-500 text-white rounded"
                  >
                    {getTranslation("supprimer", language)}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={ajouterSuiviArv}
        className="mt-3 px-4 py-2 bg-blue-500 text-white rounded"
      >
        + {getTranslation("ajouterLigne", language)}
      </button>
    </div>
  </div>
)}







      {/* Step 9: Review & Submit */}
      {step === 16 && (
        <div>
          <Review />
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={prevStep}
          disabled={step === 1}
          className={`px-4 py-2 rounded ${step === 1 ? "bg-gray-200" : "bg-gray-300"}`}
        >
          â¬… PrÃ©cÃ©dent
        </button>

        {step < totalSteps ? (
          <button
            onClick={nextStep}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Suivant âž¡
          </button>
        ) : (
          <button
            onClick={() => setStep(totalSteps)}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Relecture
          </button>
        )}
      </div>
    </div>
  );
}







