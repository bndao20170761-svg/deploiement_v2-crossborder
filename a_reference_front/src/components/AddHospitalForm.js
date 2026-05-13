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
import { getTranslation } from '../utils/translations';

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
      newErrors.nom = getTranslation('errorNameRequired', language);
    }

    if (!formData.lat) {
      newErrors.lat = getTranslation('errorLatRequired', language);
    } else if (isNaN(formData.lat) || formData.lat < -90 || formData.lat > 90) {
      newErrors.lat = getTranslation('errorLatInvalid', language);
    }

    if (!formData.lng) {
      newErrors.lng = getTranslation('errorLngRequired', language);
    } else if (isNaN(formData.lng) || formData.lng < -180 || formData.lng > 180) {
      newErrors.lng = getTranslation('errorLngInvalid', language);
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
          {getTranslation('addHospitalSuccess', language)}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <LocalHospital sx={{ mr: 1, color: 'primary.main' }} />
            {getTranslation('addHospitalTitle', language)}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {getTranslation('addHospitalSubtitle', language)}
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  label={getTranslation('fieldFacilityNameRequired', language)}
                  value={formData.nom}
                  onChange={(e) => handleChange('nom', e.target.value)}
                  error={!!errors.nom}
                  helperText={errors.nom}
                  placeholder={getTranslation('fieldFacilityNamePlaceholderForm', language)}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={getTranslation('fieldCityForm', language)}
                  value={formData.ville}
                  onChange={(e) => handleChange('ville', e.target.value)}
                  placeholder={getTranslation('fieldCityPlaceholderForm', language)}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label={getTranslation('fieldDescription', language)}
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder={getTranslation('fieldDescriptionPlaceholder', language)}
                  helperText={getTranslation('fieldDescriptionHelper', language)}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={getTranslation('fieldPhoneForm', language)}
                  value={formData.telephoneFixe}
                  onChange={(e) => handleChange('telephoneFixe', e.target.value)}
                  placeholder={getTranslation('fieldPhonePlaceholderForm', language)}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={getTranslation('fieldEmail', language)}
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder={getTranslation('fieldEmailPlaceholder', language)}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  label={getTranslation('fieldLatitude', language)}
                  type="number"
                  value={formData.lat}
                  onChange={(e) => handleChange('lat', e.target.value)}
                  error={!!errors.lat}
                  helperText={errors.lat || getTranslation('fieldLatitudeHelper', language)}
                  placeholder={getTranslation('fieldLatitudePlaceholder', language)}
                  step="0.0001"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  label={getTranslation('fieldLongitude', language)}
                  type="number"
                  value={formData.lng}
                  onChange={(e) => handleChange('lng', e.target.value)}
                  error={!!errors.lng}
                  helperText={errors.lng || getTranslation('fieldLongitudeHelper', language)}
                  placeholder={getTranslation('fieldLongitudePlaceholder', language)}
                  step="0.0001"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={getTranslation('fieldCountryForm', language)}
                  value={formData.pays}
                  onChange={(e) => handleChange('pays', e.target.value)}
                  disabled
                  helperText={getTranslation('fieldCountryHelper', language)}
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
                {getTranslation('btnAddFacility', language)}
              </Button>

              <Button
                variant="outlined"
                size="large"
                startIcon={<Cancel />}
                onClick={handleReset}
              >
                {getTranslation('btnClearForm', language)}
              </Button>
            </Box>
          </form>

          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary"
              dangerouslySetInnerHTML={{ __html: getTranslation('formTip', language) }}
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AddHospitalForm;