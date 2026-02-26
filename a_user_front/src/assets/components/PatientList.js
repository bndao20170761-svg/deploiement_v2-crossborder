import React, { useState } from 'react';
import { Search, User, Phone, Edit, Trash2, Filter, Eye, Mail, MapPin, Calendar } from 'lucide-react';
import { getTranslation } from '../utils/translations';

const PatientList = ({ patients, language, onEdit, onDelete, onView }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('nomUtilisateur');
  const [sortDirection, setSortDirection] = useState('asc');
  const [expandedPatient, setExpandedPatient] = useState(null);

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

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleDateString();
    } catch {
      return '-';
    }
  };

  const filteredPatients = patients
    .filter((p) => {
      const searchable = `${p.nomUtilisateur} ${p.prenomUtilisateur} ${p.telephone} ${p.profession} ${p.adressePermanent} ${p.adresseTemporaire}`;
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
                  <Calendar className="h-4 w-4 inline mr-1" />
                  {getTranslation('birthdate', language)}
                </th>
                <th onClick={() => handleSort('profession')} className="cursor-pointer sortable-th">
                  {getTranslation('profession', language)}
                </th>
                <th className="sortable-th">
                  <Phone className="h-4 w-4 inline mr-1" />
                  {getTranslation('phone', language)}
                </th>
                <th className="sortable-th">{getTranslation('gender', language)}</th>
                <th className="sortable-th">{getTranslation('age', language)}</th>
                <th className="sortable-th">{getTranslation('code', language)}</th>
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-medium">{`${p.nomUtilisateur} ${p.prenomUtilisateur}`}</span>
                          <span className="text-sm text-gray-500">{p.nationaliteUtilisateur || '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(p.dateNaissance)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{p.profession || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {p.telephone ? (
                          <a href={`tel:${p.telephone}`} className="text-green-600 hover:text-green-800">
                            {p.telephone}
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
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
                      <td className="px-6 py-4 text-sm text-gray-500 font-mono">{p.codePatient}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() =>
                              setExpandedPatient(expandedPatient === p.codePatient ? null : p.codePatient)
                            }
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
                    {expandedPatient === p.codePatient && (
                      <tr>
                        <td colSpan={8} className="bg-gray-50 p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">
                                {getTranslation('personalInfo', language)}
                              </h4>
                              <div className="space-y-1 text-sm">
                                <p><span className="font-medium">{getTranslation('name', language)}:</span> {p.nomUtilisateur} {p.prenomUtilisateur}</p>
                                <p><span className="font-medium">{getTranslation('nationality', language)}:</span> {p.nationaliteUtilisateur || '-'}</p>
                                <p><span className="font-medium">{getTranslation('birthdate', language)}:</span> {formatDate(p.dateNaissance)}</p>
                                <p><span className="font-medium">{getTranslation('age', language)}:</span> {calculateAge(p.dateNaissance)}</p>
                                <p><span className="font-medium">{getTranslation('maritalStatus', language)}:</span> {p.statutMatrimoniale || '-'}</p>
                                <p><span className="font-medium">{getTranslation('gender', language)}:</span>
                                  {p.sexe === 'F' ? getTranslation('female', language) :
                                   p.sexe === 'M' ? getTranslation('male', language) : '-'}
                                </p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">
                                {getTranslation('contactInfo', language)}
                              </h4>
                              <div className="space-y-1 text-sm">
                                <p><span className="font-medium">{getTranslation('profession', language)}:</span> {p.profession || '-'}</p>
                                <p><span className="font-medium">{getTranslation('phone', language)}:</span> {p.telephone || '-'}</p>
                                <p><span className="font-medium">{getTranslation('permanentAddress', language)}:</span> {p.adressePermanent || '-'}</p>
                                <p><span className="font-medium">{getTranslation('temporaryAddress', language)}:</span> {p.adresseTemporaire || '-'}</p>
                                <p><span className="font-medium">{getTranslation('patientCode', language)}:</span> {p.codePatient}</p>
                                <p><span className="font-medium">{getTranslation('pseudo', language)}:</span> {p.pseudo || '-'}</p>
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
                  <td colSpan={8} className="text-center py-6 text-gray-500">
                    {getTranslation('noPatientFound', language)} <br />
                    (Total: {patients.length})
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