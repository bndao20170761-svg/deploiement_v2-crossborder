import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Trash2, CheckCircle, Clock, AlertCircle, User, FileText, Hospital, Calendar, MessageSquare } from 'lucide-react';
import referenceDossierService from '../services/referenceDossierService';
import { getTranslation } from '../utils/translations';

const ReferenceDossierView = ({ codeReference, language = "fr", onBack, onEdit, onViewDossier }) => {
  const [reference, setReference] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedDossier, setExpandedDossier] = useState(null);
  const [loadingDossier, setLoadingDossier] = useState(false);

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
    } catch (err) {
      console.error('Erreur lors du chargement de la référence:', err);
      setError('Impossible de charger les détails de la référence');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadDossier = async (codeDossier) => {
    try {
      setLoadingDossier(true);
      // Extraire le codePatient du codeDossier
      const codePatient = codeDossier ? codeDossier.split('-')[0] : codeDossier;
      console.log('🔍 handleLoadDossier: codeDossier:', codeDossier, '→ codePatient:', codePatient);
      
      // Importer dynamiquement le service patient
      const patientService = (await import('../services/patientService'));
      
      // Charger le dossier
      const dossierData = await patientService.getPatientWithDossier(codePatient);
      console.log('✅ Dossier chargé:', dossierData);
      
      setExpandedDossier(dossierData);
    } catch (err) {
      console.error('❌ Erreur lors du chargement du dossier:', err);
      // Afficher une erreur à l'utilisateur
      alert('Erreur lors du chargement du dossier: ' + (err.message || 'Erreur inconnue'));
    } finally {
      setLoadingDossier(false);
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
        await referenceDossierService.accepterReference(codeReference, 'DOC_CURRENT', 'Médecin actuel');
        fetchReference(); // Recharger les données
      } catch (err) {
        console.error('Erreur lors de l\'acceptation:', err);
        alert('Erreur lors de l\'acceptation de la référence');
      }
    }
  };

  const getStatusIcon = (statut) => {
    switch (statut) {
      case 'RECUE':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'ENVOYEE':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'EN_ATTENTE':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadgeClass = (statut) => {
    switch (statut) {
      case 'RECUE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ENVOYEE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'EN_ATTENTE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
        <button
          onClick={fetchReference}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          🔄 Réessayer
        </button>
      </div>
    );
  }

  if (!reference) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-700">⚠️ Référence non trouvée</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
        >
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
          <h1 className="text-3xl font-bold text-gray-900">
            📋 Détails de la Référence
          </h1>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {getTranslation("retour", language) || "Retour"}
          </button>
        </div>

        {/* Statut */}
        <div className="flex items-center gap-4 mb-6">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadgeClass(reference.statut)}`}>
            {getStatusIcon(reference.statut)}
            <span className="ml-2">
              {reference.statut === 'RECUE' ? 'Reçue' : 
               reference.statut === 'ENVOYEE' ? 'Envoyée' : 
               reference.statut === 'EN_ATTENTE' ? 'En attente' : reference.statut}
            </span>
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => onEdit && onEdit(reference)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </button>
          {reference.statut === 'EN_ATTENTE' && (
            <button
              onClick={handleAccept}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Accepter
            </button>
          )}
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer
          </button>
        </div>
      </div>

      {/* Informations principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Informations de la référence */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            Informations de la Référence
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Code Référence</label>
              <p className="mt-1 text-sm text-gray-900 font-semibold">{reference.codeReference}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Date de Référence</label>
              <p className="mt-1 text-sm text-gray-900">{formatDate(reference.dateReference)}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Type de Référence</label>
              <p className="mt-1 text-sm text-gray-900">{reference.typeReference || '-'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Motif</label>
              <p className="mt-1 text-sm text-gray-900">{reference.motifReference || '-'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Date de Prise en Charge</label>
              <p className="mt-1 text-sm text-gray-900">{formatDate(reference.datePriseEnCharge)}</p>
            </div>
          </div>
        </div>

        {/* Informations du patient */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-green-600" />
            Informations du Patient
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Code Patient:</strong>
              <p className="text-gray-900 font-semibold">{reference.codePatient || '-'}</p>
            </div>
            <div>
              <strong>Nom:</strong>
              <p className="text-gray-900">{reference.nomPatient || reference.nomUtilisateur || '-'}</p>
            </div>
            <div>
              <strong>Prénom:</strong>
              <p className="text-gray-900">{reference.prenomPatient || reference.prenomUtilisateur || '-'}</p>
            </div>
            <div>
              <strong>Date de Naissance:</strong>
              <p className="text-gray-900">{reference.dateNaissance ? formatDate(reference.dateNaissance) : '-'}</p>
            </div>
            <div>
              <strong>Âge:</strong>
              <p className="text-gray-900">{reference.age ? `${reference.age} ans` : '-'}</p>
            </div>
            <div>
              <strong>Sexe:</strong>
              <p className="text-gray-900">{reference.sexe || '-'}</p>
            </div>
            <div>
              <strong>Profession:</strong>
              <p className="text-gray-900">{reference.profession || '-'}</p>
            </div>
            <div>
              <strong>Téléphone:</strong>
              <p className="text-gray-900">{reference.telephone || '-'}</p>
            </div>
            <div>
              <strong>Nationalité:</strong>
              <p className="text-gray-900">{reference.nationaliteUtilisateur || reference.nationalite || '-'}</p>
            </div>
            <div>
              <strong>Code Dossier:</strong>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-gray-900 font-semibold">{reference.codeDossier || '-'}</p>
                {reference.codeDossier && (
                  <button
                    onClick={() => handleLoadDossier(reference.codeDossier)}
                    disabled={loadingDossier}
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Charger le dossier"
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    {loadingDossier ? 'Chargement...' : (expandedDossier ? 'Replier' : 'Charger')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Informations de destination */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Hôpital */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Hospital className="w-5 h-5 mr-2 text-purple-600" />
            Hôpital de Destination
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Code Hôpital</label>
              <p className="mt-1 text-sm text-gray-900 font-semibold">{reference.codeHopital || '-'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom Hôpital</label>
              <p className="mt-1 text-sm text-gray-900">{reference.nomHopital || '-'}</p>
            </div>
          </div>
        </div>

        {/* Médecin */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-orange-600" />
            Médecin Destinataire
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Code Médecin</label>
              <p className="mt-1 text-sm text-gray-900 font-semibold">{reference.codeDocteur || '-'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom Médecin</label>
              <p className="mt-1 text-sm text-gray-900">{reference.nomDocteur || '-'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Informations du référenceur */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <MessageSquare className="w-5 h-5 mr-2 text-indigo-600" />
          Informations du Référenceur
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Code Référenceur</label>
            <p className="mt-1 text-sm text-gray-900 font-semibold">{reference.codeReferenceur || '-'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Nom Référenceur</label>
            <p className="mt-1 text-sm text-gray-900">{reference.nomReferenceur || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Hôpital d'origine</label>
            <p className="mt-1 text-sm text-gray-900">{reference.nomHopitalReferenceur || reference.codeHopitalReferenceur || '-'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Téléphone</label>
            <p className="mt-1 text-sm text-gray-900">{reference.telephoneReferenceur || '-'}</p>
          </div>
          
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-sm text-gray-900">{reference.emailReferenceur || '-'}</p>
          </div>
        </div>
      </div>

      {/* Observations */}
      {reference.observations && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-gray-600" />
            Observations
          </h2>
          <p className="text-sm text-gray-900 whitespace-pre-wrap">{reference.observations}</p>
        </div>
      )}

      {/* Informations Temporelles */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-orange-600" />
          Informations Temporelles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <strong>Date de Création:</strong>
            <p className="text-gray-900">{formatDate(reference.dateCreation)}</p>
          </div>
          <div>
            <strong>Dernière Modification:</strong>
            <p className="text-gray-900">{formatDate(reference.dateModification)}</p>
          </div>
        </div>
      </div>

      {/* Dossier Médical Expanded */}
      {expandedDossier && (
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Dossier Médical Complet
            </h2>
            <button
              onClick={() => setExpandedDossier(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          {/* Informations du patient depuis le dossier */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Informations du Patient</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <strong>Code Patient:</strong>
                <p className="text-gray-900">{expandedDossier.codePatient || '-'}</p>
              </div>
              <div>
                <strong>Nom Complet:</strong>
                <p className="text-gray-900">{expandedDossier.nomComplet || '-'}</p>
              </div>
              <div>
                <strong>Code Dossier:</strong>
                <p className="text-gray-900 font-semibold">{expandedDossier.codeDossier || '-'}</p>
              </div>
            </div>
          </div>

          {/* Pages du dossier */}
          {expandedDossier.pages && expandedDossier.pages.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Pages du Dossier</h3>
              {expandedDossier.pages.map((page, index) => (
                <div key={page.id || index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Informations de base */}
                    <div>
                      <strong>Date de Test:</strong>
                      <p className="text-gray-900">{page.dateTest || '-'}</p>
                    </div>
                    <div>
                      <strong>Date de Confirmation:</strong>
                      <p className="text-gray-900">{page.dateConfirmation || '-'}</p>
                    </div>
                    <div>
                      <strong>Lieu de Test:</strong>
                      <p className="text-gray-900">{page.lieuTest || '-'}</p>
                    </div>
                    <div>
                      <strong>Résultat:</strong>
                      <p className={`font-semibold ${page.resultat === 'vih1' || page.resultat === 'vih2' ? 'text-red-600' : 'text-green-600'}`}>
                        {page.resultat || '-'}
                      </p>
                    </div>
                    <div>
                      <strong>Date Début ARV:</strong>
                      <p className="text-gray-900">{page.dateDebutArv || '-'}</p>
                    </div>
                    <div>
                      <strong>Protocole ARV:</strong>
                      <p className="text-gray-900">{page.protocoleInitialArv || '-'}</p>
                    </div>
                  </div>

                  {/* Bilans si disponibles */}
                  {page.bilans && page.bilans.length > 0 && (
                    <div className="mt-4 p-3 bg-white rounded border">
                      <h4 className="font-semibold text-sm mb-2">Bilans Biologiques</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div><strong>Hb:</strong> {page.bilans[0].hb || '-'}</div>
                        <div><strong>VGM:</strong> {page.bilans[0].vgm || '-'}</div>
                        <div><strong>GB:</strong> {page.bilans[0].gb || '-'}</div>
                        <div><strong>Plaquettes:</strong> {page.bilans[0].plaquettes || '-'}</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReferenceDossierView;
