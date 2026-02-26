import React, { useState, useEffect } from 'react';
import { getTranslation } from '../utils/translations';
import { getAllAssociations } from '../services/associationService';
import { memberService } from '../services/memberService';

const MemberForm = ({ initialData, onSave, language, onCancel }) => {
  const [membre, setMembre] = useState({
    id: '',
    code: '',
    pseudo: '',
    associationCode: '',
    nomUtilisateur: '',
    prenomUtilisateur: '',
    emailUser: '',
    password: ''   // Champ mot de passe
  });

  const [associations, setAssociations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  // Charger les associations
  useEffect(() => {
    const fetchAssociations = async () => {
      try {
        setLoading(true);
        const data = await getAllAssociations();
        setAssociations(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erreur lors du chargement des associations:", error);
        setMessage("❌ " + getTranslation("errorLoadingAssociations", language));
      } finally {
        setLoading(false);
      }
    };

    fetchAssociations();
  }, [language]);

  // Initialiser données
  useEffect(() => {
    if (initialData) {
      setMembre({
        id: initialData.id || '',
        code: initialData.code || '',
        pseudo: initialData.pseudo || '',
        associationCode: initialData.associationCode || '',
        nomUtilisateur: initialData.nomUtilisateur || '',
        prenomUtilisateur: initialData.prenomUtilisateur || '',
        emailUser: initialData.emailUser || '',
        password: '' // Ne jamais pré-remplir
      });
    } else {
      setMembre({
        id: '',
        code: '',
        pseudo: '',
        associationCode: '',
        nomUtilisateur: '',
        prenomUtilisateur: '',
        emailUser: '',
        password: ''
      });
    }
    setMessage('');
    setErrors({});
  }, [initialData]);

  const validateForm = () => {
    const newErrors = {};

    if (!membre.associationCode) {
      newErrors.associationCode = getTranslation("selectAssociation", language);
    }
    if (!membre.code) {
      newErrors.code = getTranslation("codeRequired", language);
    }
    if (!membre.pseudo) {
      newErrors.pseudo = getTranslation("pseudoRequired", language);
    }
    if (!membre.nomUtilisateur) {
      newErrors.nomUtilisateur = getTranslation("lastNameRequired", language);
    }
    if (!membre.prenomUtilisateur) {
      newErrors.prenomUtilisateur = getTranslation("firstNameRequired", language);
    }
    if (!membre.emailUser) {
      newErrors.emailUser = getTranslation("emailRequired", language);
    } else if (!/\S+@\S+\.\S+/.test(membre.emailUser)) {
      newErrors.emailUser = getTranslation("invalidEmail", language);
    }

    // Vérification du mot de passe uniquement si création
    if (!membre.id && !membre.password) {
      newErrors.password = getTranslation("passwordRequired", language);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMembre((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (message) setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setMessage("❌ " + getTranslation("pleaseCorrectErrors", language));
      return;
    }

    try {
      setSaving(true);
      setMessage('');

      const payload = {
        code: membre.code,
        pseudo: membre.pseudo,
        associationCode: membre.associationCode,
        nomUtilisateur: membre.nomUtilisateur,
        prenomUtilisateur: membre.prenomUtilisateur,
        emailUser: membre.emailUser
      };

      if (membre.password) {
        payload.password = membre.password;
      }

      let result;
      if (membre.id) {
        result = await memberService.updateMember(membre.id, payload);
        setMessage('✅ ' + getTranslation("memberUpdatedSuccess", language));
      } else {
        result = await memberService.createMember(payload);
        setMessage('✅ ' + getTranslation("memberCreatedSuccess", language));
      }

      if (onSave) {
        await onSave(result, membre.id);
      }

      if (!membre.id) {
        setMembre({
          id: '',
          code: '',
          pseudo: '',
          associationCode: '',
          nomUtilisateur: '',
          prenomUtilisateur: '',
          emailUser: '',
          password: ''
        });
      }

    } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error);
      let errorMessage = getTranslation("errorSavingMember", language);
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      setMessage("❌ " + errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {membre.id
          ? getTranslation("modifierMembre", language)
          : getTranslation("enregistrerMembre", language)}
      </h2>

      {message && (
        <div className={`mb-4 p-3 rounded ${
          message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Association */}
        <div>
          <label className="block mb-2 font-medium text-gray-700">
            {getTranslation("association", language)} *
          </label>
          {loading ? (
            <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 animate-pulse">
              {getTranslation("loadingAssociations", language)}
            </div>
          ) : associations.length === 0 ? (
            <div className="w-full p-3 border border-gray-300 rounded-lg bg-yellow-50 text-yellow-700">
              {getTranslation("noAssociationsAvailable", language)}
            </div>
          ) : (
            <>
              <select
                name="associationCode"
                value={membre.associationCode}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.associationCode ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              >
                <option value="">{getTranslation("chooseAssociation", language)}</option>
                {associations.map((association) => (
                  <option key={association.codeAssociation} value={association.codeAssociation}>
                    {association.pseudo} - {association.ville}
                  </option>
                ))}
              </select>
              {errors.associationCode && (
                <p className="mt-1 text-sm text-red-600">{errors.associationCode}</p>
              )}
            </>
          )}
        </div>

        {/* Code et Pseudo affichés uniquement en modification */}
        {membre.id && (
          <>
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                {getTranslation("code", language)}
              </label>
              <input
                type="text"
                name="code"
                value={membre.code}
                disabled
                className="w-full p-3 border rounded-lg bg-gray-100 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                {getTranslation("pseudo", language)}
              </label>
              <input
                type="text"
                name="pseudo"
                value={membre.pseudo}
                disabled
                className="w-full p-3 border rounded-lg bg-gray-100 cursor-not-allowed"
              />
            </div>
          </>
        )}

        {/* Infos utilisateur */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              {getTranslation("lastName", language)} *
            </label>
            <input
              type="text"
              name="nomUtilisateur"
              value={membre.nomUtilisateur}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.nomUtilisateur ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Dupont"
              required
            />
            {errors.nomUtilisateur && (
              <p className="mt-1 text-sm text-red-600">{errors.nomUtilisateur}</p>
            )}
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-700">
              {getTranslation("firstName", language)} *
            </label>
            <input
              type="text"
              name="prenomUtilisateur"
              value={membre.prenomUtilisateur}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.prenomUtilisateur ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Jean"
              required
            />
            {errors.prenomUtilisateur && (
              <p className="mt-1 text-sm text-red-600">{errors.prenomUtilisateur}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block mb-2 font-medium text-gray-700">
              {getTranslation("email", language)} *
            </label>
            <input
              type="email"
              name="emailUser"
              value={membre.emailUser}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.emailUser ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="utilisateur@example.com"
              required
            />
            {errors.emailUser && (
              <p className="mt-1 text-sm text-red-600">{errors.emailUser}</p>
            )}
          </div>

          {/* Mot de passe */}
          <div className="md:col-span-2">
            <label className="block mb-2 font-medium text-gray-700">
              {getTranslation("password", language)} { !membre.id && "*" }
            </label>
            <input
              type="password"
              name="password"
              value={membre.password}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={
                membre.id
                  ? getTranslation("newPasswordOptional", language)
                  : getTranslation("enterPassword", language)
              }
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>
        </div>

        {/* Boutons */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
            disabled={saving}
          >
            {getTranslation("cancel", language)}
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={saving || loading || associations.length === 0}
          >
            {saving
              ? getTranslation("saving", language)
              : membre.id
                ? getTranslation("update", language)
                : getTranslation("save", language)}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MemberForm;
