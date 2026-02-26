import React, { useState, useEffect } from 'react';
import { getTranslation } from '../utils/translations';

const AssociationForm = ({ initialData, onSave, language, onCancel }) => {
  const [association, setAssociation] = useState({
    codeAssociation: '',
    email: '',
    pays: '',
    pseudo: '',
    quartier: '',
    telephone: '',
    ville: '',
    emailUser: '' // Champ pour rechercher l'utilisateur par email
  });

  const [message, setMessage] = useState('');

  useEffect(() => {
    if (initialData) {
      setAssociation({
        codeAssociation: initialData.codeAssociation || '',
        email: initialData.email || '',
        pays: initialData.pays || '',
        pseudo: initialData.pseudo || '',
        quartier: initialData.quartier || '',
        telephone: initialData.telephone || '',
        ville: initialData.ville || '',
        emailUser: initialData.email || '' // Par défaut, utiliser l'email de l'association
      });
    }
    setMessage('');
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAssociation((prev) => ({ ...prev, [name]: value }));
    if (message) setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validation des champs obligatoires
      if (!association.codeAssociation || !association.emailUser || !association.pays || !association.ville) {
        setMessage("❌ Veuillez remplir tous les champs obligatoires.");
        return;
      }

      const payload = {
        ...association,
        email: association.emailUser // Utiliser l'emailUser comme email de l'association
      };

      if (onSave) {
        await onSave(payload);
        setMessage('✅ Association enregistrée avec succès !');
      }
    } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error);
      setMessage("❌ Erreur lors de l'enregistrement de l'association.");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {initialData
          ? getTranslation("modifierAssociation", language)
          : getTranslation("enregistrerAssociation", language)}
      </h2>

      {message && (
        <div className={`mb-4 p-3 rounded ${
          message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Code Association */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              {getTranslation("codeAssociation", language)} *
            </label>
            <input
              type="text"
              name="codeAssociation"
              value={association.codeAssociation}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="ASSO001"
              required
              disabled={!!initialData}
            />
          </div>

          {/* Email Utilisateur */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              {getTranslation("emailUser", language)} *
            </label>
            <input
              type="email"
              name="emailUser"
              value={association.emailUser}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="utilisateur@example.com"
              required
            />
            <small className="text-gray-500 text-sm">
              {getTranslation("emailUserHelp", language) || "Email de l'utilisateur à associer"}
            </small>
          </div>

          {/* Pays */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              {getTranslation("country", language)} *
            </label>
            <select
              name="pays"
              value={association.pays}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">{getTranslation("chooseCountry", language)}</option>
              <option value="Sénégal">🇸🇳 Sénégal</option>
              <option value="Gambie">🇬🇲 Gambie</option>
              <option value="Guinée-Bissau">🇬🇼 Guinée-Bissau</option>
              <option value="Mali">🇲🇱 Mali</option>
              <option value="Guinée">🇬🇳 Guinée</option>
              <option value="Autre">🌍 {getTranslation("other", language)}</option>
            </select>
          </div>

          {/* Ville */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              {getTranslation("city", language)} *
            </label>
            <input
              type="text"
              name="ville"
              value={association.ville}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Dakar"
              required
            />
          </div>

          {/* Pseudo */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              {getTranslation("pseudo", language)}
            </label>
            <input
              type="text"
              name="pseudo"
              value={association.pseudo}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="ASSO_TEST"
            />
          </div>

          {/* Quartier */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              {getTranslation("district", language)}
            </label>
            <input
              type="text"
              name="quartier"
              value={association.quartier}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Plateau"
            />
          </div>

          {/* Téléphone */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              {getTranslation("phone", language)}
            </label>
            <input
              type="tel"
              name="telephone"
              value={association.telephone}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="771234567"
            />
          </div>

          {/* Email Association */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              {getTranslation("email", language)}
            </label>
            <input
              type="email"
              name="email"
              value={association.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="association@example.com"
            />
          </div>
        </div>

        {/* Boutons */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
          >
            {getTranslation("cancel", language)}
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {getTranslation("save", language)}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssociationForm;