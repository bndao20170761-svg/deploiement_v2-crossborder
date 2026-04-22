// src/components/HopitalList.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Alert,
  Chip,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import {
  LocalHospital,
  LocationOn,
  Phone,
  Email,
  Search,
  Map
} from '@mui/icons-material';

const HopitalList = ({ language = 'fr' }) => {
  const [hopitaux, setHopitaux] = useState([]);
  const [hopitauxFiltres, setHopitauxFiltres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recherche, setRecherche] = useState('');
  const [hopitalSelectionne, setHopitalSelectionne] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    chargerDonnees();
  }, []);

  useEffect(() => {
    filtrerHopitaux();
  }, [recherche, hopitaux]);

  const chargerDonnees = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`${process.env.REACT_APP_GATEWAY_URL || 'http://localhost:8081'}/api/hopitaux-proxy/actifs`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Erreur lors du chargement');

      const data = await response.json();
      setHopitaux(data);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtrerHopitaux = () => {
    if (!recherche.trim()) {
      setHopitauxFiltres(hopitaux);
      return;
    }

    const terme = recherche.toLowerCase();
    const filtres = hopitaux.filter(hopital =>
      hopital.nom.toLowerCase().includes(terme) ||
      hopital.ville.toLowerCase().includes(terme) ||
      hopital.pays.toLowerCase().includes(terme) ||
      (hopital.adresseComplete && hopital.adresseComplete.toLowerCase().includes(terme))
    );

    setHopitauxFiltres(filtres);
  };

  const ouvrirDetails = (hopital) => {
    setHopitalSelectionne(hopital);
    setDialogOpen(true);
  };

  const fermerDetails = () => {
    setDialogOpen(false);
    setHopitalSelectionne(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
        <Button onClick={chargerDonnees} sx={{ ml: 2 }}>Réessayer</Button>
      </Alert>
    );
  }

  return (
    <Box>
      {/* Barre de recherche */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Rechercher par nom, ville ou pays..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {hopitauxFiltres.length} structure(s) trouvée(s)
          </Typography>
        </CardContent>
      </Card>

      {/* Liste des hôpitaux */}
      <List>
        {hopitauxFiltres.map((hopital) => (
          <Card key={hopital.id} sx={{ mb: 2 }}>
            <CardContent>
              <ListItem>
                <ListItemIcon>
                  <LocalHospital color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="h6">{hopital.nom}</Typography>
                      <Chip
                        label={hopital.active ? 'Actif' : 'Inactif'}
                        size="small"
                        color={hopital.active ? 'success' : 'default'}
                      />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <LocationOn fontSize="small" />
                        <Typography variant="body2">
                          {hopital.ville}, {hopital.pays}
                        </Typography>
                      </Box>
                      {hopital.telephoneFixe && (
                        <Box display="flex" alignItems="center" gap={1}>
                          <Phone fontSize="small" />
                          <Typography variant="body2">{hopital.telephoneFixe}</Typography>
                        </Box>
                      )}
                    </Box>
                  }
                />
                <IconButton
                  onClick={() => ouvrirDetails(hopital)}
                  color="primary"
                >
                  <Map />
                </IconButton>
              </ListItem>
            </CardContent>
          </Card>
        ))}
      </List>

      {/* Dialog des détails */}
      <Dialog open={dialogOpen} onClose={fermerDetails} maxWidth="md" fullWidth>
        <DialogTitle>
          Détails de {hopitalSelectionne?.nom}
        </DialogTitle>
        <DialogContent>
          {hopitalSelectionne && (
            <Box>
              <Typography><strong>Ville:</strong> {hopitalSelectionne.ville}</Typography>
              <Typography><strong>Pays:</strong> {hopitalSelectionne.pays}</Typography>
              {hopitalSelectionne.telephoneFixe && (
                <Typography><strong>Téléphone:</strong> {hopitalSelectionne.telephoneFixe}</Typography>
              )}
              {hopitalSelectionne.adresseComplete && (
                <Typography><strong>Adresse:</strong> {hopitalSelectionne.adresseComplete}</Typography>
              )}
              {hopitalSelectionne.latitude && hopitalSelectionne.longitude && (
                <Typography><strong>Coordonnées:</strong> {hopitalSelectionne.latitude}, {hopitalSelectionne.longitude}</Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={fermerDetails}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HopitalList;