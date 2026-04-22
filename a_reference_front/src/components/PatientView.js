import React, { useState } from "react";
import { Edit3, Trash2, FileText } from "lucide-react";
import { updatePatient, deletePatient, checkPatientHasDossier, getDossiersByPatient } from "../services/patientService";
import FormulaireMultiEtapes from "./FormulaireMultiEtapes";
import { getTranslation } from '../utils/translations';

import FormulaireCompletFusionne from "./FormulaireCompletFusionne";
import DossierViewRouter from "./DossierViewRouter"; // ⚡ routeur vers les vues spécifiques

const PatientView = ({ patient, onUpdate,language,onBack   }) => {
  const [editing, setEditing] = useState(false);
  const [viewingDossier, setViewingDossier] = useState(false);
  const [hasDossier, setHasDossier] = useState(null);
  const [checkingDossier, setCheckingDossier] = useState(false);
  const [dossierError, setDossierError] = useState(null);

  const patientHasDossierInfo =
    patient?.codeDossier ||
    patient?.dossier_code_dossier ||
    patient?.dossier?.codeDossier ||
    patient?.dossierCode ||
    patient?.patient_dossier_code;

  const handleEditClick = () => setEditing(true);

  const handleCheckDossier = async () => {
    if (!patient?.codePatient) return false;
    setCheckingDossier(true);
    setDossierError(null);
    try {
      const dossierExists = await checkPatientHasDossier(patient.codePatient);
      setHasDossier(dossierExists);
      return dossierExists;
    } catch (error) {
      console.warn("⚠️ PatientView: checkPatientHasDossier a échoué:", error);
      if (error.response?.status === 403) {
        setDossierError("Accès refusé : vous n'avez pas la permission de voir ce dossier.");
      } else {
        setDossierError("Impossible de vérifier le dossier médical pour ce patient.");
      }
      setHasDossier(false);
      return false;
    } finally {
      setCheckingDossier(false);
    }
  };

  const handleViewDossier = async () => {
    let dossierExists = hasDossier;
    if (dossierExists === null) {
      dossierExists = await handleCheckDossier();
    }
    if (!dossierExists) {
      alert(dossierError || "Aucun dossier trouvé pour ce patient ou vous n'y avez pas accès.");
      return;
    }
    setViewingDossier(true);
  };

const handleUpdate = async (updatedData) => {
  try {
    // Incluez le codePatient dans les données mises à jour
    const dataToUpdate = { ...updatedData, codePatient: patient.codePatient };

    await updatePatient(patient.codePatient, dataToUpdate);
    alert("✅ Patient modifié avec succès");
    setEditing(false);
    if (onUpdate) await onUpdate();
  } catch (err) {
    console.error(err);
    alert("❌ Erreur lors de la mise à jour");
  }
};

  const handleDelete = async () => {
    if (!window.confirm("⚠️ Voulez-vous vraiment supprimer ce patient ?"))
      return;
    try {
      await deletePatient(patient.codePatient);
      alert("🗑️ Patient supprimé avec succès");
      if (onUpdate) await onUpdate();
    } catch (err) {
      console.error(err);
      alert("❌ Erreur lors de la suppression");
    }
  };

  // Fonction pour calculer l'âge
  const calculateAge = (dateNaissance) => {
    if (!dateNaissance) return null;
    const birth = new Date(dateNaissance);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  const age = calculateAge(patient?.dateNaissance);

  // 🔹 Mode édition
 // Dans PatientView
 if (editing) {
   return age >= 15 ? (
     <FormulaireMultiEtapes
       initialData={patient}
       onComplete={handleUpdate}
       language={language}
       codePatient={patient.codePatient} // Passez explicitement
     />
   ) : (
     <FormulaireCompletFusionne
       initialData={patient}
       onComplete={handleUpdate}
       language={language}
       codePatient={patient.codePatient} // Passez explicitement
     />
   );
 }

  // 🔹 Mode visualisation dossier
  if (viewingDossier) {
    return <DossierViewRouter patient={patient}
    language={language}
    onBack={() => setViewingDossier(false)} />;
  }

  // 🔹 Vue patient classique
  if (!patient) return <div>Aucun patient sélectionné</div>;

 return (
   <div
     className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6 flex flex-col"
     style={{ height: "90vh" }}
   >
     <div
       className="overflow-y-auto pr-2"
       style={{ maxHeight: "calc(90vh - 120px)" }}
     >
       <h3 className="text-xl font-bold mb-3 text-gray-700">
         👤 {getTranslation("patient", language)}
       </h3>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
         <div>
           <strong>{getTranslation("nom", language)}:</strong>{" "}
           {patient.nomUtilisateur || "-"}
         </div>
         <div>
           <strong>{getTranslation("prenom", language)}:</strong>{" "}
           {patient.prenomUtilisateur || "-"}
         </div>
         <div>
           <strong>{getTranslation("dateNaissance", language)}:</strong>{" "}
           {patient.dateNaissance?.split("T")[0] || "-"}
         </div>
         <div>
           <strong>{getTranslation("age", language)}:</strong>{" "}
           {age !== null ? `${age} ${getTranslation("ans", language)}` : "-"}
         </div>
         <div>
           <strong>{getTranslation("sexe", language)}:</strong>{" "}
           {patient.sexe || "-"}
         </div>
         <div>
           <strong>{getTranslation("profession", language)}:</strong>{" "}
           {patient.profession || "-"}
         </div>
         <div>
           <strong>{getTranslation("telephone", language)}:</strong>{" "}
           {patient.telephone || "-"}
         </div>
         <div>
           <strong>{getTranslation("nationalite", language)}:</strong>{" "}
           {patient.nationaliteUtilisateur || "-"}
         </div>
       </div>
     </div>

    {/* Actions */}
    <div className="pt-6 flex justify-end space-x-4 border-t">
      {patientHasDossierInfo || hasDossier === true ? (
        <>
          <button
            onClick={handleViewDossier}
            disabled={checkingDossier}
            className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center hover:bg-green-700 disabled:opacity-50"
          >
            <FileText className="h-5 w-5 mr-2" /> {checkingDossier ? "Vérification..." : getTranslation("voirDossier", language)}
          </button>
          <button
            onClick={handleEditClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center hover:bg-blue-700"
          >
            <Edit3 className="h-5 w-5 mr-2" /> {getTranslation("mettreAJourDossier", language) || "Mettre à jour le dossier"}
          </button>
        </>
      ) : hasDossier === null ? (
        <button
          onClick={handleCheckDossier}
          disabled={checkingDossier}
          className="px-4 py-2 bg-yellow-500 text-white rounded-lg flex items-center hover:bg-yellow-600 disabled:opacity-50"
        >
          {checkingDossier ? "Vérification..." : getTranslation("verifierDossier", language) || "Vérifier dossier"}
        </button>
      ) : (
        <button
          onClick={handleEditClick}
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 transition"
        >
          {getTranslation("creerDossierPatient", language) || "Créer un dossier patient"}
        </button>
      )}
    </div>
      <div className="pt-6 flex justify-begin space-x-4 border-t">
                                <button
                                         onClick={onBack}
                                         className="px-4 py-2 bg-yellow-500 text-white rounded-lg flex items-center hover:bg-gray-600"
                                       >
                                         ← {getTranslation("retour", language) || "Retour"}
                                       </button>
                  </div>
   </div>
 );

};

export default PatientView;
