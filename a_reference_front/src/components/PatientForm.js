// src/components/PatientForm.jsx
import React, { useState, useEffect } from 'react';
import { getTranslation } from '../utils/translations';
// Règles téléphone par pays
const COUNTRY_RULES = {
  Senegal: { code: "+221", maxLength: 9, flag: "🇸🇳", label: "Sénégal" },
  Gambia: { code: "+220", maxLength: 7, flag: "🇬🇲", label: "Gambie" },
  "Guinea-Bissau": { code: "+245", maxLength: 7, flag: "🇬🇼", label: "Guinée-Bissau" },
};

const PatientForm = ({ initialData, onSave,language, onCancel }) => {
  const [patient, setPatient] = useState({
    codePatient: '',
    nomUtilisateur: '',
    prenomUtilisateur: '',
    dateNaissance: '',
    sexe: '',
    username: '',
    password: '',
    age: '',
    nationaliteUtilisateur: '',
    adressePermanent: '',
    adresseTemporaire: '',
    profession: '',
    statutMatrimoniale: '',
    telephone: '',
  });

  const [message, setMessage] = useState('');
  const [country, setCountry] = useState('Senegal'); // pays par défaut pour téléphone

  useEffect(() => {
    if (initialData) {
      setPatient({
        ...initialData,
        dateNaissance: initialData.dateNaissance
          ? initialData.dateNaissance.split('T')[0]
          : '',
      });
    }
    setMessage('');
  }, [initialData]);

  // Changement générique
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPatient((prev) => ({ ...prev, [name]: value }));
    if (message) setMessage('');
  };

  // Gestion téléphone
  const handlePhoneChange = (e) => {
    const { value } = e.target;
    const { maxLength } = COUNTRY_RULES[country];
    const digits = value.replace(/\D/g, '').slice(0, maxLength); // chiffres uniquement
    setPatient((prev) => ({ ...prev, telephone: digits }));
  };

  // Validation & submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { code } = COUNTRY_RULES[country];
      const fullNumber = code + patient.telephone;

      if (!/^\+\d{6,15}$/.test(fullNumber)) {
        setMessage("❌ Numéro de téléphone invalide.");
        return;
      }

      const payload = {
        ...patient,
        telephone: fullNumber,
        age: patient.age ? parseInt(patient.age, 10) : null,
        dateNaissance: patient.dateNaissance
          ? new Date(patient.dateNaissance).toISOString()
          : null,
      };

    if (onSave) {
      await onSave(payload);
      setMessage('✅ Patient enregistré avec succès !');
    }
    } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error);
      setMessage("❌ Erreur lors de l'enregistrement du patient.");
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">
        {initialData
          ? getTranslation("modifierPatient", language)
          : getTranslation("enregistrerPatient", language)}
      </h2>

      {message && <div className="mb-3 text-sm text-red-600">{message}</div>}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Nom */}
        <div>
          <label className="block mb-1 font-medium">
            {getTranslation("nom", language)}
          </label>
          <input
            type="text"
            name="nomUtilisateur"
            value={patient.nomUtilisateur}
            onChange={handleChange}
            className="border p-2 w-full"
            required
          />
        </div>

        {/* Prénom */}
        <div>
          <label className="block mb-1 font-medium">
            {getTranslation("prenom", language)}
          </label>
          <input
            type="text"
            name="prenomUtilisateur"
            value={patient.prenomUtilisateur}
            onChange={handleChange}
            className="border p-2 w-full"
            required
          />
        </div>

        {/* Date de Naissance */}
        <div>
          <label className="block mb-1 font-medium">
            {getTranslation("dateNaissance", language)}
          </label>
          <input
            type="date"
            name="dateNaissance"
            value={patient.dateNaissance}
            onChange={handleChange}
            className="border p-2 w-full"
            required
          />
        </div>

        {/* Sexe */}
        <div>
          <label className="block mb-1 font-medium">
            {getTranslation("sexe", language)}
          </label>
          <select
            name="sexe"
            value={patient.sexe}
            onChange={handleChange}
            className="border p-2 w-full"
            required
          >
            <option value="">{getTranslation("choisir", language)}</option>
            <option value="M">{getTranslation("masculin", language)}</option>
            <option value="F">{getTranslation("feminin", language)}</option>
          </select>
        </div>

        {/* Username */}
        <div>
          <label className="block mb-1 font-medium">
            {getTranslation("username", language)}
          </label>
          <input
            type="email"
            name="username"
            value={patient.username}
            onChange={handleChange}
            className="border p-2 w-full"
            required
          />
        </div>

        {/* Password */}
        <div>
          <label className="block mb-1 font-medium">
            {getTranslation("password", language)}
          </label>
          <input
            type="password"
            name="password"
            value={patient.password}
            onChange={handleChange}
            className="border p-2 w-full"
            required
          />
        </div>

        {/* Âge */}
        <div>
          <label className="block mb-1 font-medium">
            {getTranslation("age", language)}
          </label>
          <input
            type="number"
            name="age"
            value={patient.age}
            onChange={handleChange}
            className="border p-2 w-full"
            min={0}
            required
          />
        </div>

        {/* Nationalité */}
        <div>
          <label className="block mb-1 font-medium">
            {getTranslation("nationalite", language)}
          </label>
          <select
            name="nationaliteUtilisateur"
            value={patient.nationaliteUtilisateur}
            onChange={handleChange}
            className="border p-2 w-full"
            required
          >
            <option value="">{getTranslation("choisir", language)}</option>
            <option value="Sénégalaise">🇸🇳 {getTranslation("senegalaise", language)}</option>
            <option value="Gambienne">🇬🇲 {getTranslation("gambienne", language)}</option>
            <option value="Bissau-Guinéenne">🇬🇼 {getTranslation("bissauGuineenne", language)}</option>
          </select>
        </div>

        {/* Adresse Permanente */}
        <div>
          <label className="block mb-1 font-medium">
            {getTranslation("adressePermanente", language)}
          </label>
          <input
            type="text"
            name="adressePermanent"
            value={patient.adressePermanent}
            onChange={handleChange}
            className="border p-2 w-full"
            required
          />
        </div>

        {/* Adresse Temporaire */}
        <div>
          <label className="block mb-1 font-medium">
            {getTranslation("adresseTemporaire", language)}
          </label>
          <input
            type="text"
            name="adresseTemporaire"
            value={patient.adresseTemporaire}
            onChange={handleChange}
            className="border p-2 w-full"
          />
        </div>

        {/* Profession */}
        <div>
          <label className="block mb-1 font-medium">
            {getTranslation("profession", language)}
          </label>
          <input
            type="text"
            name="profession"
            value={patient.profession}
            onChange={handleChange}
            className="border p-2 w-full"
          />
        </div>

        {/* Statut Matrimonial */}
        <div>
          <label className="block mb-1 font-medium">
            {getTranslation("statutMatrimonial", language)}
          </label>
          <select
            name="statutMatrimoniale"
            value={patient.statutMatrimoniale}
            onChange={handleChange}
            className="border p-2 w-full"
            required
          >
            <option value="">{getTranslation("choisir", language)}</option>
            <option value="Célibataire">{getTranslation("celibataire", language)}</option>
            <option value="Marié">{getTranslation("marie", language)}</option>
          </select>
        </div>

        {/* Téléphone */}
        <div>
          <label className="block mb-1 font-medium">
            {getTranslation("telephone", language)}
          </label>
          <div className="flex">
            <select
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                setPatient((prev) => ({ ...prev, telephone: "" }));
              }}
              className="border p-2 rounded-l w-1/3"
            >
              {Object.entries(COUNTRY_RULES).map(([key, { code, flag, label }]) => (
                <option key={key} value={key}>
                  {flag} {label} ({code})
                </option>
              ))}
            </select>
            <input
              type="tel"
              name="telephone"
              value={patient.telephone}
              onChange={handlePhoneChange}
              className="border p-2 w-2/3 rounded-r"
              placeholder={`Ex: ${"9".repeat(COUNTRY_RULES[country].maxLength)}`}
              required
            />
          </div>
          <small className="text-gray-500">
            {getTranslation("formatTel", language)} {COUNTRY_RULES[country].code}{" "}
            {getTranslation("suiviDe", language)} {COUNTRY_RULES[country].maxLength}{" "}
            {getTranslation("chiffres", language)}
          </small>
        </div>

        {/* Boutons */}
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            {getTranslation("annuler", language)}
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {getTranslation("enregistrer", language)}
          </button>
        </div>
      </form>
    </div>
  );

};

export default PatientForm;
