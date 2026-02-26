// src/components/ReferenceView.jsx
import ReferenceWizard from './ReferenceWizard';
import { useState } from 'react';
import { CheckCircle, Reply, Trash2, Edit3 } from 'lucide-react';
import { validateReference, feedbackReference, deleteReference, updateReference } from '../services/referenceService';
import { getTranslation } from '../utils/translations';
const ReferenceView = ({ reference, type, onUpdate,language }) => {
  const [editing, setEditing] = useState(false);

  const handleEditClick = () => {
    setEditing(true);
  };

  const handleUpdate = async (updatedData) => {
    try {
      await updateReference(reference.id, updatedData);
      alert("✅ Référence modifiée avec succès");
      setEditing(false);
      if (onUpdate) await onUpdate();
    } catch (err) {
      console.error(err);
      alert("❌ Erreur lors de la mise à jour");
    }
  };

  const handleValidation = async () => {
    try {
      await validateReference(reference.id);
      alert("✅ Référence validée avec succès");
      if (onUpdate) await onUpdate();
    } catch (err) {
      console.error(err);
      alert("❌ Erreur lors de la validation");
    }
  };

  const handleFeedback = async () => {
    try {
      await feedbackReference(reference.id);
      alert("✅ Contre-référence effectuée");
      if (onUpdate) await onUpdate();
    } catch (err) {
      console.error(err);
      alert("❌ Erreur lors du feedback");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("⚠️ Voulez-vous vraiment supprimer cette référence ?")) return;
    try {
      await deleteReference(reference.id);
      alert("🗑️ Référence supprimée avec succès");
      if (onUpdate) await onUpdate();
    } catch (err) {
      console.error(err);
      alert("❌ Erreur lors de la suppression");
    }
  };

  // --- ordre des conditions ---
  if (editing) {
    return (
      <ReferenceWizard
        initialData={reference}
        onComplete={handleUpdate}
      />
    );
  }

  if (!reference) return <div>Aucune référence sélectionnée</div>;

  const doctorDest = reference.medecin;
  const doctorAuteur = reference.medecinAuteur;
  const patient = reference.patient;
  const motif = reference.motif;

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6 flex flex-col" style={{ height: '90vh' }}>
      <div className="overflow-y-auto pr-2" style={{ maxHeight: 'calc(90vh - 120px)' }}>
        {/* Patient */}
        <div>
          <h3 className="text-xl font-bold mb-3 text-gray-700">👤 {getTranslation("patient", language)}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><strong>{getTranslation("nom", language)}:</strong> {patient?.nomUtilisateur || "-"}</div>
            <div><strong>{getTranslation("prenom", language)}:</strong> {patient?.prenomUtilisateur || "-"}</div>
            <div><strong>{getTranslation("dateNaissance", language)}:</strong> {patient?.dateNaissance?.split("T")[0] || "-"}</div>
            <div><strong>{getTranslation("sexe", language)}:</strong> {patient?.sexe || "-"}</div>
            <div><strong>{getTranslation("profession", language)}:</strong> {patient?.profession || "-"}</div>
            <div><strong>{getTranslation("telephone", language)}:</strong> {patient?.telephone || "-"}</div>
            <div><strong>{getTranslation("nationalite", language)}:</strong> {patient?.nationaliteUtilisateur || "-"}</div>
          </div>
        </div>

        {/* Médecins */}
        <div>
          <h3 className="text-xl font-bold mb-3 text-gray-700">🩺 {getTranslation("medecins", language)}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><strong>{getTranslation("auteur", language)}:</strong> {doctorAuteur?.nomUtilisateur || "-"} {doctorAuteur?.prenomUtilisateur || "-"}</div>
            <div><strong>{getTranslation("destinataire", language)}:</strong> {doctorDest?.nomUtilisateur || "-"} {doctorDest?.prenomUtilisateur || "-"}</div>
            <div><strong>{getTranslation("emailAuteur", language)}:</strong> {doctorAuteur?.email || "-"}</div>
            <div><strong>{getTranslation("emailDestinataire", language)}:</strong> {doctorDest?.email || "-"}</div>
            <div><strong>{getTranslation("hopitalAuteur", language)}:</strong> {doctorAuteur?.hopitalId || "-"}</div>
            <div><strong>{getTranslation("hopitalDestinataire", language)}:</strong> {doctorDest?.hopitalId || "-"}</div>
          </div>
        </div>

        {/* Référence */}
        <div>
          <h3 className="text-xl font-bold mb-3 text-gray-700">📑 {getTranslation("reference", language)}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><strong>ID:</strong> {reference.id}</div>
            <div><strong>{getTranslation("type", language)}:</strong> {reference.type}</div>
            <div><strong>{getTranslation("date", language)}:</strong> {reference.date?.split("T")[0] || "-"}</div>
            <div><strong>{getTranslation("validation", language)}:</strong> {reference.validation ? "✅ " + getTranslation("validee", language) : "⏳ " + getTranslation("enAttente", language)}</div>
            <div><strong>{getTranslation("statut", language)}:</strong> {reference.statut || "-"}</div>
          </div>
        </div>

        {/* Motif */}
        {motif && (
          <div>
            <h3 className="text-xl font-bold mb-3 text-gray-700">📌 {getTranslation("motif", language)}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><strong>{getTranslation("autresPreciser", language)}:</strong> {motif?.autresAPreciser ? getTranslation("oui", language) : getTranslation("non", language)}</div>
              <div><strong>{getTranslation("autresMotif", language)}:</strong> {motif?.motifAutres?.autresMotif || "-"}</div>
              <div><strong>{getTranslation("changementAdresse", language)}:</strong> {motif?.changementAdresse ? getTranslation("oui", language) : getTranslation("non", language)}</div>
              <div><strong>{getTranslation("permanente", language)}:</strong> {motif?.motifChangements?.permanent ? getTranslation("oui", language) : getTranslation("non", language)}</div>
              <div><strong>{getTranslation("temporaire", language)}:</strong> {motif?.motifChangements?.temporaire ? getTranslation("oui", language) : getTranslation("non", language)}</div>
              <div><strong>{getTranslation("servicesArv", language)}:</strong> {motif?.motifServs?.arv ? getTranslation("oui", language) : getTranslation("non", language)}</div>
              <div><strong>{getTranslation("servicesBilan", language)}:</strong> {motif?.motifServs?.bilan ? getTranslation("oui", language) : getTranslation("non", language)}</div>
              <div><strong>{getTranslation("servicesIo", language)}:</strong> {motif?.motifServs?.io ? getTranslation("oui", language) : getTranslation("non", language)}</div>
              <div><strong>{getTranslation("servicesPtme", language)}:</strong> {motif?.motifServs?.ptme ? getTranslation("oui", language) : getTranslation("non", language)}</div>
              <div><strong>{getTranslation("servicesSuivi", language)}:</strong> {motif?.motifServs?.suivi ? getTranslation("oui", language) : getTranslation("non", language)}</div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="pt-6 flex justify-end space-x-4 border-t">
        {type === "sent" && !reference.validation && (
          <button onClick={handleValidation} className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center hover:bg-green-700">
            <CheckCircle className="h-5 w-5 mr-2" /> {getTranslation("valider", language)}
          </button>
        )}
        {type === "received" && !reference.etat && (
          <button onClick={handleFeedback} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center hover:bg-blue-700">
            <Reply className="h-5 w-5 mr-2" /> {getTranslation("feedback", language)}
          </button>
        )}
        {type === "sent" && reference.validation && (
          <>
            <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center hover:bg-red-700">
              <Trash2 className="h-5 w-5 mr-2" /> {getTranslation("supprimer", language)}
            </button>
            <button onClick={handleEditClick} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center hover:bg-blue-700">
              <Edit3 className="h-5 w-5 mr-2" /> {getTranslation("modifier", language)}
            </button>
          </>
        )}
      </div>
    </div>
  );

};

export default ReferenceView;
