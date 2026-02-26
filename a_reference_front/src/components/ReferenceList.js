import React, { useState, useEffect } from 'react';
import { Eye, Calendar, User, Stethoscope, Search, Filter } from 'lucide-react';
import ReferenceView from './ReferenceView';
import { getTranslation } from '../utils/translations';

const ReferenceList = ({ references, type, onReload,language,onEdit  }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [expandedReferenceId, setExpandedReferenceId] = useState(null);
  const [localReferences, setLocalReferences] = useState([]);

  // On initial load or when references change
  useEffect(() => {
    // Toujours trier par date décroissante par défaut
    const sorted = [...references].sort((a, b) => new Date(b.date) - new Date(a.date));
    setLocalReferences(sorted);
  }, [references]);

  const toggleExpand = (id) => {
    setExpandedReferenceId(expandedReferenceId === id ? null : id);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const handleSort = (field) => {
    let direction = 'asc';
    if (sortField === field) {
      direction = sortDirection === 'asc' ? 'desc' : 'asc';
    }
    setSortField(field);
    setSortDirection(direction);

    const sorted = [...localReferences].sort((a, b) => {
      if (field === 'date') {
        return direction === 'asc'
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date);
      } else if (field === 'patient') {
        const aVal = a.patientId || '';
        const bVal = b.patientId || '';
        return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      } else if (field === 'doctor') {
        const aVal = type === 'sent' ? a.codeMedecin || '' : a.codeMedecinAuteur || '';
        const bVal = type === 'sent' ? b.codeMedecin || '' : b.codeMedecinAuteur || '';
        return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return 0;
    });

    setLocalReferences(sorted);
  };

  // Filtrage pour la recherche
  const filteredReferences = localReferences.filter((ref) =>
    (ref.patientId?.toString() || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (ref.codeMedecin?.toString() || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (ref.codeMedecinAuteur?.toString() || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderSortIcon = (field) => (sortField === field ? <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span> : null);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Barre de recherche */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {type === "sent"
              ? getTranslation("referencesEnvoyees", language)
              : getTranslation("referencesRecues", language)}{" "}
            <span className="ml-2 text-sm text-gray-500">
              ({filteredReferences.length})
            </span>
          </h2>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder={getTranslation("rechercher", language)}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              />
            </div>
            <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
              <Filter className="h-4 w-4 mr-1" />
              {getTranslation("filtrer", language)}
            </button>
          </div>
        </div>

        {/* Tableau */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th
                  onClick={() => handleSort("date")}
                  className="px-6 py-3 cursor-pointer"
                >
                  <Calendar className="h-4 w-4 inline mr-1" />{" "}
                  {getTranslation("date", language)} {renderSortIcon("date")}
                </th>
                <th
                  onClick={() => handleSort("patient")}
                  className="px-6 py-3 cursor-pointer"
                >
                  <User className="h-4 w-4 inline mr-1" />{" "}
                  {getTranslation("patient", language)}{" "}
                  {renderSortIcon("patient")}
                </th>
                <th
                  onClick={() => handleSort("doctor")}
                  className="px-6 py-3 cursor-pointer"
                >
                  <Stethoscope className="h-4 w-4 inline mr-1" />{" "}
                  {getTranslation("medecin", language)} {renderSortIcon("doctor")}
                </th>
                <th className="px-6 py-3">
                  {getTranslation("type", language)}
                </th>
                <th className="px-6 py-3">
                  {getTranslation("statut", language)}
                </th>
                <th className="px-6 py-3">
                  {getTranslation("details", language)}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReferences.map((ref) => {
                const doctor = type === "sent" ? ref.medecin : ref.medecinAuteur;
                const doctorCode =
                  type === "sent" ? ref.codeMedecin : ref.codeMedecinAuteur;

                return (
                  <React.Fragment key={ref.id}>
                    <tr
                      className={`hover:bg-gray-50 ${
                        type === "sent" && !ref.etat && ref.validation === false
                          ? "bg-yellow-100"
                          : type === "sent" && !ref.etat && ref.validation === true
                          ? "bg-blue-100"
                          : type === "received" && !ref.etat
                          ? "bg-red-100"
                          : ""
                      }`}
                    >
                      <td className="px-6 py-4">{formatDate(ref.date)}</td>
                      <td className="px-6 py-4">{ref.patientId}</td>
                      <td className="px-6 py-4">
                        {doctorCode} {doctor?.nomUtilisateur || ""}
                      </td>
                      <td className="px-6 py-4">{ref.type}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            type === "sent"
                              ? ref.validation
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                              : ref.etat
                              ? "bg-gray-100 text-gray-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {type === "sent"
                            ? ref.validation
                              ? getTranslation("validee", language)
                              : getTranslation("enAttente", language)
                            : ref.etat
                            ? getTranslation("lue", language)
                            : getTranslation("nonLue", language)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => toggleExpand(ref.id)}
                          className="text-green-600 hover:text-green-900 flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          {getTranslation("voir", language)}
                        </button>
                      </td>
                    </tr>

                    {/* Ligne expansible */}
                    <tr>
                      <td colSpan={6} className="p-0">
                        <div
                          className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            expandedReferenceId === ref.id
                              ? "max-h-screen p-4"
                              : "max-h-0 p-0"
                          }`}
                        >
                          {expandedReferenceId === ref.id && (
                            <ReferenceView
                              reference={ref}
                              type={type}
                               language={language}
                              onUpdate={onReload || (() => window.location.reload())}
                              onEdit={onEdit} // 🔹 transmission de la fonction d'édition
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

};

export default ReferenceList;
