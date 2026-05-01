import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Trash2, CheckCircle, Clock, AlertCircle, User, FileText, Hospital, Calendar, MessageSquare } from 'lucide-react';
import referenceDossierService from '../services/referenceDossierService';
import { getTranslation } from '../utils/translations';

const ReferenceDossierView = ({ codeReference, language = "fr", onBack, onEdit }) => {
  const [reference, setReference] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canAccept, setCanAccept] = useState(false);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    if (codeReference) {
      fetchReference();
    }
  }, [codeReference]);

  const fetchReference = async () => {
    try {
      setLoading(true);
      const data = await referenceDossierService.getReferenceByCode(codeReference);
      setReference(data);
      setError(null);

      const [acceptPermission, editPermission] = await Promise.all([
        referenceDossierService.canAcceptReference(codeReference),
        referenceDossierService.canEditReference(codeReference)
      ]);
      setCanAccept(acceptPermission);
      setCanEdit(editPermission);
    } catch (err) {
      console.error('Erreur lors du chargement de la référence:', err);
      setError('Impossible de charger les détails de la référence');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette référence ?')) {
      try {
        await referenceDossierService.deleteReference(codeReference);
        onBack && onBack();
      } catch (err) {
        console.error('Erreur lors de la suppression:', err);
        alert('Erreur lors de la suppression de la référence');
      }
    }
  };

  const handleAccept = async () => {
    if (window.confirm(getTranslation('confirmAcceptReference', language) || 'Êtes-vous sûr de vouloir accepter cette référence ?')) {
      try {
        await referenceDossierService.acceptReference(codeReference);
        fetchReference();
      } catch (error) {
        console.error("Erreur lors de l'acceptation de la référence:", error);
        alert(getTranslation('errorAcceptingReference', language) || "Erreur lors de l'acceptation de la référence");
      }
    }
  };

  const getStatusIcon = (statut) => {
    switch (statut) {
      case 'RECUE': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'ENVOYEE': return <FileText className="w-5 h-5 text-blue-600" />;
      case 'EN_ATTENTE': return <Clock className="w-5 h-5 text-yellow-600" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadgeClass = (statut) => {
    switch (statut) {
      case 'RECUE': return 'bg-green-100 text-green-800 border-green-200';
      case 'ENVOYEE': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'EN_ATTENTE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch { return '-'; }
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric'
      });
    } catch { return '-'; }
  };

  // Helper pour afficher un champ info
  const InfoField = ({ label, value }) => (
    <div>
      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</label>
      <p className="mt-1 text-sm text-gray-900">{value || '-'}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">⏳ Chargement des détails...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">❌ {error}</p>
        <button onClick={fetchReference} className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
          🔄 Réessayer
        </button>
      </div>
    );
  }

  if (!reference) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-700">⚠️ Référence non trouvée</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">
          🔙 Retour
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-50 min-h-screen">

      {/* En-tête */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">📋 Détails de la Référence</h1>
          <button onClick={onBack} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </button>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadgeClass(reference.statut)}`}>
            {getStatusIcon(reference.statut)}
            <span className="ml-2">
              {reference.statut === 'RECUE' ? 'Reçue' :
               reference.statut === 'ENVOYEE' ? 'Envoyée' :
               reference.statut === 'EN_ATTENTE' ? 'En attente' : reference.statut}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {canEdit && (
            <button onClick={() => onEdit && onEdit(reference)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
              <Edit className="w-4 h-4 mr-2" /> Modifier
            </button>
          )}
          {canAccept && reference.statut !== 'RECUE' && (
            <button onClick={handleAccept} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" /> Accepter
            </button>
          )}
          <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center">
            <Trash2 className="w-4 h-4 mr-2" /> Supprimer
          </button>
        </div>
      </div>

      {/* Informations de la référence + Patient */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Informations de la référence */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            Informations de la Référence
          </h2>
          <div className="space-y-3">
            <InfoField label="Code Référence" value={reference.codeReference} />
            <InfoField label="Date de Référence" value={formatDate(reference.dateReference)} />
            <InfoField label="Type de Référence" value={reference.typeReference} />
            <InfoField label="Motif" value={reference.motifReference} />
            <InfoField label="Date de Prise en Charge" value={formatDate(reference.datePriseEnCharge)} />
          </div>
        </div>

        {/* Informations du patient */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-green-600" />
            Informations du Patient
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <InfoField label="Code Patient" value={reference.codePatient} />
            <InfoField label="Nom" value={reference.nomPatient} />
            <InfoField label="Prénom" value={reference.prenomPatient} />
            <InfoField label="Date de Naissance" value={reference.dateNaissance ? formatDateOnly(reference.dateNaissance) : null} />
            <InfoField label="Âge" value={reference.age ? `${reference.age} ans` : null} />
            <InfoField label="Sexe" value={reference.sexe} />
            <InfoField label="Profession" value={reference.profession} />
            <InfoField label="Téléphone" value={reference.telephone} />
            <InfoField label="Nationalité" value={reference.nationalite} />
          </div>
        </div>
      </div>

      {/* Hôpital de destination + Médecin destinataire */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Hospital className="w-5 h-5 mr-2 text-purple-600" />
            Hôpital de Destination
          </h2>
          <div className="space-y-3">
            <InfoField label="Code Hôpital" value={reference.codeHopital} />
            <InfoField label="Nom Hôpital" value={reference.nomHopital} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-orange-600" />
            Médecin Destinataire
          </h2>
          <div className="space-y-3">
            <InfoField label="Code Médecin" value={reference.codeDocteur} />
            <InfoField label="Nom Médecin" value={reference.nomDocteur} />
          </div>
        </div>
      </div>

      {/* Informations du référenceur */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <MessageSquare className="w-5 h-5 mr-2 text-indigo-600" />
          Informations du Référenceur
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <InfoField label="Code Référenceur" value={reference.codeReferenceur} />
          <InfoField label="Nom Référenceur" value={reference.nomReferenceur} />
          <InfoField label="Fonction" value={reference.fonctionReferenceur} />
          <InfoField label="Nationalité" value={reference.nationaliteReferenceur} />
          <InfoField label="Hôpital d'origine" value={reference.nomHopitalReferenceur || reference.codeHopitalReferenceur} />
          <InfoField label="Téléphone" value={reference.telephoneReferenceur} />
          <div className="md:col-span-3">
            <InfoField label="Email" value={reference.emailReferenceur} />
          </div>
        </div>
      </div>

      {/* Motif Détaillé */}
      {(reference.changementAdresse || reference.autresAPreciser || (reference.motifs && reference.motifs.length > 0)) && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            Motif Détaillé
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reference.changementAdresse && (
              <InfoField
                label="Changement d'adresse"
                value={reference.changementAdressePermanent ? 'Permanent' : reference.changementAdresseTemporaire ? 'Temporaire' : 'Oui'}
              />
            )}
            {reference.autresAPreciser && (
              <InfoField label="Autre motif" value={reference.autresMotif} />
            )}
            {reference.motifs && reference.motifs.length > 0 && (
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Motifs médicaux</label>
                <div className="flex flex-wrap gap-2">
                  {reference.motifs.map((motif, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {motif.nomMotif}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Services Demandés */}
      {(reference.serviceArv || reference.serviceLaboratoire || reference.servicePtme || reference.serviceCrc || reference.servicePvvih) && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Hospital className="w-5 h-5 mr-2 text-green-600" />
            Services Demandés
          </h2>
          <div className="flex flex-wrap gap-2">
            {reference.serviceArv && <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">ARV</span>}
            {reference.serviceLaboratoire && <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">Laboratoire</span>}
            {reference.servicePtme && <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">PTME</span>}
            {reference.serviceCrc && <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">CRC</span>}
            {reference.servicePvvih && <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">PVVIH</span>}
          </div>
        </div>
      )}

      {/* Informations Cliniques */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <User className="w-5 h-5 mr-2 text-purple-600" />
          Informations Cliniques
        </h2>

        {/* Poids & Stades OMS */}
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 border-b pb-1">Poids & Stades OMS</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <InfoField label="Poids" value={reference.poidsKg ? `${reference.poidsKg} kg` : null} />
            {reference.stades && reference.stades.length > 0 && (
              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Stade OMS</label>
                <div className="flex flex-wrap gap-2">
                  {reference.stades[0]?.stade1 && <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">Stade 1</span>}
                  {reference.stades[0]?.stade2 && <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">Stade 2</span>}
                  {reference.stades[0]?.stade3 && <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">Stade 3</span>}
                  {reference.stades[0]?.stade4 && <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">Stade 4</span>}
                </div>
              </div>
            )}
            {reference.profils && reference.profils.length > 0 && (
              <div className="md:col-span-4">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Profil VIH</label>
                <div className="flex flex-wrap gap-2">
                  {reference.profils[0]?.profil1 && <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded">Profil 1</span>}
                  {reference.profils[0]?.profil2 && <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded">Profil 2</span>}
                  {reference.profils[0]?.profil12 && <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded">Profil 1+2</span>}
                  {reference.profils[0]?.indetermine && <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">Indéterminé</span>}
                  {reference.profils[0]?.dateConfirmation && (
                    <span className="text-xs text-gray-500 self-center">Confirmé le {formatDateOnly(reference.profils[0].dateConfirmation)}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Traitement ARV */}
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 border-b pb-1">Traitement ARV</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <InfoField label="Sous ARV" value={reference.traitementARV !== undefined && reference.traitementARV !== null ? (reference.traitementARV ? 'Oui' : 'Non') : null} />
            {reference.protocoles1s && reference.protocoles1s.length > 0 && reference.protocoles1s[0]?.protocole1ereLigne && (
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Protocoles 1ère ligne</label>
                {reference.protocoles1s.map((p, i) => p.protocole1ereLigne && (
                  <div key={i} className="text-sm text-gray-900">
                    {p.protocole1ereLigne}{p.dateProtocole1 ? ` (${formatDateOnly(p.dateProtocole1)})` : ''}
                  </div>
                ))}
              </div>
            )}
            {reference.protocoles2s && reference.protocoles2s.length > 0 && reference.protocoles2s[0]?.protocole2emeLigne && (
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Protocoles 2ème ligne</label>
                {reference.protocoles2s.map((p, i) => p.protocole2emeLigne && (
                  <div key={i} className="text-sm text-gray-900">
                    {p.protocole2emeLigne}{p.dateProtocole2 ? ` (${formatDateOnly(p.dateProtocole2)})` : ''}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CD4 */}
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 border-b pb-1">CD4</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <InfoField label="CD4 Dernier" value={reference.cd4Dernier ? `${reference.cd4Dernier}${reference.dateCd4Dernier ? ` (${formatDateOnly(reference.dateCd4Dernier)})` : ''}` : null} />
            <InfoField label="CD4 Début traitement" value={reference.cd4DebutTraitement ? `${reference.cd4DebutTraitement}${reference.dateCd4DebutTraitement ? ` (${formatDateOnly(reference.dateCd4DebutTraitement)})` : ''}` : null} />
            <InfoField label="CD4 Inclusion" value={reference.cd4Inclusion ? `${reference.cd4Inclusion}${reference.dateCd4Inclusion ? ` (${formatDateOnly(reference.dateCd4Inclusion)})` : ''}` : null} />
          </div>
        </div>

        {/* Analyses biologiques */}
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 border-b pb-1">Analyses biologiques</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <InfoField label="Charge Virale" value={reference.chargeViraleNiveau ? `${reference.chargeViraleNiveau}${reference.dateDebutChargeVirale ? ` (${formatDateOnly(reference.dateDebutChargeVirale)})` : ''}` : null} />
            <InfoField label="Hémoglobine (Hb)" value={reference.hbNiveau ? `${reference.hbNiveau}${reference.dateHb ? ` (${formatDateOnly(reference.dateHb)})` : ''}` : null} />
            <InfoField label="Lymphocytes totaux" value={reference.lymphocytesTotaux ? `${reference.lymphocytesTotaux}${reference.dateLymphocytes ? ` (${formatDateOnly(reference.dateLymphocytes)})` : ''}` : null} />
          </div>
        </div>

        {/* Analyses microbiologiques */}
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 border-b pb-1">Analyses microbiologiques</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <InfoField label="Crachat BAAR" value={reference.cracheBaar ? `${reference.cracheBaar}${reference.dateCracheBaar ? ` (${formatDateOnly(reference.dateCracheBaar)})` : ''}` : null} />
            <InfoField label="AgHBs" value={reference.aghbs ? `${reference.aghbs}${reference.dateAghbs ? ` (${formatDateOnly(reference.dateAghbs)})` : ''}` : null} />
            <InfoField label="Transaminases" value={reference.transaminase ? `${reference.transaminase}${reference.dateTransaminase ? ` (${formatDateOnly(reference.dateTransaminase)})` : ''}` : null} />
            {reference.transaminaseAsat && <InfoField label="ASAT" value={reference.transaminaseAsat} />}
            {reference.transaminaseAlat && <InfoField label="ALAT" value={reference.transaminaseAlat} />}
            {reference.autreAnalyse && (
              <InfoField label="Autre analyse" value={`Oui${reference.dateAutreAnalyse ? ` (${formatDateOnly(reference.dateAutreAnalyse)})` : ''}`} />
            )}
          </div>
        </div>

        {/* Traitement TB */}
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 border-b pb-1">Traitement TB</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <InfoField label="Sous traitement TB" value={reference.traitementtb !== undefined && reference.traitementtb !== null ? (reference.traitementtb ? 'Oui' : 'Non') : null} />
            {reference.protocolesTheraps && reference.protocolesTheraps.length > 0 && reference.protocolesTheraps[0]?.therapie && (
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Protocoles thérapeutiques</label>
                {reference.protocolesTheraps.map((t, i) => t.therapie && (
                  <div key={i} className="text-sm text-gray-900">
                    {t.therapie}{t.dateTherapie ? ` (${formatDateOnly(t.dateTherapie)})` : ''}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Autre traitement */}
        {reference.autreTraitement && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 border-b pb-1">Autre traitement</h3>
            <InfoField label="Autre traitement" value="Oui" />
          </div>
        )}
      </div>

      {/* Observations */}
      {reference.observations && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-gray-600" />
            Observations
          </h2>
          <p className="text-sm text-gray-900 whitespace-pre-wrap">{reference.observations}</p>
        </div>
      )}

      {/* Informations Temporelles */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-orange-600" />
          Informations Temporelles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoField label="Date de Création" value={formatDate(reference.dateCreation)} />
          <InfoField label="Dernière Modification" value={formatDate(reference.dateModification)} />
        </div>
      </div>

    </div>
  );
};

export default ReferenceDossierView;
