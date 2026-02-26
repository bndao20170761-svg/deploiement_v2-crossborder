// PatientPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { getAllPatients, deletePatient, createPatient, updatePatient } from '../services/patientService';
import PatientForm from './PatientForm';
import PatientList from './PatientList';
import PatientView from './PatientView';

const PatientPage = ({ language }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const data = await getAllPatients();
      setPatients(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (codePatient) => {
    try {
      await deletePatient(codePatient);
      setPatients((prev) => prev.filter((p) => p.codePatient !== codePatient));
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = useCallback((patient) => {
    setEditingPatient(patient);
    setShowForm(true);
  }, []);

  const handleAddNew = () => {
    setEditingPatient(null);
    setShowForm(true);
  };

  const handleSave = async (patientData) => {
    try {
      if (editingPatient) {
        await updatePatient(editingPatient.codePatient, patientData);
      } else {
        await createPatient(patientData);
      }
      await loadPatients();
      setShowForm(false);
      setEditingPatient(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPatient(null);
  };

  const handleView = (patient) => {
    console.log('Voir patient', patient); // 🔹 Vérifie que ça se déclenche
    setSelectedPatient(patient);
  };

  const handleBack = () => setSelectedPatient(null);

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      {!selectedPatient ? (
        !showForm ? (
          <PatientList
            patients={patients}
            language={language}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView} // 👈 important
          />
        ) : (
          <PatientForm
            initialData={editingPatient}
            onSave={handleSave}
            onCancel={handleCancel}
            language={language}
          />
        )
      ) : (
        <div>
          <button
            onClick={handleBack}
            className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            🔙 Retour à la liste
          </button>
          <PatientView patient={selectedPatient} onUpdate={loadPatients} />
        </div>
      )}
      <button
        onClick={handleAddNew}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        + Ajouter un patient
      </button>
    </div>
  );
};

export default PatientPage;
