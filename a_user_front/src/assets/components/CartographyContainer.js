// src/components/CartographyContainer.jsx
import React, { useState, useEffect } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import CartographyMap from './CartographyMap';
import { getAllHospitals } from '../services/hospitalService';

const CartographyContainer = ({ language = 'fr' }) => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Charger la liste des hôpitaux depuis le backend
  useEffect(() => {
    const loadHospitals = async () => {
      setLoading(true);
      try {
        const data = await getAllHospitals();
        setHospitals(data);
      } catch (error) {
        console.error('Erreur lors du chargement des hôpitaux:', error);
        showNotification('Impossible de charger les structures de santé', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadHospitals();
  }, []);

  // Ajouter un nouvel hôpital
  const addHospital = (newHospital) => {
    setHospitals((prev) => [...prev, newHospital]);
    showNotification('Hôpital ajouté avec succès! En attente de confirmation.');
  };

  // Mettre à jour un hôpital
  const updateHospital = (id, updatedData) => {
    setHospitals((prev) =>
      prev.map((hospital) =>
        hospital.id === id ? { ...hospital, ...updatedData } : hospital
      )
    );
    showNotification('Hôpital mis à jour avec succès!');
  };

  // Supprimer un hôpital
  const deleteHospital = (id) => {
    setHospitals((prev) => prev.filter((hospital) => hospital.id !== id));
    showNotification('Hôpital supprimé avec succès!');
  };

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      {notification && (
        <Alert
          severity={notification.type}
          sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1000 }}
        >
          {notification.message}
        </Alert>
      )}

      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          sx={{ height: '100%' }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <CartographyMap
          hospitals={hospitals}
          onHospitalUpdate={updateHospital}
          onHospitalAdd={addHospital}
          onHospitalDelete={deleteHospital}
          language={language}
        />
      )}
    </Box>
  );
};

export default CartographyContainer;
