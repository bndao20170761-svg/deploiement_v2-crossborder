import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Edit, Trash2, CheckCircle, Clock, AlertCircle, User, FileText, Hospital, Calendar, MessageSquare, Activity } from 'lucide-react';
import referenceDossierService from '../services/referenceDossierService';
import { getTranslation } from '../utils/translations';

const ReferenceDossierView = ({ codeReference, language = "fr", onBack, onEdit }) => {
  const [reference, setReference] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canAccept, setCanAccept] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [canValidate, setCanValidate] = useState(false);

  const fetchReference = useCallback(async () => {
    try {
      setLoading(true);
      const data = await referenceDossierService.getReferenceByCode(codeReference);
      setReference(data);
      setError(null);
      const [acceptPerm, editPerm, validatePerm] = await Promise.all([
        referenceDossierService.canAcceptReference(codeReference),
        referenceDossierService.canEditReference(codeReference),
        referenceDossierService.canValidateReference(codeReference)
      ]);
      setCanAccept(acceptPerm);
      setCanEdit(editPerm);
      setCanValidate(validatePerm);
    } catch (err) {
      console.error('Erreur chargement référence:', err);
      setError(getTranslation('errorLoadingReference', language));
    } finally {
      setLoading(false);
    }
  }, [codeReference, language]);

  useEffect(() => {
    if (codeReference) fetchReference();
  }, [codeReference, fetchReference]);

  const handleDelete = async () => {
    if (window.confirm(getTranslation('confirmDeleteReference', language))) {
      try {
        await referenceDossierService.deleteReference(codeReference);
        onBack && onBack();
      } catch (err) {
        console.error('Erreur suppression:', err);
        alert(getTranslation('errorDeleteReference', language));
      }
    }
  };

  const handleAccept = async () => {
    if (window.confirm(getTranslation('confirmAcceptReference', language))) {
      try {
        await referenceDossierService.acceptReference(codeReference);
        fetchReference();
      } catch (err) {
        console.error("Erreur acceptation:", err);
        alert(getTranslation('errorAcceptReference', language));
      }
    }
  };

  const handleValidate = async () => {
    if (window.confirm(getTranslation('confirmValidateReference', language))) {
      try {
        await referenceDossierService.validerReference(codeReference);
        fetchReference();
      } catch (err) {
        console.error("Erreur validation:", err);
        alert(getTranslation('errorValidateReference', language));
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

  const getStatusLabel = (statut) => {
    switch (statut) {
      case 'RECUE': return getTranslation('statusRecue', language);
      case 'ENVOYEE': return getTranslation('statusEnvoyee', language);
      case 'EN_ATTENTE': return getTranslation('statusEnAttente', language);
      default: return statut;
    }
  };

  const formatDate = (d) => {
    if (!d) return '-';
    try {
      return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return '-'; }
  };

  const formatDateOnly = (d) => {
    if (!d) return null;
    try {
      return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch { return null; }
  };

  // Affiche valeur + date optionnelle
  const withDate = (value, date) => {
    const d = formatDateOnly(date);
    if (!value && !d) return null;
    if (value && d) return `${value}  (${d})`;
    return value || d;
  };

  // Composant champ simple
  const Field = ({ label, value }) => (
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="mt-0.5 text-sm text-gray-900">{value || '-'}</p>
    </div>
  );

  // Titre de section
  const SectionTitle = ({ icon, title, color = 'blue' }) => {
    const colors = { blue: 'text-blue-600', green: 'text-green-600', purple: 'text-purple-600', orange: 'text-orange-600', indigo: 'text-indigo-600', teal: 'text-teal-600', gray: 'text-gray-600', red: 'text-red-600' };
    return (
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
        <span className={colors[color] || 'text-blue-600'}>{icon}</span>
        {title}
      </h2>
    );
  };

  // Sous-titre de section clinique
  const SubSection = ({ title }) => (
    <h3 className="text-sm font-semibold text-gray-700 mb-3 bg-gray-100 px-3 py-1.5 rounded">{title}</h3>
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">{getTranslation('loadingDetails', language)}</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-red-700">❌ {error}</p>
      <button onClick={fetchReference} className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
        🔄 {getTranslation('retry', language)}
      </button>
    </div>
  );

  if (!reference) return (
    <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
      <p className="text-yellow-700">⚠️ {getTranslation('referenceNotFound', language)}</p>
      <button onClick={onBack} className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">
        🔙 {getTranslation('retour', language)}
      </button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-4 bg-gray-50 min-h-screen space-y-4">

      {/* En-tête */}
      <div className="bg-white rounded-lg shadow p-5">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            {getTranslation('referenceDetails', language)}
          </h1>
          <button onClick={onBack} className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-1 text-sm">
            <ArrowLeft className="w-4 h-4" /> {getTranslation('retour', language)}
          </button>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadgeClass(reference.statut)}`}>
            {getStatusIcon(reference.statut)}
            {getStatusLabel(reference.statut)}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {canEdit && (
            <button onClick={() => onEdit && onEdit(reference)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1 text-sm">
              <Edit className="w-4 h-4" /> {getTranslation('edit', language)}
            </button>
          )}
          {canAccept && reference.statut !== 'RECUE' && (
            <button onClick={handleAccept} className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1 text-sm">
              <CheckCircle className="w-4 h-4" /> {getTranslation('accept', language)}
            </button>
          )}
          {canValidate && !reference.validation && (
            <button onClick={handleValidate} className="px-3 py-1.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 flex items-center gap-1 text-sm">
              <CheckCircle className="w-4 h-4" /> {getTranslation('validerReference', language)}
            </button>
          )}
          <button onClick={handleDelete} className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-1 text-sm">
            <Trash2 className="w-4 h-4" /> {getTranslation('delete', language)}
          </button>
        </div>
      </div>

      {/* Informations de la référence */}
      <div className="bg-white rounded-lg shadow p-5">
        <SectionTitle icon={<FileText className="w-5 h-5" />} title={getTranslation('referenceInformation', language)} color="blue" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Field label={getTranslation('codeReference', language)} value={reference.codeReference} />
          <Field label={getTranslation('referenceDate', language)} value={formatDate(reference.dateReference)} />
          <Field label={getTranslation('referenceType', language)} value={reference.typeReference} />
          <Field label={getTranslation('motif', language)} value={reference.motifReference} />
          <Field label={getTranslation('priseEnChargeDate', language)} value={formatDate(reference.datePriseEnCharge)} />
        </div>
      </div>

      {/* Informations du patient */}
      <div className="bg-white rounded-lg shadow p-5">
        <SectionTitle icon={<User className="w-5 h-5" />} title={getTranslation('patientInformation', language)} color="green" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Field label={getTranslation('codePatient', language)} value={reference.codePatient} />
          <Field label={getTranslation('nomLabel', language)} value={reference.nomPatient} />
          <Field label={getTranslation('prenomLabel', language)} value={reference.prenomPatient} />
          <Field label={getTranslation('dateNaissanceLabel', language)} value={reference.dateNaissance ? formatDateOnly(reference.dateNaissance) : null} />
          <Field label={getTranslation('ageLabel', language)} value={reference.age ? `${reference.age} ${getTranslation('ans', language)}` : null} />
          <Field label={getTranslation('sexeLabel', language)} value={reference.sexe} />
          <Field label={getTranslation('professionLabel', language)} value={reference.profession} />
          <Field label={getTranslation('telephoneLabel', language)} value={reference.telephone} />
          <Field label={getTranslation('nationalite', language)} value={reference.nationalite} />
          <Field label={getTranslation('statutMatrimonial', language)} value={reference.statutMatrimoniale} />
        </div>
      </div>

      {/* Hôpital destination + Médecin destinataire */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-5">
          <SectionTitle icon={<Hospital className="w-5 h-5" />} title={getTranslation('hopitalDestination', language)} color="purple" />
          <div className="space-y-3">
            <Field label={getTranslation('codeHopital', language)} value={reference.codeHopital} />
            <Field label={getTranslation('nomHopital', language)} value={reference.nomHopital} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <SectionTitle icon={<User className="w-5 h-5" />} title={getTranslation('medecinDestinataire', language)} color="orange" />
          <div className="space-y-3">
            <Field label={getTranslation('codeDocteur', language)} value={reference.codeDocteur} />
            <Field label={getTranslation('nomDocteur', language)} value={reference.nomDocteur} />
          </div>
        </div>
      </div>

      {/* Informations du référenceur */}
      <div className="bg-white rounded-lg shadow p-5">
        <SectionTitle icon={<MessageSquare className="w-5 h-5" />} title={getTranslation('referenceurInformation', language)} color="indigo" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Field label={getTranslation('codeReferenceur', language)} value={reference.codeReferenceur} />
          <Field label={getTranslation('nomReferenceur', language)} value={reference.nomReferenceur} />
          <Field label={getTranslation('fonctionReferenceur', language)} value={reference.fonctionReferenceur} />
          <Field label={getTranslation('nationaliteReferenceur', language)} value={reference.nationaliteReferenceur} />
          <Field label={getTranslation('hopitalOrigine', language)} value={reference.nomHopitalReferenceur || reference.codeHopitalReferenceur} />
          <Field label={getTranslation('telephoneReferenceur', language)} value={reference.telephoneReferenceur} />
          <Field label={getTranslation('emailReferenceur', language)} value={reference.emailReferenceur} />
        </div>
      </div>

      {/* Motif Détaillé */}
      {(reference.changementAdresse || reference.autresAPreciser || (reference.motifs && reference.motifs.length > 0)) && (
        <div className="bg-white rounded-lg shadow p-5">
          <SectionTitle icon={<FileText className="w-5 h-5" />} title={getTranslation('motifDetaille', language)} color="blue" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {reference.changementAdresse && (
              <Field label={getTranslation('changementAdresse', language)}
                value={reference.changementAdressePermanent ? getTranslation('permanent', language) : reference.changementAdresseTemporaire ? getTranslation('temporaire', language) : getTranslation('oui', language)} />
            )}
            {reference.autresAPreciser && (
              <Field label={getTranslation('autresPreciser', language)} value={reference.autresMotif} />
            )}
            {reference.motifs && reference.motifs.length > 0 && (
              <div className="md:col-span-3">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{getTranslation('motifsMedicaux', language)}</p>
                <div className="flex flex-wrap gap-2">
                  {reference.motifs.map((m, i) => (
                    <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{m.nomMotif}</span>
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
          <SectionTitle icon={<Hospital className="w-5 h-5" />} title={getTranslation('servicesDemandes', language)} color="green" />
         <div className="flex flex-wrap gap-2">
  {reference.serviceArv && (
    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
      {getTranslation('arv', language)}
    </span>
  )}

  {reference.serviceLaboratoire && (
    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
      {getTranslation('laboratoire', language)}
    </span>
  )}

  {reference.servicePtme && (
    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
      {getTranslation('ptme', language)}
    </span>
  )}

  {reference.serviceCrc && (
    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
      {getTranslation('crc', language)}
    </span>
  )}

  {reference.servicePvvih && (
    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
      {getTranslation('pvvih', language)}
    </span>
  )}
</div>
        </div>
      )}

      {/* Informations Cliniques */}
      <div className="bg-white rounded-lg shadow p-5">
        <SectionTitle icon={<Activity className="w-5 h-5" />} title={getTranslation('clinicalInformation', language)} color="purple" />

        {/* Poids & Stades OMS */}
        <div className="mb-5">
          <SubSection title={getTranslation('poidsStadesOMS', language)} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label={getTranslation('poids', language)} value={reference.poidsKg ? `${reference.poidsKg} kg` : null} />
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{getTranslation('stadeOMS', language)}</p>
              <div className="flex flex-wrap gap-1">
                {reference.stades && reference.stades.length > 0
                  ? ['stade1','stade2','stade3','stade4'].map(s => reference.stades[0]?.[s] && (
                      <span key={s} className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded">{s.replace('stade','Stade ')}</span>
                    ))
                  : <span className="text-sm text-gray-900">-</span>}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{getTranslation('profilVIH', language)}</p>
              <div className="flex flex-wrap gap-1">
                {reference.profils && reference.profils.length > 0
                  ? ['profil1','profil2','profil12','indetermine'].map(p => reference.profils[0]?.[p] && (
                      <span key={p} className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs rounded">{p}</span>
                    ))
                  : <span className="text-sm text-gray-900">-</span>}
              </div>
            </div>
            {reference.profils?.[0]?.dateConfirmation && (
              <Field label={getTranslation('dateConfirmation', language)} value={formatDateOnly(reference.profils[0].dateConfirmation)} />
            )}
          </div>
        </div>

        {/* Traitement ARV */}
        <div className="mb-5">
          <SubSection title={getTranslation('traitementARVSection', language)} />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label={getTranslation('sousARV', language)} value={reference.traitementARV ? getTranslation('oui', language) : getTranslation('non', language)} />
            {reference.dateDebutARV && (
              <Field label={getTranslation('dateDebutARV', language)} value={formatDateOnly(reference.dateDebutARV)} />
            )}
            {reference.traitementARV && reference.protocoles1s && reference.protocoles1s.length > 0 && (
              reference.protocoles1s.map((p, i) => p.protocole1ereLigne && (
                <div key={`p1-${i}`}>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{getTranslation('protocole1ereLigne', language)}</p>
                  <p className="mt-0.5 text-sm text-gray-900">{p.protocole1ereLigne}</p>
                  {p.dateProtocole1 && <p className="text-xs text-gray-500">{formatDateOnly(p.dateProtocole1)}</p>}
                </div>
              ))
            )}
            {reference.traitementARV && reference.protocoles2s && reference.protocoles2s.length > 0 && (
              reference.protocoles2s.map((p, i) => p.protocole2emeLigne && (
                <div key={`p2-${i}`}>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{getTranslation('protocole2emeLigne', language)}</p>
                  <p className="mt-0.5 text-sm text-gray-900">{p.protocole2emeLigne}</p>
                  {p.dateProtocole2 && <p className="text-xs text-gray-500">{formatDateOnly(p.dateProtocole2)}</p>}
                </div>
              ))
            )}
          </div>
        </div>

        {/* CD4 */}
        <div className="mb-5">
          <SubSection title={getTranslation('cd4', language)} />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label={getTranslation('cd4Dernier', language)} value={withDate(reference.cd4Dernier, reference.dateCd4Dernier)} />
            <Field label={getTranslation('cd4DebutTraitement', language)} value={withDate(reference.cd4DebutTraitement, reference.dateCd4DebutTraitement)} />
            <Field label={getTranslation('cd4Inclusion', language)} value={withDate(reference.cd4Inclusion, reference.dateCd4Inclusion)} />
          </div>
        </div>

        {/* Analyses biologiques */}
        <div className="mb-5">
          <SubSection title={getTranslation('analysesBiologiques', language)} />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label={getTranslation('chargeVirale', language)} value={withDate(reference.chargeViraleNiveau, reference.dateDebutChargeVirale)} />
            <Field label={getTranslation('hbNiveau', language)} value={withDate(reference.hbNiveau, reference.dateHb)} />
            <Field label={getTranslation('lymphocytesTotaux', language)} value={withDate(reference.lymphocytesTotaux, reference.dateLymphocytes)} />
            <Field label={getTranslation('allergie', language)} value={withDate(reference.allergie, reference.dateAllergie)} />
            <Field label={getTranslation('creatinemie', language)} value={withDate(reference.creatinemie, reference.dateCreatinemie)} />
          </div>
        </div>

        {/* Analyses microbiologiques */}
        <div className="mb-5">
          <SubSection title={getTranslation('analysesMicrobiologiques', language)} />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label={getTranslation('cracheBaar', language)} value={withDate(reference.cracheBaar, reference.dateCracheBaar)} />
            <Field label={getTranslation('aghbs', language)} value={withDate(reference.aghbs, reference.dateAghbs)} />
            <Field label={getTranslation('transaminase', language)} value={withDate(reference.transaminase, reference.dateTransaminase)} />
            {reference.transaminaseAsat && <Field label={getTranslation('asat', language)} value={reference.transaminaseAsat} />}
            {reference.transaminaseAlat && <Field label={getTranslation('alat', language)} value={reference.transaminaseAlat} />}
            {reference.resultatTrans && <Field label={getTranslation('resultatTrans', language)} value={reference.resultatTrans} />}
            {reference.autreAnalyse && (
              <Field label={getTranslation('autreAnalyse', language)} value={withDate(getTranslation('oui', language), reference.dateAutreAnalyse)} />
            )}
          </div>
        </div>

        {/* Traitement TB */}
        <div className="mb-5">
          <SubSection title={getTranslation('traitementTBSection', language)} />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label={getTranslation('sousTraitementTB', language)} value={reference.traitementtb ? getTranslation('oui', language) : getTranslation('non', language)} />
            {reference.traitementtb && reference.protocolesTheraps && reference.protocolesTheraps.length > 0 && (
              reference.protocolesTheraps.map((t, i) => t.therapie && (
                <div key={`tb-${i}`}>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{getTranslation('protocoleTherapeutique', language)}</p>
                  <p className="mt-0.5 text-sm text-gray-900">{t.therapie}</p>
                  {t.dateTherapie && <p className="text-xs text-gray-500">{formatDateOnly(t.dateTherapie)}</p>}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Autre traitement */}
        {reference.autreTraitement && (
          <div>
            <SubSection title={getTranslation('autreTraitement', language)} />
            <Field label={getTranslation('autreTraitement', language)} value={getTranslation('oui', language)} />
          </div>
        )}
      </div>

      {/* Observations */}
      {reference.observations && (
        <div className="bg-white rounded-lg shadow p-5">
          <SectionTitle icon={<MessageSquare className="w-5 h-5" />} title={getTranslation('observations', language)} color="gray" />
          <p className="text-sm text-gray-900 whitespace-pre-wrap">{reference.observations}</p>
        </div>
      )}

      {/* Informations Temporelles */}
      <div className="bg-white rounded-lg shadow p-5">
        <SectionTitle icon={<Calendar className="w-5 h-5" />} title={getTranslation('temporalInformation', language)} color="orange" />
        <div className="grid grid-cols-2 gap-4">
          <Field label={getTranslation('dateCreation', language)} value={formatDate(reference.dateCreation)} />
          <Field label={getTranslation('dateModification', language)} value={formatDate(reference.dateModification)} />
        </div>
      </div>

    </div>
  );
};

export default ReferenceDossierView;
