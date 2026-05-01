import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Trash2, CheckCircle, Clock, AlertCircle, User, FileText, Hospital, Calendar, MessageSquare, Activity, FlaskConical } from 'lucide-react';
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
    if (window.confirm('Êtes-vous sûr de vouloir accepter cette référence ?')) {
      try {
        await referenceDossierService.acceptReference(codeReference);
        fetchReference();
      } catch (error) {
        console.error("Erreur lors de l'acceptation:", error);
        alert("Erreur lors de l'acceptation de la référence");
      }
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

  const getStatusIcon = (statut) => {
    switch (statut) {
      case 'RECUE': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'ENVOYEE': return <FileText className="w-4 h-4 text-blue-600" />;
      case 'EN_ATTENTE': return <Clock className="w-4 h-4 text-yellow-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
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

  const Field = ({ label, value }) => (
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="mt-0.5 text-sm text-gray-900">{value || '-'}</p>
    </div>
  );

  const SectionTitle = ({ icon, title, color = 'blue' }) => {
    const colors = {
      blue: 'text-blue-600', green: 'text-green-600', purple: 'text-purple-600',
      orange: 'text-orange-600', indigo: 'text-indigo-600', red: 'text-red-600',
      teal: 'text-teal-600', gray: 'text-gray-600'
    };
    return (
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
        <span className={colors[color]}>{icon}</span>
        {title}
      </h2>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des détails...</p>
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
    <div className="max-w-5xl mx-auto p-4 bg-gray-50 min-h-screen space-y-4">

      {/* En-tête */}
      <div className="bg-white rounded-lg shadow p-5">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            Détails de la Référence
          </h1>
          <button onClick={onBack} className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-1 text-sm">
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadgeClass(reference.statut)}`}>
            {getStatusIcon(reference.statut)}
            {reference.statut === 'RECUE' ? 'Reçue' : reference.statut === 'ENVOYEE' ? 'Envoyée' : reference.statut === 'EN_ATTENTE' ? 'En attente' : reference.statut}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {canEdit && (
            <button onClick={() => onEdit && onEdit(reference)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1 text-sm">
              <Edit className="w-4 h-4" /> Modifier
            </button>
          )}
          {canAccept && reference.statut !== 'RECUE' && (
            <button onClick={handleAccept} className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1 text-sm">
              <CheckCircle className="w-4 h-4" /> Accepter
            </button>
          )}
          <button onClick={handleDelete} className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-1 text-sm">
            <Trash2 className="w-4 h-4" /> Supprimer
          </button>
        </div>
      </div>

      {/* Informations de la référence */}
      <div className="bg-white rounded-lg shadow p-5">
        <SectionTitle icon={<FileText className="w-5 h-5" />} title="Informations de la Référence" color="blue" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Field label="Code Référence" value={reference.codeReference} />
          <Field label="Date de Référence" value={formatDate(reference.dateReference)} />
          <Field label="Type de Référence" value={reference.typeReference} />
          <Field label="Motif" value={reference.motifReference} />
          <Field label="Date de Prise en Charge" value={formatDate(reference.datePriseEnCharge)} />
        </div>
      </div>

      {/* Informations du patient */}
      <div className="bg-white rounded-lg shadow p-5">
        <SectionTitle icon={<User className="w-5 h-5" />} title="Informations du Patient" color="green" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Field label="Code Patient" value={reference.codePatient} />
          <Field label="Nom" value={reference.nomPatient} />
          <Field label="Prénom" value={reference.prenomPatient} />
          <Field label="Date de Naissance" value={reference.dateNaissance ? formatDateOnly(reference.dateNaissance) : '-'} />
          <Field label="Âge" value={reference.age ? `${reference.age} ans` : '-'} />
          <Field label="Sexe" value={reference.sexe} />
          <Field label="Profession" value={reference.profession} />
          <Field label="Téléphone" value={reference.telephone} />
          <Field label="Nationalité" value={reference.nationalite} />
          <Field label="Statut Matrimonial" value={reference.statutMatrimoniale} />
        </div>
      </div>

      {/* Hôpital de destination + Médecin destinataire */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-5">
          <SectionTitle icon={<Hospital className="w-5 h-5" />} title="Hôpital de Destination" color="purple" />
          <div className="space-y-3">
            <Field label="Code Hôpital" value={reference.codeHopital} />
            <Field label="Nom Hôpital" value={reference.nomHopital} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <SectionTitle icon={<User className="w-5 h-5" />} title="Médecin Destinataire" color="orange" />
          <div className="space-y-3">
            <Field label="Code Médecin" value={reference.codeDocteur} />
            <Field label="Nom Médecin" value={reference.nomDocteur} />
          </div>
        </div>
      </div>

      {/* Informations du référenceur */}
      <div className="bg-white rounded-lg shadow p-5">
        <SectionTitle icon={<MessageSquare className="w-5 h-5" />} title="Informations du Référenceur" color="indigo" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Field label="Code Référenceur" value={reference.codeReferenceur} />
          <Field label="Nom Référenceur" value={reference.nomReferenceur} />
          <Field label="Fonction" value={reference.fonctionReferenceur} />
          <Field label="Nationalité" value={reference.nationaliteReferenceur} />
          <Field label="Hôpital d'origine" value={reference.nomHopitalReferenceur || reference.codeHopitalReferenceur} />
          <Field label="Téléphone" value={reference.telephoneReferenceur} />
          <Field label="Email" value={reference.emailReferenceur} />
        </div>
      </div>

      {/* Motif Détaillé */}
      {(reference.changementAdresse || reference.autresAPreciser || (reference.motifs && reference.motifs.length > 0)) && (
        <div className="bg-white rounded-lg shadow p-5">
          <SectionTitle icon={<FileText className="w-5 h-5" />} title="Motif Détaillé" color="blue" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {reference.changementAdresse && (
              <Field label="Changement d'adresse"
                value={reference.changementAdressePermanent ? 'Permanent' : reference.changementAdresseTemporaire ? 'Temporaire' : 'Oui'} />
            )}
            {reference.autresAPreciser && (
              <Field label="Autre motif" value={reference.autresMotif} />
            )}
            {reference.motifs && reference.motifs.length > 0 && (
              <div className="md:col-span-3">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Motifs médicaux</p>
                <div className="flex flex-wrap gap-2">
                  {reference.motifs.map((motif, i) => (
                    <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{motif.nomMotif}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Services demandés */}
      {(reference.serviceArv || reference.serviceLaboratoire || reference.servicePtme || reference.serviceCrc || reference.servicePvvih) && (
        <div className="bg-white rounded-lg shadow p-5">
          <SectionTitle icon={<Hospital className="w-5 h-5" />} title="Services Demandés" color="green" />
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
      <div className="bg-white rounded-lg shadow p-5">
        <SectionTitle icon={<Activity className="w-5 h-5" />} title="Informations Cliniques" color="purple" />

        {/* Poids & Stades OMS */}
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 bg-gray-100 px-3 py-1.5 rounded">Poids &amp; Stades OMS</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Poids" value={reference.poidsKg ? `${reference.poidsKg} kg` : null} />
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Stade OMS</p>
              <div className="flex flex-wrap gap-1">
                {reference.stades && reference.stades.length > 0 ? (
                  ['stade1','stade2','stade3','stade4'].map(s => reference.stades[0]?.[s] && (
                    <span key={s} className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded">{s.replace('stade','Stade ')}</span>
                  ))
                ) : <span className="text-sm text-gray-900">-</span>}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Profil VIH</p>
              <div className="flex flex-wrap gap-1">
                {reference.profils && reference.profils.length > 0 ? (
                  ['profil1','profil2','profil12','indetermine'].map(p => reference.profils[0]?.[p] && (
                    <span key={p} className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs rounded">{p}</span>
                  ))
                ) : <span className="text-sm text-gray-900">-</span>}
              </div>
            </div>
            {reference.profils?.[0]?.dateConfirmation && (
              <Field label="Date confirmation VIH" value={formatDateOnly(reference.profils[0].dateConfirmation)} />
            )}
          </div>
        </div>

        {/* Traitement ARV */}
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 bg-gray-100 px-3 py-1.5 rounded">Traitement ARV</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="Sous ARV" value={reference.traitementARV ? 'Oui' : 'Non'} />
            {reference.traitementARV && (
              <>
                {reference.protocoles1s && reference.protocoles1s.length > 0 && reference.protocoles1s[0]?.protocole1ereLigne && (
                  <Field label="Protocole 1ère ligne" value={`${reference.protocoles1s[0].protocole1ereLigne}${reference.protocoles1s[0].dateProtocole1 ? ' — ' + formatDateOnly(reference.protocoles1s[0].dateProtocole1) : ''}`} />
                )}
                {reference.protocoles2s && reference.protocoles2s.length > 0 && reference.protocoles2s[0]?.protocole2emeLigne && (
                  <Field label="Protocole 2ème ligne" value={`${reference.protocoles2s[0].protocole2emeLigne}${reference.protocoles2s[0].dateProtocole2 ? ' — ' + formatDateOnly(reference.protocoles2s[0].dateProtocole2) : ''}`} />
                )}
              </>
            )}
          </div>
        </div>

        {/* CD4 */}
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 bg-gray-100 px-3 py-1.5 rounded">CD4</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="CD4 Dernier" value={reference.cd4Dernier ? `${reference.cd4Dernier}${reference.dateCd4Dernier ? ' — ' + formatDateOnly(reference.dateCd4Dernier) : ''}` : null} />
            <Field label="CD4 Début traitement" value={reference.cd4DebutTraitement ? `${reference.cd4DebutTraitement}${reference.dateCd4DebutTraitement ? ' — ' + formatDateOnly(reference.dateCd4DebutTraitement) : ''}` : null} />
            <Field label="CD4 Inclusion" value={reference.cd4Inclusion ? `${reference.cd4Inclusion}${reference.dateCd4Inclusion ? ' — ' + formatDateOnly(reference.dateCd4Inclusion) : ''}` : null} />
          </div>
        </div>

        {/* Analyses biologiques */}
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 bg-gray-100 px-3 py-1.5 rounded">Analyses biologiques</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="Charge Virale" value={reference.chargeViraleNiveau ? `${reference.chargeViraleNiveau}${reference.dateDebutChargeVirale ? ' — ' + formatDateOnly(reference.dateDebutChargeVirale) : ''}` : null} />
            <Field label="Hémoglobine (Hb)" value={reference.hbNiveau ? `${reference.hbNiveau}${reference.dateHb ? ' — ' + formatDateOnly(reference.dateHb) : ''}` : null} />
            <Field label="Lymphocytes totaux" value={reference.lymphocytesTotaux ? `${reference.lymphocytesTotaux}${reference.dateLymphocytes ? ' — ' + formatDateOnly(reference.dateLymphocytes) : ''}` : null} />
            <Field label="Allergie" value={reference.allergie ? `${reference.allergie}${reference.dateAllergie ? ' — ' + formatDateOnly(reference.dateAllergie) : ''}` : null} />
            <Field label="Créatininémie" value={reference.creatinemie ? `${reference.creatinemie}${reference.dateCreatinemie ? ' — ' + formatDateOnly(reference.dateCreatinemie) : ''}` : null} />
          </div>
        </div>

        {/* Analyses microbiologiques */}
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 bg-gray-100 px-3 py-1.5 rounded">Analyses microbiologiques</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="Crachat BAAR" value={reference.cracheBaar ? `${reference.cracheBaar}${reference.dateCracheBaar ? ' — ' + formatDateOnly(reference.dateCracheBaar) : ''}` : null} />
            <Field label="AgHBs" value={reference.aghbs ? `${reference.aghbs}${reference.dateAghbs ? ' — ' + formatDateOnly(reference.dateAghbs) : ''}` : null} />
            <Field label="Transaminases" value={reference.transaminase ? `${reference.transaminase}${reference.dateTransaminase ? ' — ' + formatDateOnly(reference.dateTransaminase) : ''}` : null} />
            {reference.transaminaseAsat && <Field label="ASAT" value={reference.transaminaseAsat} />}
            {reference.transaminaseAlat && <Field label="ALAT" value={reference.transaminaseAlat} />}
            {reference.autreAnalyse && (
              <Field label="Autre analyse" value={`Oui${reference.dateAutreAnalyse ? ' — ' + formatDateOnly(reference.dateAutreAnalyse) : ''}`} />
            )}
          </div>
        </div>

        {/* Traitement TB */}
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 bg-gray-100 px-3 py-1.5 rounded">Traitement TB</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="Sous traitement TB" value={reference.traitementtb ? 'Oui' : 'Non'} />
            {reference.traitementtb && reference.protocolesTheraps && reference.protocolesTheraps.length > 0 && reference.protocolesTheraps[0]?.therapie && (
              <Field label="Protocole thérapeutique" value={`${reference.protocolesTheraps[0].therapie}${reference.protocolesTheraps[0].dateTherapie ? ' — ' + formatDateOnly(reference.protocolesTheraps[0].dateTherapie) : ''}`} />
            )}
          </div>
        </div>

        {/* Autre traitement */}
        {reference.autreTraitement && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 bg-gray-100 px-3 py-1.5 rounded">Autre traitement</h3>
            <Field label="Autre traitement" value="Oui" />
          </div>
        )}
      </div>

      {/* Observations */}
      {reference.observations && (
        <div className="bg-white rounded-lg shadow p-5">
          <SectionTitle icon={<MessageSquare className="w-5 h-5" />} title="Observations" color="gray" />
          <p className="text-sm text-gray-900 whitespace-pre-wrap">{reference.observations}</p>
        </div>
      )}

      {/* Informations Temporelles */}
      <div className="bg-white rounded-lg shadow p-5">
        <SectionTitle icon={<Calendar className="w-5 h-5" />} title="Informations Temporelles" color="orange" />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Date de Création" value={formatDate(reference.dateCreation)} />
          <Field label="Dernière Modification" value={formatDate(reference.dateModification)} />
        </div>
      </div>

    </div>
  );
};

export default ReferenceDossierView;
