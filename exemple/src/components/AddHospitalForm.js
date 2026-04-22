// src/components/AddHospitalForm.jsx
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  Alert
} from '@mui/material';
import { Save, Cancel, LocalHospital } from '@mui/icons-material';

const AddHospitalForm = ({ onHospitalAdd, language = 'fr' }) => {
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    ville: '',
    pays: 'Sénégal',
    telephoneFixe: '',
    email: '',
    lat: '',
    lng: ''
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    }

    if (!formData.lat) {
      newErrors.lat = 'La latitude est requise';
    } else if (isNaN(formData.lat) || formData.lat < -90 || formData.lat > 90) {
      newErrors.lat = 'Latitude invalide (-90 à 90)';
    }

    if (!formData.lng) {
      newErrors.lng = 'La longitude est requise';
    } else if (isNaN(formData.lng) || formData.lng < -180 || formData.lng > 180) {
      newErrors.lng = 'Longitude invalide (-180 à 180)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      onHospitalAdd({
        ...formData,
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng),
        services: ['Consultation VIH'] // Service par défaut
      });

      setFormData({
        nom: '',
        description: '',
        ville: '',
        pays: 'Sénégal',
        telephoneFixe: '',
        email: '',
        lat: '',
        lng: ''
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur quand l'utilisateur commence à taper
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleReset = () => {
    setFormData({
      nom: '',
      description: '',
      ville: '',
      pays: 'Sénégal',
      telephoneFixe: '',
      email: '',
      lat: '',
      lng: ''
    });
    setErrors({});
    setSuccess(false);
  };

  return (
    <Box>
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Structure ajoutée avec succès ! Elle est maintenant en attente de confirmation.
        </Alert>
      )}

      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <LocalHospital sx={{ mr: 1, color: 'primary.main' }} />
            Ajouter une nouvelle structure de santé
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Remplissez le formulaire ci-dessous pour ajouter une nouvelle structure à la cartographie.
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  label="Nom de la structure *"
                  value={formData.nom}
                  onChange={(e) => handleChange('nom', e.target.value)}
                  error={!!errors.nom}
                  helperText={errors.nom}
                  placeholder="Ex: Hôpital Central de Dakar"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Ville"
                  value={formData.ville}
                  onChange={(e) => handleChange('ville', e.target.value)}
                  placeholder="Ex: Dakar"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Description des services offerts..."
                  helperText="Décrivez les services VIH disponibles dans cette structure"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Téléphone"
                  value={formData.telephoneFixe}
                  onChange={(e) => handleChange('telephoneFixe', e.target.value)}
                  placeholder="Ex: +221 33 123 45 67"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="Ex: contact@hopital.sn"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  label="Latitude *"
                  type="number"
                  value={formData.lat}
                  onChange={(e) => handleChange('lat', e.target.value)}
                  error={!!errors.lat}
                  helperText={errors.lat || "Coordonnée latitude (-90 à 90)"}
                  placeholder="Ex: 14.6928"
                  step="0.0001"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  label="Longitude *"
                  type="number"
                  value={formData.lng}
                  onChange={(e) => handleChange('lng', e.target.value)}
                  error={!!errors.lng}
                  helperText={errors.lng || "Coordonnée longitude (-180 à 180)"}
                  placeholder="Ex: -17.4467"
                  step="0.0001"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Pays"
                  value={formData.pays}
                  onChange={(e) => handleChange('pays', e.target.value)}
                  disabled
                  helperText="Pays par défaut : Sénégal"
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<Save />}
                disabled={!formData.nom.trim() || !formData.lat || !formData.lng}
              >
                Ajouter la structure
              </Button>

              <Button
                variant="outlined"
                size="large"
                startIcon={<Cancel />}
                onClick={handleReset}
              >
                Effacer le formulaire
              </Button>
            </Box>
          </form>

          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              💡 <strong>Astuce :</strong> Vous pouvez également ajouter des structures directement
              en cliquant sur la carte dans l'onglet "Vue Carte".
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AddHospitalForm;