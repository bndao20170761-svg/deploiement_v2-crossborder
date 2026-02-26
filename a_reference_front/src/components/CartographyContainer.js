// src/components/CartographyContainer.jsx
import React, { useState, useEffect } from 'react';
import { Box,Button, Alert, CircularProgress, Typography, Chip } from '@mui/material';
import CartographyMap from './CartographyMap';
import { getMyHospitals, createHopital } from '../services/hopitalService';

const STORAGE_KEY = "mapState";

const CartographyContainer = ({ language = 'fr' }) => {
  const [hospitals, setHospitals] = useState([]);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // état pour la carte (zoom + coordonnées)
  const [mapState, setMapState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved
      ? JSON.parse(saved)
      : { center: [14.6928, -17.4467], zoom: 6 };
  });

  // 🔥 CHARGER LES HÔPITAUX DU DOCTEUR
  useEffect(() => {
    const loadMyHospitals = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔄 Chargement des hôpitaux du docteur...');

        const myHospitals = await getMyHospitals();
        console.log('✅ Hôpitaux du docteur chargés:', myHospitals);

        setHospitals(myHospitals);
        showNotification(`✅ ${myHospitals.length} de vos hôpitaux chargés`, 'success');
    } catch (error) {
        console.error('❌ Erreur chargement hôpitaux du docteur:', error);
        setError('Erreur lors du chargement de vos hôpitaux');
        showNotification('❌ Erreur lors du chargement des hôpitaux', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadMyHospitals();
  }, []);

  // Sauvegarder dans localStorage quand mapState change
useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mapState));
  }, [mapState]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // 🔥 CRÉER UN HÔPITAL VIA API
  const addHospital = async (newHospital) => {
    try {
      console.log('🔄 Création nouvel hôpital:', newHospital);

      const savedHospital = await createHopital(newHospital);
      console.log('✅ Hôpital créé:', savedHospital);

      // Ajouter le nouvel hôpital à la liste
      setHospitals(prev => [...prev, savedHospital]);
      showNotification('🏥 Hôpital ajouté avec succès! En attente de validation.', 'success');

      return savedHospital;
    } catch (error) {
      console.error('❌ Erreur création hôpital:', error);
      showNotification('❌ Erreur lors de la création de l\'hôpital', 'error');
      throw error;
    }
  };

  const updateHospital = (id, updatedData) => {
    setHospitals((prev) =>
      prev.map((hospital) =>
        hospital.id === id ? { ...hospital, ...updatedData } : hospital
      )
    );
    showNotification('Hôpital mis à jour avec succès!', 'success');
  };

  const deleteHospital = (id) => {
    setHospitals((prev) => prev.filter((hospital) => hospital.id !== id));
    showNotification('Hôpital supprimé avec succès!', 'success');
  };

  // Statistiques
  const activeHospitals = hospitals.filter(h => h.active).length;
  const pendingHospitals = hospitals.filter(h => !h.active).length;

  if (loading) {
  return (
      <Box sx={{
        height: '80vh',
        width: '100%',
         display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
         flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Chargement de vos hôpitaux...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{
        height: '80vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 2
      }}>
        <Alert severity="error" sx={{ maxWidth: 500 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          onClick={() => window.location.reload()}
        >
          Réessayer
        </Button>
             </Box>
    );
  }

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

      {/* 🔥 EN-TÊTE AVEC STATISTIQUES DES HÔPITAUX DU DOCTEUR */}
      <Box sx={{
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 1000,
        backgroundColor: 'background.paper',
        padding: 2,
        borderRadius: 2,
        boxShadow: 3,
        maxWidth: 300
      }}>
                <Typography variant="h6" gutterBottom>
          🏥 Vos établissements
                </Typography>

        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <Chip
            label={`${activeHospitals} validés`}
            color="success"
                    size="small"
          />
          <Chip
            label={`${pendingHospitals} en attente`}
            color="warning"
                    size="small"
                />
              </Box>

        <Typography variant="body2" color="text.secondary">
          Total: {hospitals.length} hôpitaux
        </Typography>

        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          🔴 Hôpital validé<br/>
          🟣 En attente de validation
        </Typography>
      </Box>

      {/* Carte */}
      <CartographyMap
        hospitals={hospitals}
        onHospitalUpdate={updateHospital}
        onHospitalAdd={addHospital}
        onHospitalDelete={deleteHospital}
        language={language}
        mapState={mapState}
        setMapState={setMapState}
      />
    </Box>
  );
};

export default CartographyContainer;