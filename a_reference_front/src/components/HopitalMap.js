// components/HopitalMap.jsx
import React, { useState, useEffect } from 'react';
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Box, Chip, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import 'leaflet/dist/leaflet.css';

const HopitalMap = () => {
  const [hopitaux, setHopitaux] = useState([]);
  const [services, setServices] = useState([]);
  const [filtres, setFiltres] = useState([]);
  const [hopitauxFiltres, setHopitauxFiltres] = useState([]);

  // Centre sur la région frontalière Sénégal-Gambie-Bissau
  const centreCarte = [13.5, -15.5];
  const zoomDefaut = 8;

  useEffect(() => {
    chargerDonnees();
  }, []);

  useEffect(() => {
    appliquerFiltres();
  }, [filtres, hopitaux]);

  const chargerDonnees = async () => {
    try {
      // Récupérer les hôpitaux avec leurs services
      const reponseHopitaux = await axios.get(`${process.env.REACT_APP_GATEWAY_URL || 'http://localhost:8080'}/api/hopitaux-proxy/tous?includeServices=true`);
      setHopitaux(reponseHopitaux.data);

      // Récupérer tous les services disponibles - utiliser endpoint integration
      const reponseServices = await axios.get(`${process.env.REACT_APP_GATEWAY_URL || 'http://localhost:8080'}/api/integration/hospitals`);
      setServices(reponseServices.data);
    } catch (erreur) {
      console.error('Erreur chargement données:', erreur);
    }
  };

  const appliquerFiltres = () => {
    if (filtres.length === 0) {
      setHopitauxFiltres(hopitaux);
    } else {
      const hopitauxFiltres = hopitaux.filter(hopital =>
        filtres.every(filtre =>
          hopital.services.some(service => service.code === filtre)
        )
      );
      setHopitauxFiltres(hopitauxFiltres);
    }
  };

  const gererChangementFiltre = (event) => {
    setFiltres(event.target.value);
  };

  return (
    <Box sx={{ height: '70vh', width: '100%' }}>
      {/* Barre de filtres */}
      <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
        <FormControl fullWidth>
          <InputLabel>Filtrer par service</InputLabel>
          <Select
            multiple
            value={filtres}
            onChange={gererChangementFiltre}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} size="small" />
                ))}
              </Box>
            )}
          >
            {services.map((service) => (
              <MenuItem key={service.code} value={service.code}>
                {service.nom}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Carte */}
      <MapContainer
        center={centreCarte}
        zoom={zoomDefaut}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {hopitauxFiltres.map((hopital) => (
          <Marker
            key={hopital.id}
            position={[hopital.latitude, hopital.longitude]}
          >
            <Popup>
              <div>
                <h3>{hopital.nom}</h3>
                <p><strong>Ville:</strong> {hopital.ville}</p>
                <p><strong>Téléphone:</strong> {hopital.telephoneFixe}</p>
                <div>
                  <strong>Services:</strong>
                  {hopital.services.map(service => (
                    <Chip
                      key={service.code}
                      label={service.nom}
                      size="small"
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </div>
                <button onClick={() => window.location.href = `/hopitaux/${hopital.id}`}>
                  Voir détails
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Box>
  );
};

export default HopitalMap;