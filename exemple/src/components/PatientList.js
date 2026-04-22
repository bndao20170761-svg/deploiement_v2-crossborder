import React, { useState } from 'react';
import { Search, User, Phone, Edit, Trash2, Filter, Eye } from 'lucide-react';
import { getTranslation } from '../utils/translations';
import { normalizePatientList } from '../utils/patientUtils';
import PatientView from './PatientView';
const PatientList = ({ patients, language, onEdit, onDelete,onView, onViewDossier   }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('nomUtilisateur');
  const [sortDirection, setSortDirection] = useState('asc');
  const [expandedPatient, setExpandedPatient] = useState(null);
  
  // Debug logs
  console.log("🔍 PatientList: Props reçues:", { patients, patientsCount: patients?.length });
  
  // Normaliser les données des patients
  const normalizedPatients = normalizePatientList(patients);
  console.log("🔍 PatientList: Patients normalisés:", { normalizedPatients, count: normalizedPatients?.length });




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

  const calculateAge = (birthdate) => {
    if (!birthdate) return '-';
    try {
      const birth = new Date(birthdate);
      const today = new Date();
      if (isNaN(birth.getTime())) return '-';
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      const dayDiff = today.getDate() - birth.getDate();
      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
      }
      return age;
    } catch {
      return '-';
    }
  };

  const filteredPatients = normalizedPatients
    .filter((p) => {
      const searchable = `${p.nomUtilisateur || ''} ${p.prenomUtilisateur || ''} ${p.telephone}`;
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
      if (sortField === 'dateNaissance') {
        const dateA = new Date(aVal);
        const dateB = new Date(bVal);
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {getTranslation('patientList', language)}{' '}
              <span className="ml-2 text-sm text-gray-500">({filteredPatients.length})</span>
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
                <th onClick={() => handleSort('dateNaissance')} className="cursor-pointer sortable-th">
                  {getTranslation('dateNaissance', language)}
                </th>
                <th className="sortable-th">
                  <Phone className="h-4 w-4 inline mr-1" />
                  {getTranslation('phone', language)}
                </th>
                <th className="sortable-th">{getTranslation('profession', language)}</th>
                <th className="sortable-th">{getTranslation('gender', language)}</th>
                <th className="sortable-th">{getTranslation('age', language)}</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {getTranslation('actions', language)}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((p) => (
                  <React.Fragment key={p.codePatient}>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">{`${p.nomUtilisateur || '-'} ${p.prenomUtilisateur || '-'}`}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{p.dateNaissance ? p.dateNaissance.split('T')[0] : '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{p.telephone || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{p.profession || '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        {p.sexe === 'F' ? (
                          <span className="text-pink-600 bg-pink-100 px-2 py-1 rounded-full text-xs">
                            {getTranslation('female', language)}
                          </span>
                        ) : p.sexe === 'M' ? (
                          <span className="text-blue-600 bg-blue-100 px-2 py-1 rounded-full text-xs">
                            {getTranslation('male', language)}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{calculateAge(p.dateNaissance)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end space-x-2">
                       <button
                                              onClick={() => onView(p)}
                                              className="text-green-600 hover:text-green-900 flex items-center"
                                            >
                                              <Eye className="h-4 w-4 mr-1" />
                                              {getTranslation('view', language) || 'Voir'}
                                            </button>

                          <button
                            onClick={() => onEdit && onEdit(p)}
                            title={getTranslation('edit', language)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          {onDelete && (
                            <button
                              onClick={() => onDelete(p.codePatient)}
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
                    {/* Ligne détaillée expansible */}


                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-gray-500">
                    {getTranslation('noPatientFound', language)} <br />
                    (Total: {normalizedPatients.length})
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

export default PatientList;
