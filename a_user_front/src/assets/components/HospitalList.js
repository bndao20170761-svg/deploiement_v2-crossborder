// assets/components/HospitalList.js
import React, { useState } from 'react';
import { Search, Building, MapPin, Globe, Edit, Trash2, CheckCircle, XCircle, Eye } from 'lucide-react';
import { getTranslation } from '../utils/translations';

const HospitalList = ({ hospitals, language, onEdit, onDelete, onToggleStatus, onView }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('nom');
  const [sortDirection, setSortDirection] = useState('asc');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedHospital, setExpandedHospital] = useState(null);

  const filteredHospitals = hospitals
    .filter((h) => {
      const searchable = `${h.nom} ${h.ville} ${h.pays}`;
      const normalizedSearch = searchable.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      const normalizedTerm = searchTerm.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

      const matchesSearch = normalizedSearch.includes(normalizedTerm);

      if (statusFilter === 'active') return matchesSearch && h.active;
      if (statusFilter === 'inactive') return matchesSearch && !h.active;
      return matchesSearch;
    })
    .sort((a, b) => {
      const aVal = a[sortField] || '';
      const bVal = b[sortField] || '';

      if (sortDirection === 'asc') {
        return aVal.localeCompare(bVal);
      } else {
        return bVal.localeCompare(aVal);
      }
    });

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {getTranslation('hospitalList', language)} ({filteredHospitals.length})
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
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
              >
                <option value="all">{getTranslation('allStatus', language)}</option>
                <option value="active">{getTranslation('active', language)}</option>
                <option value="inactive">{getTranslation('inactive', language)}</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {getTranslation('hospitalName', language)}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {getTranslation('city', language)}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {getTranslation('country', language)}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {getTranslation('status', language)}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {getTranslation('actions', language)}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredHospitals.length > 0 ? (
                filteredHospitals.map((hospital) => (
                  <React.Fragment key={hospital.id}>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{hospital.nom}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-500">{hospital.ville}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-500">{hospital.pays}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          hospital.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {hospital.active ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {getTranslation('active', language)}
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              {getTranslation('inactive', language)}
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setExpandedHospital(expandedHospital === hospital.id ? null : hospital.id)}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                            title={getTranslation('view', language)}
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => onToggleStatus && onToggleStatus(hospital.id, !hospital.active)}
                            className={`p-1 rounded ${
                              hospital.active
                                ? 'text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50'
                                : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                            }`}
                            title={hospital.active ? getTranslation('deactivate', language) : getTranslation('activate', language)}
                          >
                            {hospital.active ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                          </button>

                          <button
                            onClick={() => onEdit && onEdit(hospital)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title={getTranslation('edit', language)}
                          >
                            <Edit className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => onDelete && onDelete(hospital.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title={getTranslation('delete', language)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Ligne détaillée expansible */}
                    {expandedHospital === hospital.id && (
                      <tr>
                        <td colSpan={5} className="bg-gray-50 p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">
                                {getTranslation('hospitalDetails', language)}
                              </h4>
                              <div className="space-y-1 text-sm">
                                <p><span className="font-medium">{getTranslation('hospitalName', language)}:</span> {hospital.nom}</p>
                                <p><span className="font-medium">{getTranslation('city', language)}:</span> {hospital.ville}</p>
                                <p><span className="font-medium">{getTranslation('country', language)}:</span> {hospital.pays}</p>
                                <p><span className="font-medium">{getTranslation('address', language)}:</span> {hospital.adresse || '-'}</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">
                                {getTranslation('contactInfo', language)}
                              </h4>
                              <div className="space-y-1 text-sm">
                                <p><span className="font-medium">{getTranslation('phone', language)}:</span> {hospital.telephone || '-'}</p>
                                <p><span className="font-medium">{getTranslation('email', language)}:</span> {hospital.email || '-'}</p>
                                <p><span className="font-medium">{getTranslation('website', language)}:</span>
                                  {hospital.website ? (
                                    <a href={hospital.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 ml-1">
                                      {hospital.website}
                                    </a>
                                  ) : '-'}
                                </p>
                                <p><span className="font-medium">{getTranslation('status', language)}:</span>
                                  <span className={`ml-1 ${hospital.active ? 'text-green-600' : 'text-red-600'}`}>
                                    {hospital.active ? getTranslation('active', language) : getTranslation('inactive', language)}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>
                          {onView && (
                            <div className="mt-4 flex justify-end">
                              <button
                                onClick={() => onView(hospital)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                {getTranslation('viewFullDetails', language)}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-500">
                    {getTranslation('noHospitalFound', language)}
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

export default HospitalList;