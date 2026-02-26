import React, { useState } from 'react';
import { Search, Users, MapPin, Globe, Edit, Trash2, Mail, Phone, Eye } from 'lucide-react';
import { getTranslation } from '../utils/translations';

const AssociationList = ({ associations, language, onEdit, onDelete, onView }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('pseudo');
  const [sortDirection, setSortDirection] = useState('asc');
  const [expandedAssociation, setExpandedAssociation] = useState(null);

  const normalize = (text) =>
    text
      ? text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
      : '';

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAssociations = associations
    .filter((a) => {
      const searchable = `${a.pseudo} ${a.email} ${a.ville} ${a.pays} ${a.quartier}`;
      return normalize(searchable).includes(normalize(searchTerm));
    })
    .sort((a, b) => {
      const aVal = a?.[sortField] || '';
      const bVal = b?.[sortField] || '';
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {getTranslation('associationList', language)}{' '}
              <span className="ml-2 text-sm text-gray-500">({filteredAssociations.length})</span>
            </h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder={`${getTranslation('search', language)}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th onClick={() => handleSort('pseudo')} className="cursor-pointer sortable-th">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{getTranslation('pseudo', language)}</span>
                  </div>
                </th>
                <th className="sortable-th">
                  <Mail className="h-4 w-4 inline mr-1" />
                  {getTranslation('email', language)}
                </th>
                <th className="sortable-th">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  {getTranslation('city', language)}
                </th>
                <th className="sortable-th">
                  <Globe className="h-4 w-4 inline mr-1" />
                  {getTranslation('country', language)}
                </th>
                <th className="sortable-th">
                  <Phone className="h-4 w-4 inline mr-1" />
                  {getTranslation('phone', language)}
                </th>
                <th className="sortable-th">{getTranslation('code', language)}</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {getTranslation('actions', language)}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAssociations.length > 0 ? (
                filteredAssociations.map((a) => (
                  <React.Fragment key={a.codeAssociation}>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-medium">{a.pseudo}</span>
                          {a.quartier && (
                            <span className="text-sm text-gray-500">{a.quartier}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <a href={`mailto:${a.email}`} className="text-blue-600 hover:text-blue-800">
                          {a.email || '-'}
                        </a>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{a.ville || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{a.pays || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <a href={`tel:${a.telephone}`} className="text-green-600 hover:text-green-800">
                          {a.telephone || '-'}
                        </a>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-mono">{a.codeAssociation}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() =>
                              setExpandedAssociation(expandedAssociation === a.codeAssociation ? null : a.codeAssociation)
                            }
                            className="text-green-600 hover:text-green-900 flex items-center"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            {getTranslation('view', language) || 'Voir'}
                          </button>

                          <button
                            onClick={() => onEdit && onEdit(a)}
                            title={getTranslation('edit', language)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          {onDelete && (
                            <button
                              onClick={() => onDelete(a.codeAssociation)}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                              title={getTranslation('delete', language)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Ligne détaillée expansible */}
                    {expandedAssociation === a.codeAssociation && (
                      <tr>
                        <td colSpan={7} className="bg-gray-50 p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">
                                {getTranslation('associationInfo', language)}
                              </h4>
                              <div className="space-y-1 text-sm">
                                <p><span className="font-medium">{getTranslation('pseudo', language)}:</span> {a.pseudo}</p>
                                <p><span className="font-medium">{getTranslation('code', language)}:</span> {a.codeAssociation}</p>
                                <p><span className="font-medium">{getTranslation('email', language)}:</span> {a.email || '-'}</p>
                                <p><span className="font-medium">{getTranslation('phone', language)}:</span> {a.telephone || '-'}</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">
                                {getTranslation('locationInfo', language)}
                              </h4>
                              <div className="space-y-1 text-sm">
                                <p><span className="font-medium">{getTranslation('country', language)}:</span> {a.pays}</p>
                                <p><span className="font-medium">{getTranslation('city', language)}:</span> {a.ville}</p>
                                <p><span className="font-medium">{getTranslation('district', language)}:</span> {a.quartier || '-'}</p>
                                <p><span className="font-medium">ID Utilisateur:</span> {a.utilisateurId || '-'}</p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-gray-500">
                    {getTranslation('noAssociationFound', language)} <br />
                    (Total: {associations.length})
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AssociationList;