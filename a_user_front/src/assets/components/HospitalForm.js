import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Cancel,
  Person,
  MedicalServices,
  Groups,
  Edit
} from '@mui/icons-material';
import { getTranslation } from '../utils/translations';

// Services disponibles
const AVAILABLE_SERVICES = [
  'Consultation VIH',
  'Dépistage VIH',
  'Traitement ARV',
  'PTME (Prévention Transmission Mère-Enfant)',
  'Suivi biologique',
  'Conseil et soutien psychosocial',
  'Prévention IST',
  'Distribution préservatifs',
  'Prise en charge des infections opportunistes'
];

// Types de prestataires
const PROVIDER_TYPES = [
  { value: 'medecin-pec', label: 'Médecin de PEC', icon: <MedicalServices /> },
  { value: 'assistant-social', label: 'Assistant Social', icon: <Groups /> },
  { value: 'pediatre', label: 'Pédiatre', icon: <Person /> }
];

const HospitalForm = ({ initialData, onSave, language, onCancel }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedServices, setSelectedServices] = useState([]);
  const [providers, setProviders] = useState([]);
  const [currentProvider, setCurrentProvider] = useState({
    type: '',
    nom: '',
    nom_prestataire: '',
    prenom: '',
    specialite: '',
    telephone: '',
    email: ''
  });

  // États pour gérer la modification d'un prestataire
  const [editingProvider, setEditingProvider] = useState(null);
  const [isEditingProvider, setIsEditingProvider] = useState(false);

  // Cache temporaire pour les prestataires par hôpital
  const [hospitalProvidersCache, setHospitalProvidersCache] = useState({});

  const [hospital, setHospital] = useState({
    nom: '',
    pays: '',
    ville: '',
    telephoneFixe: '',
    adresseComplete: '',
    latitude: '',
    longitude: '',
    active: true,
    type: 'hopital'
  });

  const [message, setMessage] = useState('');
  const [phonePrefix, setPhonePrefix] = useState('+221');

  const steps = ['Informations générales', 'Services', 'Prestataires', 'Confirmation'];

  // Fonctions pour gérer le localStorage des prestataires
  const saveProvidersToLocalStorage = (hospitalId, providers) => {
    try {
      const key = `hospital_providers_${hospitalId}`;
      localStorage.setItem(key, JSON.stringify(providers));
      console.log(`💾 Prestataires sauvegardés en localStorage pour l'hôpital ${hospitalId}:`, providers);
    } catch (error) {
      console.error('❌ Erreur sauvegarde localStorage:', error);
    }
  };

  const loadProvidersFromLocalStorage = (hospitalId) => {
    try {
      const key = `hospital_providers_${hospitalId}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        const providers = JSON.parse(saved);
        console.log(`📂 Prestataires chargés depuis localStorage pour l'hôpital ${hospitalId}:`, providers);
        return providers;
      }
    } catch (error) {
      console.error('❌ Erreur chargement localStorage:', error);
    }
    return null;
  };

  const clearProvidersFromLocalStorage = (hospitalId) => {
    try {
      const key = `hospital_providers_${hospitalId}`;
      localStorage.removeItem(key);
      console.log(`🗑️ Prestataires supprimés du localStorage pour l'hôpital ${hospitalId}`);
    } catch (error) {
      console.error('❌ Erreur suppression localStorage:', error);
    }
  };

  const countries = [
    { code: 'Sénégal', prefix: '+221', pattern: /^(\+221)?[0-9]{9}$/, example: '+221 77 123 45 67' },
    { code: 'Gambie', prefix: '+220', pattern: /^(\+220)?[0-9]{7}$/, example: '+220 123 4567' },
    { code: 'Guinée-Bissau', prefix: '+245', pattern: /^(\+245)?[0-9]{7,8}$/, example: '+245 123 4567' },
    { code: 'Autre', prefix: '', pattern: /^\+?[0-9\s\-\(\)]{6,}$/, example: '+XXX XXX XXX' }
  ];

  useEffect(() => {
    if (initialData) {
      const initialHospital = {
        nom: initialData.nom || '',
        pays: initialData.pays || '',
        ville: initialData.ville || '',
        telephoneFixe: initialData.telephoneFixe || '',
        adresseComplete: initialData.adresseComplete || '',
        latitude: initialData.latitude || '',
        longitude: initialData.longitude || '',
        active: initialData.active !== undefined ? initialData.active : true,
        type: initialData.type || 'hopital'
      };

      setHospital(initialHospital);

      // Charger les services existants
      if (initialData.services) {
        setSelectedServices(initialData.services.map(s => s.type || s));
      }

      // Charger les prestataires existants - vérifier d'abord localStorage
      const localStorageProviders = initialData.id ? loadProvidersFromLocalStorage(initialData.id) : null;
      
      if (localStorageProviders && localStorageProviders.length > 0) {
        console.log('📂 Prestataires chargés depuis localStorage:', localStorageProviders);
        setProviders(localStorageProviders);
        // Mettre à jour le cache
        setHospitalProvidersCache(prev => ({
          ...prev,
          [initialData.id]: localStorageProviders
        }));
      } else if (initialData.prestataires) {
        console.log('👥 Prestataires chargés depuis initialData:', initialData.prestataires);
        
        const prestatairesMappes = initialData.prestataires.map(p => {
          // Extraire nom et prénom du nom complet
          const nomComplet = p.nom || '';
          const partiesNom = nomComplet.split(' ');
          const nomPrestataire = p.nom_prestataire || partiesNom[0] || '';
          const prenomPrestataire = p.prenom || partiesNom.slice(1).join(' ') || '';
          
          return {
            id: p.id || Date.now() + Math.random(),
            nom: nomComplet,
            nom_prestataire: p.nom_prestataire || nomPrestataire,
            prenom: p.prenom || prenomPrestataire,
            type: p.type ? p.type.toLowerCase().replace('_', '-') : '',
            specialite: p.specialite || '',
            telephone: p.telephone || '',
            email: p.email || ''
          };
        });
        
        setProviders(prestatairesMappes);
      }

      // Si initialData.prestataires est vide et qu'on a un id, tenter de récupérer les prestataires via l'endpoint /prestataires-only
      if ((!initialData.prestataires || initialData.prestataires.length === 0) && initialData.id) {
        (async () => {
          try {
            const gateway = process.env.REACT_APP_GATEWAY_URL || 'http://localhost:8080';
            const resp = await fetch(`${gateway}/api/hospitaux/${initialData.id}/prestataires-only`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });
            if (resp.ok) {
              const prestOnly = await resp.json();
              console.log('👥 Prestataires récupérés via prestataires-only:', prestOnly);
              if (Array.isArray(prestOnly) && prestOnly.length > 0) {
                const mapped = prestOnly.map(p => ({
                  id: p.id || Date.now() + Math.random(),
                  nom: p.nom || '',
                  nom_prestataire: p.nom_prestataire || p.nom || '',
                  prenom: p.prenom || '',
                  type: p.type ? p.type.toLowerCase().replace('_', '-') : '',
                  specialite: p.specialite || '',
                  telephone: p.telephone || '',
                  email: p.email || ''
                }));
                setProviders(mapped);
                // mettre en cache local
                saveProvidersToLocalStorage(initialData.id, mapped);
                setHospitalProvidersCache(prev => ({ ...prev, [initialData.id]: mapped }));
              }
            } else {
              console.warn('⚠️ prestataires-only a retourné:', resp.status, resp.statusText);
            }
          } catch (e) {
            console.error('❌ Erreur récupération prestataires-only:', e);
          }
        })();
      }

      const country = countries.find(c => c.code === initialHospital.pays);
      if (country) {
        setPhonePrefix(country.prefix);
      }
    }
    setMessage('');
  }, [initialData]);

  // Fonctions pour la gestion des services
  const handleServiceToggle = (service) => {
    setSelectedServices(prev =>
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  // Fonctions pour la gestion des prestataires
  const handleAddProvider = () => {
    if (currentProvider.type && currentProvider.nom_prestataire && currentProvider.prenom) {
      let updatedProviders;
      
      if (isEditingProvider && editingProvider) {
        // Mode modification : mettre à jour le prestataire existant
        updatedProviders = providers.map(p =>
          p.id === editingProvider.id
            ? { ...currentProvider, id: editingProvider.id }
            : p
        );
        setIsEditingProvider(false);
        setEditingProvider(null);
      } else {
        // Mode ajout : ajouter un nouveau prestataire
        updatedProviders = [...providers, { ...currentProvider, id: Date.now() }];
      }
      
      setProviders(updatedProviders);
      
      // Sauvegarder automatiquement en localStorage si on a un ID d'hôpital
      if (initialData?.id) {
        saveProvidersToLocalStorage(initialData.id, updatedProviders);
        console.log('💾 Prestataires sauvegardés automatiquement lors de l\'ajout/modification');
      }
      
      setCurrentProvider({ type: '', nom: '', nom_prestataire: '', prenom: '', specialite: '', telephone: '', email: '' });
    }
  };

  const handleRemoveProvider = (providerId) => {
    const updatedProviders = providers.filter(p => p.id !== providerId);
    setProviders(updatedProviders);
    
    // Sauvegarder automatiquement en localStorage si on a un ID d'hôpital
    if (initialData?.id) {
      saveProvidersToLocalStorage(initialData.id, updatedProviders);
      console.log('💾 Prestataires sauvegardés automatiquement lors de la suppression');
    }
  };

  // Fonction pour démarrer la modification d'un prestataire
  const handleEditProvider = (provider) => {
    setEditingProvider(provider);
    setIsEditingProvider(true);

    // Extraire nom et prénom du nom complet si nécessaire
    const nomComplet = provider.nom || '';
    const partiesNom = nomComplet.split(' ');
    const nomPrestataire = provider.nom_prestataire || partiesNom[0] || '';
    const prenomPrestataire = provider.prenom || partiesNom.slice(1).join(' ') || '';

    setCurrentProvider({
      type: provider.type || '',
      nom: nomComplet,
      nom_prestataire: nomPrestataire,
      prenom: prenomPrestataire,
      specialite: provider.specialite || '',
      telephone: provider.telephone || '',
      email: provider.email || ''
    });
  };

  // Fonction pour annuler la modification
  const handleCancelEditProvider = () => {
    setIsEditingProvider(false);
    setEditingProvider(null);
    setCurrentProvider({ type: '', nom: '', nom_prestataire: '', prenom: '', specialite: '', telephone: '', email: '' });
  };

  // Fonction pour recharger un prestataire (bouton recharger)
  const handleReloadProvider = () => {
    if (editingProvider) {
      const provider = providers.find(p => p.id === editingProvider.id);
      if (provider) {
        handleEditProvider(provider);
      }
    }
  };

  const handleProviderChange = (field, value) => {
    setCurrentProvider(prev => {
      const updated = { ...prev, [field]: value };

      // Génération automatique des valeurs cachées
      if (field === 'type') {
        // Générer la spécialité automatiquement
        let specialite = '';
        if (value === 'assistant-social') {
          specialite = 'Sociologue';
        } else if (value === 'pediatre') {
          specialite = 'Pédiatre';
        } else if (value === 'medecin-pec') {
          specialite = 'Généraliste';
        }
        updated.specialite = specialite;
      }

      // Générer le nom complet et l'email quand le prénom ou nom_prestataire change
      if ((field === 'prenom' || field === 'nom_prestataire') && updated.type) {
        const nomPrestataire = (updated.nom_prestataire || '').trim();
        const prenomPrestataire = (updated.prenom || '').trim();

        if (nomPrestataire && prenomPrestataire) {
          updated.nom = `${nomPrestataire} ${prenomPrestataire}`;

          // Générer l'email basé sur le nom du prestataire
          const emailBase = `${nomPrestataire.toLowerCase()}.${prenomPrestataire.toLowerCase()}`;
          updated.email = `${emailBase}@gmail.com`;
        }
      }

      return updated;
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'pays') {
      const country = countries.find(c => c.code === value);
      if (country) {
        setPhonePrefix(country.prefix);
      }
      setHospital(prev => ({
        ...prev,
        [name]: value,
        telephoneFixe: ''
      }));
    } else {
      setHospital(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    if (message) setMessage('');
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value && !value.startsWith(phonePrefix.replace('+', ''))) {
      value = phonePrefix.replace('+', '') + value;
    }

    setHospital(prev => ({
      ...prev,
      telephoneFixe: value
    }));

    if (message) setMessage('');
  };

  // Navigation dans les étapes
  const handleNext = () => {
    // Vérifier que tous les champs requis sont remplis
    if (activeStep === 0) {
      // Étape 0: Informations établissement - nom doit être rempli
      if (!validateStep1()) return;
    } else if (activeStep === 1) {
      // Étape 1: Services - au moins un service doit être sélectionné
      if (selectedServices.length === 0) {
        setMessage("Veuillez sélectionner au moins un service");
        return;
      }
    } else if (activeStep === 2) {
      // Étape 2: Prestataires - au moins un prestataire doit être ajouté
      if (providers.length === 0) {
        setMessage("Veuillez ajouter au moins un prestataire");
        return;
      }
    }

    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const validateStep1 = () => {
    if (!hospital.nom || !hospital.pays || !hospital.ville) {
      setMessage("❌ Veuillez remplir tous les champs obligatoires (*).");
      return false;
    }
    return true;
  };

  const validateForm = () => {
    return validateStep1();
  };

  // Fonction pour vérifier si on peut passer à l'étape suivante
  const canProceedToNext = () => {
    if (activeStep === 0) {
      return hospital.nom.trim() !== '' && hospital.pays.trim() !== '' && hospital.ville.trim() !== '';
    } else if (activeStep === 1) {
      return selectedServices.length > 0;
    } else if (activeStep === 2) {
      return providers.length > 0;
    }
    return true;
  };

  // Fonction utilitaire pour convertir les types vers l'enum
  const convertToEnumType = (type) => {
    const typeMap = {
      'medecin-pec': 'MEDECIN_PEC',
      'assistant-social': 'ASSISTANT_SOCIAL',
      'pediatre': 'PEDIATRE'
    };
    return typeMap[type] || 'MEDECIN_PEC';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const payload = {
        ...hospital,
        telephoneFixe: hospital.telephoneFixe || '',
        latitude: hospital.latitude ? parseFloat(hospital.latitude) : null,
        longitude: hospital.longitude ? parseFloat(hospital.longitude) : null,
        // Ajouter les services et prestataires
        services: selectedServices.map(serviceName => ({
          type: serviceName,
          nomPrestataire: "",
          typePrestataire: "",
          specialitePrestataire: "",
          contactPrestataire: ""
        })),
        prestataires: providers.map(provider => ({
          nom: provider.nom,
          type: convertToEnumType(provider.type),
          specialite: provider.specialite || '',
          telephone: provider.telephone || '',
          email: provider.email || ''
        }))
      };

      if (onSave) {
        await onSave(payload);
        setMessage('✅ Hôpital enregistré avec succès !');
      }
    } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error);
      setMessage("❌ Erreur lors de l'enregistrement de l'hôpital.");
    }
  };

  // Rendu des différentes étapes
  const renderStepContent = (step) => {
    switch (step) {
      case 0: // Informations générales
        return (
          <Box className="space-y-6">
            <Typography variant="h6" gutterBottom>
              📋 Informations générales
            </Typography>

            {message && (
              <Alert severity={message.includes('✅') ? "success" : "error"}>
                {message}
              </Alert>
            )}

            <TextField
              fullWidth
              label="🏥 Nom de l'établissement *"
              name="nom"
              value={hospital.nom}
              onChange={handleChange}
              required
            />

            <Box display="flex" gap={2}>
              <FormControl fullWidth>
                <InputLabel>🇺🇳 Pays *</InputLabel>
                <Select
                  name="pays"
                  value={hospital.pays}
                  onChange={handleChange}
                  label="Pays *"
                  required
                >
                  <MenuItem value="">Choisir un pays</MenuItem>
                  {countries.filter(c => c.code !== 'Autre').map(country => (
                    <MenuItem key={country.code} value={country.code}>
                      {country.code} {country.prefix}
                    </MenuItem>
                  ))}
                  <MenuItem value="Autre">🌍 Autre</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="🏙️ Ville *"
                name="ville"
                value={hospital.ville}
                onChange={handleChange}
                required
              />
            </Box>

            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                label="📞 Téléphone"
                value={hospital.telephoneFixe.replace(phonePrefix, '')}
                onChange={handlePhoneChange}
                placeholder={countries.find(c => c.code === hospital.pays)?.example || '+221 77 123 45 67'}
              />

              <FormControl fullWidth>
                <InputLabel>Type d'établissement</InputLabel>
                <Select
                  name="type"
                  value={hospital.type}
                  onChange={handleChange}
                  label="Type d'établissement"
                >
                  <MenuItem value="hopital">Hôpital</MenuItem>
                  <MenuItem value="clinique">Clinique</MenuItem>
                  <MenuItem value="centre-sante">Centre de Santé</MenuItem>
                  <MenuItem value="dispensaire">Dispensaire</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="📍 Adresse complète"
              name="adresseComplete"
              value={hospital.adresseComplete}
              onChange={handleChange}
            />

            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                label="Latitude"
                name="latitude"
                type="number"
                value={hospital.latitude}
                onChange={handleChange}
                placeholder="Ex: 14.6928"
              />
              <TextField
                fullWidth
                label="Longitude"
                name="longitude"
                type="number"
                value={hospital.longitude}
                onChange={handleChange}
                placeholder="Ex: -17.4467"
              />
            </Box>
          </Box>
        );

      case 1: // Services
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Services disponibles
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Sélectionnez les services proposés par cet établissement
            </Typography>

            <List>
              {AVAILABLE_SERVICES.map((service) => (
                <ListItem key={service} button onClick={() => handleServiceToggle(service)}>
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={selectedServices.includes(service)}
                      tabIndex={-1}
                      disableRipple
                    />
                  </ListItemIcon>
                  <ListItemText primary={service} />
                </ListItem>
              ))}
            </List>
          </Box>
        );

      case 2: // Prestataires
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Prestataires
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Ajoutez les prestataires qui travaillent dans cet établissement
            </Typography>

            {/* Formulaire d'ajout/modification d'un prestataire */}
            <Box sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ mb: 0 }}>
                  {isEditingProvider ? 'Modifier le prestataire' : 'Ajouter un prestataire'}
                </Typography>
                {isEditingProvider && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="secondary"
                    onClick={handleCancelEditProvider}
                    sx={{ minWidth: 'auto', px: 2 }}
                  >
                    Annuler
                  </Button>
                )}
              </Box>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Type de prestataire</InputLabel>
                <Select
                  value={currentProvider.type}
                  label="Type de prestataire"
                  onChange={(e) => handleProviderChange('type', e.target.value)}
                >
                  {PROVIDER_TYPES.map((provider) => (
                    <MenuItem key={provider.value} value={provider.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {provider.icon}
                        {provider.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Champ nom_prestataire visible */}
              <TextField
                fullWidth
                label="Nom du prestataire"
                value={currentProvider.nom_prestataire || ''}
                onChange={(e) => handleProviderChange('nom_prestataire', e.target.value)}
                sx={{ mb: 2 }}
                placeholder="Ex: Diop"
              />

              {/* Champ prénom visible */}
              <TextField
                fullWidth
                label="Prénom du prestataire"
                value={currentProvider.prenom || ''}
                onChange={(e) => handleProviderChange('prenom', e.target.value)}
                sx={{ mb: 2 }}
                placeholder="Ex: Marie"
              />

              {/* Champs cachés - générés automatiquement */}
              <input type="hidden" value={currentProvider.nom} />
              <input type="hidden" value={currentProvider.specialite} />
              <input type="hidden" value={currentProvider.email} />

              {/* Champs visibles */}
              <TextField
                fullWidth
                label="Téléphone (optionnel)"
                value={currentProvider.telephone || ''}
                onChange={(e) => handleProviderChange('telephone', e.target.value)}
                sx={{ mb: 2 }}
                placeholder="Ex: +221 XX XXX XX XX"
              />

              <Button
                variant="outlined"
                onClick={handleAddProvider}
                disabled={!currentProvider.type || !currentProvider.nom_prestataire || !currentProvider.prenom}
                sx={{ mt: 2 }}
                color={isEditingProvider ? 'primary' : 'default'}
              >
                {isEditingProvider ? 'Mettre à jour le prestataire' : 'Ajouter le prestataire'}
              </Button>

              {/* Récapitulatif des valeurs générées automatiquement */}
              {currentProvider.type && currentProvider.nom_prestataire && currentProvider.prenom && (
                <Box sx={{ mt: 2, p: 2, bgcolor: isEditingProvider ? 'primary.50' : 'grey.100', borderRadius: 1, border: isEditingProvider ? '1px solid' : 'none', borderColor: 'primary.main' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight="bold">
                      📋 {isEditingProvider ? 'Modification en cours - ' : ''}Récapitulatif des valeurs générées automatiquement :
                    </Typography>
                    {isEditingProvider && (
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={handleReloadProvider}
                        sx={{ minWidth: 'auto', px: 2, py: 0.5 }}
                      >
                        🔄 Recharger
                      </Button>
                    )}
                  </Box>
                  <Typography variant="body2">
                    <strong>Nom complet :</strong> {currentProvider.nom}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Spécialité :</strong> {currentProvider.specialite}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Email :</strong> {currentProvider.email}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Récapitulatif des prestataires ajoutés */}
            <Box sx={{ mt: 3, border: 1, borderColor: 'divider', borderRadius: 1, p: 2 }}>
              <Typography variant="h6" gutterBottom>
                📋 Récapitulatif des prestataires ({providers.length})
              </Typography>

              {providers.length === 0 ? (
                <Alert severity="warning">
                  ⚠️ Aucun prestataire ajouté. Veuillez ajouter au moins un prestataire pour continuer.
                </Alert>
              ) : (
                <List>
                  {providers.map((provider) => {
                    const providerType = PROVIDER_TYPES.find(p => p.value === provider.type);
                    return (
                        <ListItem
                        key={provider.id}
                        secondaryAction={
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              edge="end"
                              onClick={() => handleEditProvider(provider)}
                              color="primary"
                              size="small"
                              title="Modifier ce prestataire"
                            >
                              <Edit />
                            </IconButton>
                            <IconButton
                              edge="end"
                              onClick={() => handleRemoveProvider(provider.id)}
                              color="error"
                              size="small"
                              title="Supprimer ce prestataire"
                            >
                              <Cancel />
                            </IconButton>
                          </Box>
                        }
                        sx={{
                          border: 1,
                          borderColor: isEditingProvider && editingProvider?.id === provider.id ? 'primary.main' : 'divider',
                          borderRadius: 1,
                          mb: 1,
                          bgcolor: isEditingProvider && editingProvider?.id === provider.id ? 'primary.50' : 'transparent'
                        }}
                      >
                        <ListItemIcon>
                          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                            {providerType?.icon}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" fontWeight="bold">
                              {provider.nom}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="primary">
                                {providerType?.label}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Spécialité: {provider.specialite}
                              </Typography>
                              {provider.telephone && (
                                <Typography variant="body2" color="text.secondary">
                                  📞 {provider.telephone}
                                </Typography>
                              )}
                              <Typography variant="body2" color="text.secondary">
                                📧 {provider.email}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </Box>

            {/* Récapitulatif final */}
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Récapitulatif complet
                </Typography>
                <Typography variant="body2">
                  <strong>Services sélectionnés:</strong> {selectedServices.length}
                </Typography>
                <Typography variant="body2">
                  <strong>Prestataires ajoutés:</strong> {providers.length}
                </Typography>
                <Typography variant="body2">
                  <strong>Établissement:</strong> {hospital.nom || 'Non défini'}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        );

      case 3: // Confirmation
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Confirmation
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Vérifiez les informations avant de finaliser l'enregistrement
            </Alert>

            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Informations générales</Typography>
                <Typography><strong>Nom:</strong> {hospital.nom}</Typography>
                <Typography><strong>Pays:</strong> {hospital.pays}</Typography>
                <Typography><strong>Ville:</strong> {hospital.ville}</Typography>
                <Typography><strong>Type:</strong> {hospital.type}</Typography>
                {hospital.telephoneFixe && (
                  <Typography><strong>Téléphone:</strong> {hospital.telephoneFixe}</Typography>
                )}
              </CardContent>
            </Card>

            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Services sélectionnés</Typography>
                <Typography><strong>Nombre:</strong> {selectedServices.length}</Typography>
                <ul>
                  {selectedServices.map(service => (
                    <li key={service}>{service}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Prestataires ajoutés</Typography>
                <Typography><strong>Nombre:</strong> {providers.length}</Typography>
                <ul>
                  {providers.map(provider => (
                    <li key={provider.id}>{provider.nom} ({PROVIDER_TYPES.find(p => p.value === provider.type)?.label})</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box className="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
      <Typography variant="h4" gutterBottom>
        {initialData ? "🏥 Modifier l'établissement" : "🏥 Nouvel établissement"}
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mt: 2, mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <form onSubmit={handleSubmit}>
        {renderStepContent(activeStep)}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            onClick={activeStep === 0 ? onCancel : handleBack}
          >
            {activeStep === 0 ? 'Annuler' : 'Retour'}
          </Button>

          <Box>
            {activeStep < steps.length - 1 ? (
              <Button 
                variant="contained" 
                onClick={handleNext}
                disabled={!canProceedToNext()}
              >
                Suivant
              </Button>
            ) : (
              <Button variant="contained" type="submit">
                {initialData ? 'Modifier' : 'Enregistrer'}
              </Button>
            )}
          </Box>
        </Box>
      </form>
    </Box>
  );
};

export default HospitalForm;