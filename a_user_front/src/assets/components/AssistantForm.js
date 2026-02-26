import React, { useState, useEffect } from 'react';
import { getTranslation } from '../utils/translations';

const AssistantForm = ({ initialData, onSave, language, onCancel, hospitals = [] }) => {
  const [assistant, setAssistant] = useState({
    codeAssistant: '',
    email: '',
    lieuExercice: '',
    telephone: '',
    nomUtilisateur: '',
    prenomUtilisateur: '',
    nationaliteUtilisateur: '',
    password: '',
    hopitalId: ''
  });

  const [message, setMessage] = useState('');

  useEffect(() => {
    if (initialData) {
      setAssistant({
        ...initialData,
        hopitalId: initialData.hopitalId || '',
        password: '' // Ne pas afficher le mot de passe existant
      });
    }
    setMessage('');
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAssistant((prev) => ({ ...prev, [name]: value }));
    if (message) setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!assistant.codeAssistant || !assistant.email || !assistant.lieuExercice) {
        setMessage("❌ Veuillez remplir tous les champs obligatoires.");
        return;
      }

      if (!initialData && (!assistant.password || assistant.password.length < 6)) {
        setMessage("❌ Le mot de passe doit contenir au moins 6 caractères.");
        return;
      }

      const payload = {
        ...assistant,
        hopitalId: assistant.hopitalId ? parseInt(assistant.hopitalId, 10) : null
      };

      if (onSave) {
        await onSave(payload);
        setMessage('✅ Assistant social enregistré avec succès !');
      }
    } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error);
      setMessage("❌ Erreur lors de l'enregistrement de l'assistant social.");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {initialData
          ? getTranslation("modifierAssistant", language)
          : getTranslation("enregistrerAssistant", language)}
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
          {/* Code Assistant */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              {getTranslation("codeAssistant", language)} *
            </label>
            <input
              type="text"
              name="codeAssistant"
              value={assistant.codeAssistant}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="ASST001"
              required
              disabled={!!initialData}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              {getTranslation("email", language)} *
            </label>
            <input
              type="email"
              name="email"
              value={assistant.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="assistant@example.com"
              required
            />
          </div>

          {/* Lieu d'exercice */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              {getTranslation("workplace", language)} *
            </label>
            <input
              type="text"
              name="lieuExercice"
              value={assistant.lieuExercice}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Hôpital Principal"
              required
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
              value={assistant.telephone}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="771234567"
            />
          </div>

          {/* Hôpital - OBLIGATOIRE */}
                   <div className="md:col-span-2">
                     <label className="block mb-2 font-medium text-gray-700">
                       {getTranslation("hospital", language)} *
                     </label>
                     <select
                       name="hopitalId"
                       value={assistant.hopitalId}
                       onChange={handleChange}
                       className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                       required
                     >
                       <option value="">{getTranslation("chooseHospital", language)}</option>
                       {hospitals
                         .filter(hospital => hospital.active) // Filtrer seulement les hôpitaux actifs
                         .map((hospital) => (
                           <option key={hospital.id} value={hospital.id}>
                             {hospital.nom} - {hospital.ville} ({hospital.pays})
                           </option>
                         ))
                       }
                     </select>
                     <small className="text-gray-500 text-sm">
                       {getTranslation("hospitalRequired", language)}
                     </small>
                   </div>

          {/* Nom */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              {getTranslation("lastName", language)} *
            </label>
            <input
              type="text"
              name="nomUtilisateur"
              value={assistant.nomUtilisateur}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Diallo"
              required
            />
          </div>

          {/* Prénom */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              {getTranslation("firstName", language)} *
            </label>
            <input
              type="text"
              name="prenomUtilisateur"
              value={assistant.prenomUtilisateur}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Aminata"
              required
            />
          </div>

          {/* Nationalité */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              {getTranslation("nationality", language)}
            </label>
            <select
              name="nationaliteUtilisateur"
              value={assistant.nationaliteUtilisateur}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{getTranslation("choose", language)}</option>
              <option value="Sénégalaise">🇸🇳 {getTranslation("senegalese", language)}</option>
              <option value="Française">🇫🇷 {getTranslation("french", language)}</option>
              <option value="Autre">🌍 {getTranslation("other", language)}</option>
            </select>
          </div>

          {/* Mot de passe */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              {getTranslation("password", language)} {!initialData && '*'}
            </label>
            <input
              type="password"
              name="password"
              value={assistant.password}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={initialData ? "Laisser vide pour ne pas changer" : "Mot de passe"}
              required={!initialData}
            />
            {initialData && (
              <small className="text-gray-500 text-sm">
                {getTranslation("passwordLeaveBlank", language)}
              </small>
            )}
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

export default AssistantForm;