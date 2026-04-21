import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Eye, Edit, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import referenceDossierService from '../services/referenceDossierService';
import { getTranslation } from '../utils/translations';

const ReferenceDossierList = ({ language = "fr", filterStatus = "all", onReferenceSelect, onEditReference, onViewReference }) => {
  const [references, setReferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchReferences();
  }, [filterStatus]);

  const fetchReferences = async () => {
    try {
      setLoading(true);
      let data;
      
      console.log('fetchReferences appelé avec filterStatus:', filterStatus);
      
      switch (filterStatus) {
        case 'recues':
          data = await referenceDossierService.getReferencesRecues();
          console.log('Données reçues pour recues:', data);
          break;
        case 'envoyees':
          data = await referenceDossierService.getReferencesEnvoyees();
          console.log('Données reçues pour envoyees:', data);
          break;
        case 'en-attente':
          data = await referenceDossierService.getReferencesEnAttente();
          console.log('Données reçues pour en-attente:', data);
          break;
        default:
          data = await referenceDossierService.getAllReferences();
          console.log('Données reçues pour all:', data);
      }
      
      setReferences(data || []);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des références:', err);
      console.error('Détails de l\'erreur:', err.response?.data || err.message);
      setError(`Impossible de charger les références de dossiers: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (codeReference) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette référence ?')) {
      try {
        await referenceDossierService.deleteReference(codeReference);
        setReferences(references.filter(ref => ref.codeReference !== codeReference));
      } catch (err) {
        console.error('Erreur lors de la suppression:', err);
        alert('Erreur lors de la suppression de la référence');
      }
    }
  };

  const handleAccept = async (codeReference) => {
    if (window.confirm('Êtes-vous sûr de vouloir accepter cette référence ?')) {
      try {
        await referenceDossierService.accepterReference(codeReference, 'DOC_CURRENT', 'Médecin actuel');
        fetchReferences(); // Recharger la liste
      } catch (err) {
        console.error('Erreur lors de l\'acceptation:', err);
        alert('Erreur lors de l\'acceptation de la référence');
      }
    }
  };

  const filteredReferences = references.filter(reference => {
    const matchesSearch = 
      reference.codeReference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reference.nomPatient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reference.prenomPatient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reference.nomHopital?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reference.codeDossier?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReferences.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredReferences.length / itemsPerPage);

  const getStatusIcon = (statut) => {
    switch (statut) {
      case 'RECUE':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'ENVOYEE':
        return <Eye className="w-4 h-4 text-blue-600" />;
      case 'EN_ATTENTE':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
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
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">⏳ Chargement des références...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">❌ {error}</p>
        <button
          onClick={fetchReferences}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          🔄 Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* En-tête */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">
            {getTranslation("referencesDossiers", language) || "Références de Dossiers"}
          </h1>
          <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            Filtre: {filterStatus} | {references.length} résultat(s)
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={getTranslation("rechercherReference", language) || "Rechercher une référence..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <select
              value={filterStatus}
              disabled
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
            >
              <option value="recues">Dossiers Reçus</option>
              <option value="envoyees">Dossiers Envoyés</option>
            </select>
          </div>

          <button
            onClick={() => onReferenceSelect && onReferenceSelect()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {getTranslation("nouvelleReference", language) || "Nouvelle Référence"}
          </button>
        </div>
      </div>

      {/* Tableau des références */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dossier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hôpital
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Médecin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <div className="text-6xl mb-4">{
                        searchTerm ? 'Search' : 
                        filterStatus === 'recues' ? 'Inbox' : 
                        filterStatus === 'envoyees' ? 'Send' : 
                        filterStatus === 'en-attente' ? 'Clock' : 'FileText'
                      }</div>
                      <div className="text-lg font-medium mb-2">
                        {searchTerm 
                          ? "Aucune référence trouvée pour cette recherche" 
                          : filterStatus === 'recues' 
                            ? "Aucun dossier reçu"
                            : filterStatus === 'envoyees'
                            ? "Aucun dossier envoyé"
                            : filterStatus === 'en-attente'
                            ? "Aucun dossier en attente"
                            : "Aucune référence trouvée"
                        }
                      </div>
                      <div className="text-sm text-gray-400">
                        {searchTerm 
                          ? "Essayez avec d'autres termes de recherche"
                          : "Créez votre première référence de dossier"
                        }
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                currentItems.map((reference) => (
                  <tr key={reference.codeReference} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {reference.codeReference}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {reference.nomPatient} {reference.prenomPatient}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {reference.codeDossier}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {reference.nomHopital}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {reference.nomDocteur || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(reference.dateReference)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(reference.statut)}`}>
                        {getStatusIcon(reference.statut)}
                        <span className="ml-1">
                          {reference.statut === 'RECUE' ? 'Reçue' : 
                           reference.statut === 'ENVOYEE' ? 'Envoyée' : 
                           reference.statut === 'EN_ATTENTE' ? 'En attente' : reference.statut}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onViewReference && onViewReference(reference)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Voir"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditReference && onEditReference(reference)}
                          className="text-green-600 hover:text-green-900"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {reference.statut === 'EN_ATTENTE' && (
                          <button
                            onClick={() => handleAccept(reference.codeReference)}
                            className="text-green-600 hover:text-green-900"
                            title="Accepter"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(reference.codeReference)}
                          className="text-red-600 hover:text-red-900"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Précédent
            </button>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Affichage de <span className="font-medium">{indexOfFirstItem + 1}</span> à{' '}
                <span className="font-medium">{Math.min(indexOfLastItem, filteredReferences.length)}</span> sur{' '}
                <span className="font-medium">{filteredReferences.length}</span> résultats
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Précédent
                </button>
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  Page {currentPage} sur {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Suivant
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferenceDossierList;
