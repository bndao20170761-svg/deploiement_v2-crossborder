import React, { useState } from 'react';
import { Search, User, Mail, Edit, Trash2, Filter, Eye, Building } from 'lucide-react';
import { getTranslation } from '../utils/translations';


const MemberList = ({ members, language, onEdit, onDelete, onView }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('nomUtilisateur');
  const [sortDirection, setSortDirection] = useState('asc');
  const [expandedMember, setExpandedMember] = useState(null);

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

  const filteredMembers = members
    .filter((m) => {
      const searchable = `${m.nomUtilisateur} ${m.prenomUtilisateur} ${m.code} ${m.pseudo} ${m.associationPseudo}`;
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
              {getTranslation('memberList', language)}{' '}
              <span className="ml-2 text-sm text-gray-500">({filteredMembers.length})</span>
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
              <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                <Filter className="h-4 w-4 mr-1" />
                {getTranslation('filter', language)}
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th onClick={() => handleSort('nomUtilisateur')} className="cursor-pointer sortable-th">
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>{getTranslation('name', language)}</span>
                  </div>
                </th>
                <th onClick={() => handleSort('code')} className="cursor-pointer sortable-th">
                  {getTranslation('memberCode', language)}
                </th>
                <th onClick={() => handleSort('pseudo')} className="cursor-pointer sortable-th">
                  {getTranslation('pseudo', language)}
                </th>
                <th onClick={() => handleSort('associationPseudo')} className="cursor-pointer sortable-th">
                  <Building className="h-4 w-4 inline mr-1" />
                  {getTranslation('association', language)}
                </th>
                <th className="sortable-th">
                  <Mail className="h-4 w-4 inline mr-1" />
                  {getTranslation('email', language)}
                </th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {getTranslation('actions', language)}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((m) => (
                  <React.Fragment key={m.id}>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">{`${m.nomUtilisateur} ${m.prenomUtilisateur}`}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{m.code || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{m.pseudo || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{m.associationPseudo || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{m.emailUser || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() =>
                              setExpandedMember(expandedMember === m.id ? null : m.id)
                            }
                            className="text-green-600 hover:text-green-900 flex items-center"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            {getTranslation('view', language) || 'Voir'}
                          </button>

                          <button
                            onClick={() => onEdit && onEdit(m)}
                            title={getTranslation('edit', language)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          {onDelete && (
                            <button
                              onClick={() => onDelete(m.id)}
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
                    {expandedMember === m.id && (
                      <tr>
                        <td colSpan={6} className="bg-gray-50 p-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h3 className="font-medium text-gray-900 mb-2">
                                {getTranslation('memberDetails', language)}
                              </h3>
                              <div className="space-y-1 text-sm">
                                <p><span className="font-medium">{getTranslation('name', language)}:</span> {`${m.nomUtilisateur} ${m.prenomUtilisateur}`}</p>
                                <p><span className="font-medium">{getTranslation('memberCode', language)}:</span> {m.code || '-'}</p>
                                <p><span className="font-medium">{getTranslation('pseudo', language)}:</span> {m.pseudo || '-'}</p>
                                <p><span className="font-medium">{getTranslation('email', language)}:</span> {m.emailUser || '-'}</p>
                              </div>
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900 mb-2">
                                {getTranslation('associationDetails', language)}
                              </h3>
                              <div className="space-y-1 text-sm">
                                <p><span className="font-medium">{getTranslation('association', language)}:</span> {m.associationPseudo || '-'}</p>
                                <p><span className="font-medium">{getTranslation('associationCode', language)}:</span> {m.associationCode || '-'}</p>
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
                  <td colSpan={6} className="text-center py-6 text-gray-500">
                    {getTranslation('noMemberFound', language)} <br />
                    (Total: {members.length})
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

export default MemberList;