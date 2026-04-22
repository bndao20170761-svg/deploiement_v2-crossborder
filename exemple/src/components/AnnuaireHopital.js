// components/AnnuaireHopital.jsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  TextField,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { Phone, Email, LocationOn, LocalHospital } from '@mui/icons-material';
import axios from 'axios';

const AnnuaireHopital = ({ patient }) => {
  const [hopitaux, setHopitaux] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [hopitalSelectionne, setHopitalSelectionne] = useState(null);
  const [dialogueOuvert, setDialogueOuvert] = useState(false);

  useEffect(() => {
    chargerHopitaux();
  }, []);

  const chargerHopitaux = async () => {
    try {
      const reponse = await axios.get('/api/hopitaux?includeDoctors=true');
      setHopitaux(reponse.data);
    } catch (erreur) {
      console.error('Erreur chargement hôpitaux:', erreur);
    }
  };

  const hopitauxFiltres = hopitaux.filter(hopital =>
    hopital.nom.toLowerCase().includes(recherche.toLowerCase()) ||
    hopital.ville.toLowerCase().includes(recherche.toLowerCase())
  );

  const appelerNumero = (numero) => {
    window.open(`tel:${numero}`, '_self');
  };

  const envoyerEmail = (email) => {
    window.open(`mailto:${email}?subject=Suivi Patient ${patient?.codePatient}`, '_self');
  };

  return (
    <div>
      <TextField
        fullWidth
        label="Rechercher un hôpital ou une ville"
        value={recherche}
        onChange={(e) => setRecherche(e.target.value)}
        sx={{ mb: 2 }}
      />

      <Grid container spacing={2}>
        {hopitauxFiltres.map((hopital) => (
          <Grid item xs={12} md={6} key={hopital.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <LocalHospital sx={{ mr: 1 }} />
                  {hopital.nom}
                </Typography>

                <Typography color="textSecondary" gutterBottom>
                  <LocationOn sx={{ fontSize: 16, mr: 0.5 }} />
                  {hopital.ville}, {hopital.pays}
                </Typography>

                <div style={{ marginBottom: '10px' }}>
                  {hopital.services.slice(0, 3).map(service => (
                    <Chip
                      key={service.code}
                      label={service.code}
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </div>

                <div>
                  <IconButton
                    onClick={() => appelerNumero(hopital.telephoneFixe)}
                    color="primary"
                  >
                    <Phone />
                  </IconButton>

                  <IconButton
                    onClick={() => {
                      setHopitalSelectionne(hopital);
                      setDialogueOuvert(true);
                    }}
                  >
                    Voir contacts
                  </IconButton>
                </div>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialogue des contacts détaillés */}
      <Dialog open={dialogueOuvert} onClose={() => setDialogueOuvert(false)}>
        <DialogTitle>
          Contacts - {hopitalSelectionne?.nom}
        </DialogTitle>
        <DialogContent>
          <List>
            {hopitalSelectionne?.doctors?.map((doctor) => (
              <ListItem key={doctor.codeDoctor}>
                <ListItemIcon>
                  <img src="/avatar-medecin.png" alt="Médecin" style={{ width: 40, height: 40, borderRadius: '50%' }} />
                </ListItemIcon>
                <ListItemText
                  primary={doctor.pseudo}
                  secondary={
                    <div>
                      <div>{doctor.fonction}</div>
                      <div style={{ marginTop: '5px' }}>
                        <IconButton
                          size="small"
                          onClick={() => appelerNumero(doctor.telephone)}
                        >
                          <Phone fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => envoyerEmail(doctor.email)}
                        >
                          <Email fontSize="small" />
                        </IconButton>
                      </div>
                    </div>
                  }
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnnuaireHopital;