import React, { useState, useEffect } from 'react';
import { getTranslation } from '../utils/translations';

const DoctorForm = ({ initialData, onSave, language, onCancel, hospitals = [] }) => {
  const [doctor, setDoctor] = useState({
    codeDoctor: '',
    email: '',
    fonction: '',
    lieuExercice: '',
    telephone: '',
    nomUtilisateur: '',
    prenomUtilisateur: '',
    nationaliteUtilisateur: '',
    password: '',
    hopitalId: '',
    sexe: '',
    statutMatrimoniale: ''
  });

  const [message, setMessage] = useState('');

  useEffect(() => {
    if (initialData) {
      setDoctor({
        codeDoctor: initialData.codeDoctor || '',
        email: initialData.email || '',
        fonction: initialData.fonction || '',
        lieuExercice: initialData.lieuExercice || '',
        telephone: initialData.telephone || '',
        nomUtilisateur: initialData.nomUtilisateur || '',
        prenomUtilisateur: initialData.prenomUtilisateur || '',
        nationaliteUtilisateur: initialData.nationaliteUtilisateur || '',
        password: '',
        hopitalId: initialData.hopitalId || '',
        sexe: initialData.sexe || '',
        statutMatrimoniale: initialData.statutMatrimoniale || ''
      });
    } else {
      setDoctor({
        codeDoctor: '',
        email: '',
        fonction: '',
        lieuExercice: '',
        telephone: '',
        nomUtilisateur: '',
        prenomUtilisateur: '',
        nationaliteUtilisateur: '',
        password: '',
        hopitalId: '',
        sexe: '',
        statutMatrimoniale: ''
      });
    }
    setMessage('');
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDoctor(prev => ({ ...prev, [name]: value }));
    if (message) setMessage('');
  };

  const validateForm = () => {
    if (!doctor.email || !doctor.fonction || !doctor.lieuExercice ||
        !doctor.nomUtilisateur || !doctor.prenomUtilisateur) {
      setMessage(getTranslation("fillAllRequired", language) || "❌ Veuillez remplir tous les champs obligatoires.");
      return false;
    }

    if (!doctor.codeDoctor) {
      setMessage(getTranslation("codeRequired", language) || "❌ Le code médecin est obligatoire.");
      return false;
    }

    if (!doctor.hopitalId) {
      setMessage(getTranslation("hospitalRequired", language) || "❌ La sélection d'un hôpital est obligatoire.");
      return false;
    }

    if (!initialData && !doctor.password) {
      setMessage(getTranslation("passwordRequired", language) || "❌ Le mot de passe est obligatoire pour la création.");
      return false;
    }

    if (doctor.password && doctor.password.length < 6) {
      setMessage(getTranslation("passwordMin6", language) || "❌ Le mot de passe doit contenir au moins 6 caractères.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const payload = { ...doctor, hopitalId: parseInt(doctor.hopitalId, 10) };
      if (onSave) {
        await onSave(payload, doctor.codeDoctor);
        setMessage(getTranslation("doctorSaved", language) || "✅ Médecin enregistré avec succès !");

        if (!initialData) {
          setDoctor({
            codeDoctor: '',
            email: '',
            fonction: '',
            lieuExercice: '',
            telephone: '',
            nomUtilisateur: '',
            prenomUtilisateur: '',
            nationaliteUtilisateur: '',
            password: '',
            hopitalId: '',
            sexe: '',
            statutMatrimoniale: ''
          });
        }
      }
    } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error);
      setMessage(getTranslation("doctorSaveError", language) ||
                 "❌ Erreur lors de l'enregistrement du médecin: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {initialData
          ? getTranslation("modifierDoctor", language) || "Modifier le médecin"
          : getTranslation("enregistrerDoctor", language) || "Enregistrer un médecin"}
      </h2>

      {message && (
        <div className={`mb-4 p-3 rounded ${message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Code Doctor */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              {getTranslation("codeDoctor", language) || "Code Médecin"} *
            </label>
            <input
              type="text"
              name="codeDoctor"
              value={doctor.codeDoctor}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="DOC001"
              required
              disabled={!!initialData}
            />
            {initialData && (
              <small className="text-gray-500 text-sm">
                {getTranslation("codeCannotBeChanged", language) || "Le code ne peut pas être modifié"}
              </small>
            )}
          </div>

          {/* Hôpital */}
          <div className={initialData ? "md:col-span-2" : "md:col-span-1"}>
            <label className="block mb-2 font-medium text-gray-700">
              {getTranslation("hospital", language) || "Hôpital"} *
            </label>
            <select
              name="hopitalId"
              value={doctor.hopitalId}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">{getTranslation("chooseHospital", language) || "Choisir un hôpital"}</option>
              {hospitals.filter(h => h.active).map(h => (
                <option key={h.id} value={h.id}>
                  {h.nom} - {h.ville} ({h.pays})
                </option>
              ))}
            </select>
          </div>

          {/* Email */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              {getTranslation("email", language) || "Email"} *
            </label>
            <input
              type="email"
              name="email"
              value={doctor.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Fonction */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              {getTranslation("function", language) || "Fonction"} *
            </label>
            <input
              type="text"
              name="fonction"
              value={doctor.fonction}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Lieu d'exercice */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              {getTranslation("workplace", language) || "Lieu d'exercice"} *
            </label>
            <input
              type="text"
              name="lieuExercice"
              value={doctor.lieuExercice}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Téléphone */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              {getTranslation("phone", language) || "Téléphone"}
            </label>
            <input
              type="tel"
              name="telephone"
              value={doctor.telephone}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Nom */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              {getTranslation("lastName", language) || "Nom"} *
            </label>
            <input
              type="text"
              name="nomUtilisateur"
              value={doctor.nomUtilisateur}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Prénom */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              {getTranslation("firstName", language) || "Prénom"} *
            </label>
            <input
              type="text"
              name="prenomUtilisateur"
              value={doctor.prenomUtilisateur}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Nationalité */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              {getTranslation("nationality", language) || "Nationalité"}
            </label>
            <select
              name="nationaliteUtilisateur"
              value={doctor.nationaliteUtilisateur}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{getTranslation("choose", language) || "Choisir"}</option>
              <option value="Sénégalaise">🇸🇳 {getTranslation("senegalese", language) || "Sénégalaise"}</option>
              <option value="Française">🇫🇷 {getTranslation("french", language) || "Française"}</option>
              <option value="Malien(ne)">🇲🇱 {getTranslation("malian", language) || "Malien(ne)"}</option>
              <option value="Ivoirien(ne)">🇨🇮 {getTranslation("ivorian", language) || "Ivoirien(ne)"}</option>
              <option value="Autre">🌍 {getTranslation("other", language) || "Autre"}</option>
            </select>
          </div>

          {/* Sexe */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              {getTranslation("gender", language) || "Sexe"}
            </label>
            <select
              name="sexe"
              value={doctor.sexe}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{getTranslation("choose", language) || "Choisir"}</option>
              <option value="M">{getTranslation("male", language) || "Masculin"}</option>
              <option value="F">{getTranslation("female", language) || "Féminin"}</option>
            </select>
          </div>

          {/* Statut matrimonial */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              {getTranslation("maritalStatus", language) || "Statut Matrimonial"}
            </label>
            <select
              name="statutMatrimoniale"
              value={doctor.statutMatrimoniale}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{getTranslation("choose", language) || "Choisir"}</option>
              <option value="Célibataire">{getTranslation("single", language) || "Célibataire"}</option>
              <option value="Marié(e)">{getTranslation("married", language) || "Marié(e)"}</option>
              <option value="Divorcé(e)">{getTranslation("divorced", language) || "Divorcé(e)"}</option>
              <option value="Veuf(ve)">{getTranslation("widowed", language) || "Veuf(ve)"}</option>
            </select>
          </div>

          {/* Mot de passe */}
          {!initialData && (
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                {getTranslation("password", language) || "Mot de passe"} *
              </label>
              <input
                type="password"
                name="password"
                value={doctor.password}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          )}
        </div>

        {/* Boutons */}
        <div className="flex justify-end space-x-4 mt-6">
          <button type="button" onClick={onCancel} className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition">
            {getTranslation("cancel", language) || "Annuler"}
          </button>
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            {getTranslation("save", language) || "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DoctorForm;
