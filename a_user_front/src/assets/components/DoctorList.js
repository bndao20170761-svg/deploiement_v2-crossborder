import React, { useState } from 'react';
import { Search, User, Phone, Edit, Trash2, Filter, Eye, Mail, Building } from 'lucide-react';
import { getTranslation } from '../utils/translations';

const DoctorList = ({ doctors, language, onEdit, onDelete, onView }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('nomUtilisateur');
  const [sortDirection, setSortDirection] = useState('asc');
  const [expandedDoctor, setExpandedDoctor] = useState(null);

  const normalize = (text) =>
    text ? text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() : '';

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredDoctors = doctors
    .filter((d) => {
      const searchable = `${d.nomUtilisateur} ${d.prenomUtilisateur} ${d.telephone} ${d.email} ${d.lieuExercice}`;
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
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {getTranslation('doctorList', language)} ({filteredDoctors.length})
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

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th onClick={() => handleSort('nomUtilisateur')} className="cursor-pointer">
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>{getTranslation('name', language)}</span>
                  </div>
                </th>
                <th>
                  <Mail className="h-4 w-4 inline mr-1" />
                  {getTranslation('email', language)}
                </th>
                <th>
                  <Building className="h-4 w-4 inline mr-1" />
                  {getTranslation('workplace', language)}
                </th>
                <th>
                  <Phone className="h-4 w-4 inline mr-1" />
                  {getTranslation('phone', language)}
                </th>
                <th>{getTranslation('code', language)}</th>
                <th>{getTranslation('pseudo', language)}</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {getTranslation('actions', language)}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDoctors.length > 0 ? (
                filteredDoctors.map((d) => (
                  <React.Fragment key={d.codeDoctor}>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-medium">{`${d.nomUtilisateur} ${d.prenomUtilisateur}`}</span>
                          <span className="text-sm text-gray-500">{d.nationaliteUtilisateur || '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <a href={`mailto:${d.email}`} className="text-blue-600 hover:text-blue-800">
                          {d.email}
                        </a>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{d.lieuExercice || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <a href={`tel:${d.telephone}`} className="text-green-600 hover:text-green-800">
                          {d.telephone || '-'}
                        </a>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-mono">{d.codeDoctor}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{d.pseudo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() =>
                              setExpandedDoctor(expandedDoctor === d.codeDoctor ? null : d.codeDoctor)
                            }
                            className="text-green-600 hover:text-green-900 flex items-center"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            {getTranslation('view', language)}
                          </button>
                          <button
                            onClick={() => onEdit && onEdit(d)}
                            title={getTranslation('edit', language)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          {onDelete && (
                            <button
                              onClick={() => onDelete(d.codeDoctor)}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                              title={getTranslation('delete', language)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {expandedDoctor === d.codeDoctor && (
                      <tr>
                        <td colSpan={7} className="bg-gray-50 p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">
                                {getTranslation('personalInfo', language)}
                              </h4>
                              <div className="space-y-1 text-sm">
                                <p>
                                  <span className="font-medium">{getTranslation('name', language)}:</span> {d.nomUtilisateur} {d.prenomUtilisateur}
                                </p>
                                <p>
                                  <span className="font-medium">{getTranslation('nationality', language)}:</span> {d.nationaliteUtilisateur || '-'}
                                </p>
                                <p>
                                  <span className="font-medium">{getTranslation('code', language)}:</span> {d.codeDoctor}
                                </p>
                                <p>
                                  <span className="font-medium">{getTranslation('pseudo', language)}:</span> {d.pseudo}
                                </p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">
                                {getTranslation('professionalInfo', language)}
                              </h4>
                              <div className="space-y-1 text-sm">
                                <p><span className="font-medium">{getTranslation('email', language)}:</span> {d.email}</p>
                                <p><span className="font-medium">{getTranslation('workplace', language)}:</span> {d.lieuExercice}</p>
                                <p><span className="font-medium">{getTranslation('phone', language)}:</span> {d.telephone}</p>
                                <p><span className="font-medium">{getTranslation('hospital', language)}:</span> {d.hopitalId ? `ID: ${d.hopitalId}` : '-'}</p>
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
                    {getTranslation('noDoctorFound', language)} <br />
                    (Total: {doctors.length})
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

export default DoctorList;
