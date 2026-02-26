// src/components/CartographyMap.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { createHospital, toggleHospitalStatus } from '../services/hospitalService';
import {  updateHopital} from '../services/hopitalService';

import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Button,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Stepper,
  Step,
  StepLabel,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Avatar,
  MenuItem,
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material';

import {
  AddLocation,
  MyLocation,
  ZoomIn,
  ZoomOut,
  Save,
  Cancel,
  LocalHospital,
  Satellite,
  Terrain,
  Person,
  MedicalServices,
  Groups,
  Map as MapIcon,
  GpsFixed,
  Edit
} from '@mui/icons-material';

// Configuration de la carte
const mapContainerStyle = {
  width: '100%',
  height: '120%'
};

// Centre sur le Sénégal
const defaultCenter = {
  lat: 14.4974,  // Centre du Sénégal
  lng: -14.4524  // Centre du Sénégal
};

// Zoom pour voir tout le pays
const DEFAULT_ZOOM = 7; // Zoom pour voir tout le Sénégal

const ICONS = {
  confirmed: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
  pending: 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png',

    inactive: "http://maps.google.com/mapfiles/ms/icons/purple-dot.png",
    active: "http://maps.google.com/mapfiles/ms/icons/red-dot.png", // ✅ violet pour actifs
    user: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",


  user: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
  current: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
};

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

const GOOGLE_MAPS_API_KEY = 'AIzaSyAF89Nvk0ymdkSjMWv_2t-TYrfx43mF_YQ';

// Vérification de la clé API
if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_API_KEY_HERE') {
  console.error('❌ Clé API Google Maps manquante ou invalide');
}

// Constante pour éviter la recréation du tableau à chaque render
const GOOGLE_MAPS_LIBRARIES = ['places', 'geometry'];

const CartographyMap = ({ hospitals, onHospitalUpdate, onHospitalAdd, language = 'fr' }) => {
  const [map, setMap] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [clickedPosition, setClickedPosition] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [mapType, setMapType] = useState('roadmap');
   const [zoomLevel, setZoomLevel] = useState(DEFAULT_ZOOM);
  const [geocoding, setGeocoding] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [locationInfo, setLocationInfo] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);


  // Nouveaux états pour le système d'étapes
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

  // État pour gérer la modification d'un prestataire
  const [editingProvider, setEditingProvider] = useState(null);
  const [isEditingProvider, setIsEditingProvider] = useState(false);

  // Cache temporaire pour les prestataires par hôpital
  const [hospitalProvidersCache, setHospitalProvidersCache] = useState({});

  const [hospitalForm, setHospitalForm] = useState({
    nom: '',
    description: '',
    ville: '',
    pays: '',
    telephoneFixe: '',
    type: 'hopital',
    latitude: 0,
    longitude: 0
  });

  // Helper to safely convert coordinates to numbers (returns null if invalid)
  const toNumber = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  // 🔥 NOUVEAUX ÉTATS POUR LA MODIFICATION
  const [editingHospital, setEditingHospital] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Steps pour le stepper
  const steps = ['Informations établissement', 'Services disponibles', 'Prestataires'];

  // ✅ AJOUT DU LOG DE DEBUG POUR LES HÔPITAUX REÇUS
  useEffect(() => {
    console.log('🔍 Hôpitaux reçus dans CartographyMap:', hospitals);
    hospitals.forEach((h, index) => {
      console.log(`🏥 Hôpital ${index + 1}:`, h.nom);
      console.log(`   Services:`, h.services);
      console.log(`   Prestataires dans services:`, h.services?.filter(s => s.nomPrestataire));
    });
  }, [hospitals]);

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

  // Fonction utilitaire pour nettoyer tout le localStorage des prestataires
  const clearAllProvidersFromLocalStorage = () => {
    try {
      const keys = Object.keys(localStorage);
      const providerKeys = keys.filter(key => key.startsWith('hospital_providers_'));
      providerKeys.forEach(key => localStorage.removeItem(key));
      console.log(`🗑️ Tous les prestataires supprimés du localStorage (${providerKeys.length} entrées)`);
    } catch (error) {
      console.error('❌ Erreur suppression complète localStorage:', error);
    }
  };

  // Effet pour charger les prestataires depuis localStorage au démarrage
  useEffect(() => {
    if (hospitals.length > 0) {
      const newCache = {};
      hospitals.forEach(hospital => {
        const savedProviders = loadProvidersFromLocalStorage(hospital.id);
        if (savedProviders && savedProviders.length > 0) {
          newCache[hospital.id] = savedProviders;
          console.log(`📂 Prestataires chargés au démarrage pour ${hospital.nom}:`, savedProviders);
        }
      });
      
      if (Object.keys(newCache).length > 0) {
        setHospitalProvidersCache(prev => ({ ...prev, ...newCache }));
      }
    }
  }, [hospitals]);

  useEffect(() => {
    // Si la carte est déjà prête, localiser immédiatement
    if (map) {
      locateUser();
    }
  }, [map]);
 // <-- dépend de map pour s'assurer que la carte est chargée

  const locateUser = useCallback(() => {
    if (!map || !navigator.geolocation) return;

    setLoadingLocation(true);

    // Utiliser watchPosition pour une géolocalisation continue et précise
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const userLoc = { lat: latitude, lng: longitude };

        console.log('📍 Position détectée:', latitude, longitude, `Précision: ${accuracy}m`);

        // Arrêter le watch après avoir obtenu une position précise
        if (accuracy <= 20) {
          navigator.geolocation.clearWatch(watchId);
        }

        setUserLocation(userLoc);
        setShowUserInfo(false);

        if (map) {
          // Centrer d'abord sur la position
          map.panTo(userLoc);

          // Zoom progressif après un court délai
          setTimeout(() => {
            // Zoom adaptatif selon la précision
            const zoomLevel = accuracy < 10 ? 19 : accuracy < 20 ? 18 : accuracy < 50 ? 17 : accuracy < 100 ? 16 : 15;
            map.setZoom(zoomLevel);
            setLoadingLocation(false);
          }, 1000);
        }
      },
      (error) => {
        console.error('Erreur géolocalisation:', error);
        navigator.geolocation.clearWatch(watchId);
        setLoadingLocation(false);

        // Fallback vers getCurrentPosition si watchPosition échoue
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const userLoc = { lat: latitude, lng: longitude };

          setUserLocation(userLoc);
          setShowUserInfo(false);

            if (map) {
              map.panTo(userLoc);
              setTimeout(() => {
              map.setZoom(15);
          setLoadingLocation(false);
              }, 1000);
            }
        },
          (fallbackError) => {
            console.error('Erreur fallback géolocalisation:', fallbackError);
          setLoadingLocation(false);

            const senegalCenter = { lat: 14.4974, lng: -14.4524 };
            setUserLocation(senegalCenter);
          setShowUserInfo(true);

          if (map) {
              map.panTo(senegalCenter);
              map.setZoom(DEFAULT_ZOOM);
          }
        },
        {
          enableHighAccuracy: true,
            timeout: 15000, // Réduire de 30s à 15s
            maximumAge: 0
          }
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // Réduire de 30s à 15s
          maximumAge: 0
        }
      );
    }, [map]);

  useEffect(() => {
    if (map) locateUser();
  }, [map, locateUser]);



  const onMapLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
    setMapLoaded(true);

    // Initialiser le géocodage
    if (window.google) {
      setGeocoding(new window.google.maps.Geocoder());
    }
  }, []);

  const onLoadError = useCallback((error) => {
    console.error('Erreur Google Maps:', error);
    console.error('Détails de l\'erreur:', {
      message: error.message,
      type: error.type,
      target: error.target,
      currentTarget: error.currentTarget
    });
    
    setMapError(error);
    setMapLoaded(false);
    
    // Retry automatique après 3 secondes (max 3 tentatives)
    if (retryCount < 3) {
      console.log(`🔄 Tentative de reconnexion ${retryCount + 1}/3 dans 3 secondes...`);
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setMapError(null);
      }, 3000);
    } else {
      console.error('❌ Échec du chargement de Google Maps après 3 tentatives');
    }
  }, [retryCount]);

  // Géocodage inverse pour obtenir l'adresse depuis les coordonnées
  const getAddressFromCoords = async (lat, lng) => {
    if (!geocoding) return null;

    try {
      const response = await geocoding.geocode({ location: { lat, lng } });
      if (response.results[0]) {
        return response.results[0];
      }
    } catch (error) {
      console.error('Erreur géocodage:', error);
    }
    return null;
  };

  // Extraire ville et pays de l'adresse
  const extractLocationInfo = (addressComponents) => {
    let ville = '';
    let pays = '';

    addressComponents.forEach(component => {
      if (component.types.includes('locality')) {
        ville = component.long_name;
      }
      if (component.types.includes('country')) {
        pays = component.long_name;
      }
    });

    return { ville, pays };
  };


   // Gestion du clic sur la carte
   const onMapClick = useCallback(async (event) => {
     const lat = event.latLng.lat();
     const lng = event.latLng.lng();

    // Vérifier si le clic est à la position utilisateur
    if (userLocation &&
        Math.abs(lat - userLocation.lat) < 0.0001 &&
        Math.abs(lng - userLocation.lng) < 0.0001) {

      // Clic à la position utilisateur - vérifier s'il y a un hôpital
      const existingHospital = hospitals.find(h =>
        h.latitude && h.longitude &&
        Math.abs(h.latitude - userLocation.lat) < 0.0001 &&
        Math.abs(h.longitude - userLocation.lng) < 0.0001
      );

      if (existingHospital) {
        // Afficher les détails de l'hôpital existant
        setSelectedHospital(existingHospital);
        return;
      } else {
        // Demander confirmation pour ajouter un établissement
        const confirmAdd = window.confirm("Voulez-vous ajouter un établissement de santé à votre position actuelle ?\n\nCliquez sur OK pour ajouter, ou Annuler pour sortir.");

        if (!confirmAdd) {
          console.log("Ajout annulé par l'utilisateur");
          return;
        }
      }
    } else {
      // Clic ailleurs sur la carte
     const confirmAdd = window.confirm("Voulez-vous ajouter un établissement à cet emplacement ?\n\nCliquez sur OK pour ajouter, ou Annuler pour sortir.");

     if (!confirmAdd) {
       console.log("Ajout annulé par l'utilisateur");
        return;
      }
     }

     setClickedPosition({ lat, lng });
     setLoadingLocation(true);

    // Réinitialisation du formulaire et des étapes
    setActiveStep(0);
    setSelectedServices([]);
    setProviders([]);
    setCurrentProvider({ type: '', nom: '', nom_prestataire: '', prenom: '', specialite: '', telephone: '', email: '' });

     const addressResult = await getAddressFromCoords(lat, lng);

     if (addressResult) {
       const locationInfo = extractLocationInfo(addressResult.address_components);
       setLocationInfo({
         ...locationInfo,
         adresseComplete: addressResult.formatted_address,
         latitude: lat,
         longitude: lng
       });

       setHospitalForm(prev => ({
         ...prev,
         ville: locationInfo.ville || '',
         pays: locationInfo.pays || 'Sénégal',
         latitude: lat,
         longitude: lng,
         nom: locationInfo.ville ? `Nouvelle Structure - ${locationInfo.ville}` : 'Nouvelle Structure'
       }));
     } else {
       setLocationInfo({
         ville: 'Ville inconnue',
         pays: 'Sénégal',
         adresseComplete: `Position: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
         latitude: lat,
         longitude: lng
       });

       setHospitalForm(prev => ({
         ...prev,
         latitude: lat,
         longitude: lng,
         nom: 'Nouvelle Structure'
       }));
    }

       setShowAddDialog(true);
    setLoadingLocation(false);
  }, [geocoding, userLocation, hospitals]);

  // ✅ AJOUT DES LOGS DE DEBUG DANS onMarkerClick
  const onMarkerClick = useCallback((hospital) => {
    console.log('🏥 Hôpital cliqué:', hospital);
    console.log('📋 Services dans l\'hôpital:', hospital.services);
    console.log('👥 Prestataires dans les services:', hospital.services?.filter(s => s.nomPrestataire));
    setSelectedHospital(hospital);
  }, []);

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
      
      // Sauvegarder automatiquement en localStorage si on est en mode édition
      if (isEditMode && editingHospital) {
        saveProvidersToLocalStorage(editingHospital.id, updatedProviders);
        console.log('💾 Prestataires sauvegardés automatiquement lors de l\'ajout/modification');
      }
      
      setCurrentProvider({ type: '', nom: '', nom_prestataire: '', prenom: '', specialite: '', telephone: '', email: '' });
    }
  };

  const handleRemoveProvider = (providerId) => {
    const updatedProviders = providers.filter(p => p.id !== providerId);
    setProviders(updatedProviders);
    
    // Sauvegarder automatiquement en localStorage si on est en mode édition
    if (isEditMode && editingHospital) {
      saveProvidersToLocalStorage(editingHospital.id, updatedProviders);
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

  // Navigation dans les étapes
  const handleNext = () => {
    // Vérifier que tous les champs requis sont remplis
    if (activeStep === 0) {
      // Étape 0: Informations établissement - nom doit être rempli
      if (!hospitalForm.nom.trim()) {
        alert("Veuillez remplir le nom de l'établissement");
        return;
      }
    } else if (activeStep === 1) {
      // Étape 1: Services - au moins un service doit être sélectionné
      if (selectedServices.length === 0) {
        alert("Veuillez sélectionner au moins un service");
        return;
      }
    } else if (activeStep === 2) {
      // Étape 2: Prestataires - au moins un prestataire doit être ajouté
      if (providers.length === 0) {
        alert("Veuillez ajouter au moins un prestataire");
        return;
      }
    }

    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  // Fonction pour vérifier si on peut passer à l'étape suivante
  const canProceedToNext = () => {
    if (activeStep === 0) {
      return hospitalForm.nom.trim() !== '';
    } else if (activeStep === 1) {
      return selectedServices.length > 0;
    } else if (activeStep === 2) {
      return providers.length > 0;
    }
    return true;
  };

// Ajoutez cette fonction
const fitMapToHospitals = useCallback(() => {
  if (!map || hospitals.length === 0) return;

  const bounds = new window.google.maps.LatLngBounds();

  hospitals.forEach(hospital => {
    const lat = toNumber(hospital.latitude);
    const lng = toNumber(hospital.longitude);
    if (lat !== null && lng !== null) {
      bounds.extend(new window.google.maps.LatLng(lat, lng));
    }
  });

  // Ajouter aussi la position utilisateur si disponible
  if (userLocation) {
    bounds.extend(new window.google.maps.LatLng(userLocation.lat, userLocation.lng));
  }

  map.fitBounds(bounds);

  // Limiter le zoom maximum pour éviter de trop zoomer
  const listener = window.google.maps.event.addListener(map, 'idle', function() {
    if (map.getZoom() > 15) map.setZoom(15);
    window.google.maps.event.removeListener(listener);
  });
}, [map, hospitals, userLocation]);

// Utilisez-la dans un useEffect
useEffect(() => {
  if (map && hospitals.length > 0) {
    // Attendre un peu que la carte soit complètement chargée
    setTimeout(fitMapToHospitals, 1000);
  }
}, [map, hospitals, fitMapToHospitals]);
// Fonction pour ajouter un établissement à la position utilisateur
// Fonction pour ajouter un établissement à la position utilisateur
const handleAddAtUserLocation = useCallback(async () => {
  if (!userLocation) return;

  // Demander confirmation
  const confirmAdd = window.confirm("Voulez-vous ajouter un établissement à votre position actuelle ?\n\nCliquez sur OK pour ajouter, ou Annuler pour sortir.");

  if (!confirmAdd) {
    console.log("Ajout annulé par l'utilisateur");
    return;
  }

  setLoadingLocation(true);

  try {
    const addressResult = await getAddressFromCoords(userLocation.lat, userLocation.lng);

    if (addressResult) {
      const locationInfo = extractLocationInfo(addressResult.address_components);

      setLocationInfo({
        ...locationInfo,
        adresseComplete: addressResult.formatted_address,
        latitude: userLocation.lat,
        longitude: userLocation.lng
      });

      setHospitalForm(prev => ({
        ...prev,
        ville: locationInfo.ville || 'Ziguinchor',
        pays: locationInfo.pays || 'Sénégal',
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        nom: locationInfo.ville ? `Nouvelle Structure - ${locationInfo.ville}` : 'Nouvelle Structure - Ziguinchor'
      }));
    } else {
      setLocationInfo({
        ville: 'Ziguinchor',
        pays: 'Sénégal',
        adresseComplete: `Position actuelle: ${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}`,
        latitude: userLocation.lat,
        longitude: userLocation.lng
      });

      setHospitalForm(prev => ({
        ...prev,
        ville: 'Ziguinchor',
        pays: 'Sénégal',
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        nom: 'Nouvelle Structure - Ziguinchor'
      }));
    }

    setShowAddDialog(true);
    setShowUserInfo(false);
  } catch (error) {
    console.error('Erreur lors du géocodage:', error);
  } finally {
    setLoadingLocation(false);
  }
}, [userLocation, geocoding]);

  const cancelAdding = () => {
    setClickedPosition(null);
    setShowAddDialog(false);
    setLocationInfo(null);
    setSelectedHospital(null);
      setActiveStep(0);
      setSelectedServices([]);
      setProviders([]);
      setIsEditMode(false);
      setEditingHospital(null);

      // Réinitialiser le formulaire
      setHospitalForm({
        nom: '',
        description: '',
        ville: '',
        pays: '',
        telephoneFixe: '',
        type: 'hopital',
        latitude: 0,
        longitude: 0
      });
    };

// Vérifier les permissions de géolocalisation
useEffect(() => {
  if (!navigator.geolocation) {
    console.warn('La géolocalisation n est pas supportée');
    return;
  }

  // Tester les permissions
  navigator.permissions?.query({ name: 'geolocation' })
    .then(permissionStatus => {
      console.log('Permission géolocation:', permissionStatus.state);
    })
    .catch(console.error);
}, []);

// Fonction utilitaire pour convertir les types vers l'enum
const convertToEnumType = (type) => {
  const typeMap = {
    'medecin-pec': 'MEDECIN_PEC',
    'assistant-social': 'ASSISTANT_SOCIAL',
    'pediatre': 'PEDIATRE'
  };
  return typeMap[type] || 'MEDECIN_PEC';
};

    // 🔥 FONCTION POUR DÉMARRER LA MODIFICATION CORRIGÉE
     const handleEditHospital = async (hospital) => {
       console.log('🔄 Début modification hôpital:', hospital);
       console.log('📋 Services dans l\'hôpital:', hospital.services);
       console.log('👥 Prestataires dans l\'hôpital (champ direct):', hospital.prestataires);
       console.log('🔍 Structure complète de l\'hôpital:', JSON.stringify(hospital, null, 2));

       // ✅ RÉCUPÉRER L'HÔPITAL COMPLET AVEC SES PRESTATAIRES
       try {
         const response = await fetch(`${process.env.REACT_APP_GATEWAY_URL || 'http://localhost:8081'}/api/hospitaux/${hospital.id}/prestataires`, {
           method: 'GET',
           headers: {
             'Content-Type': 'application/json',
             'Authorization': `Bearer ${localStorage.getItem('token')}`
           }
         });

         if (response.ok) {
           const hospitalWithPrestataires = await response.json();
           console.log('🏥 Hôpital complet récupéré:', hospitalWithPrestataires);
           // si l'objet retourné contient la liste des prestataires on remplace l'hôpital
           if (hospitalWithPrestataires && Array.isArray(hospitalWithPrestataires.prestataires) && hospitalWithPrestataires.prestataires.length > 0) {
             console.log('👥 Prestataires dans l\'hôpital récupéré:', hospitalWithPrestataires.prestataires);
             hospital = hospitalWithPrestataires; // Remplacer l'hôpital par la version complète
           } else {
             // fallback: tenter l'endpoint qui retourne seulement les prestataires
             console.warn('⚠️ Aucun prestataire dans la réponse complète, tentative de fallback /prestataires-only');
             const resp2 = await fetch(`${process.env.REACT_APP_GATEWAY_URL || 'http://localhost:8081'}/api/hospitaux/${hospital.id}/prestataires-only`, {
               method: 'GET',
               headers: {
                 'Content-Type': 'application/json',
                 'Authorization': `Bearer ${localStorage.getItem('token')}`
               }
             });
             if (resp2.ok) {
               const prestOnly = await resp2.json();
               console.log('👥 Prestataires-only récupérés:', prestOnly);
               if (Array.isArray(prestOnly)) {
                 hospital.prestataires = prestOnly;
               }
             } else {
               console.warn('⚠️ Fallback prestataires-only a échoué:', resp2.status, resp2.statusText);
             }
           }
         } else {
           console.warn('⚠️ Impossible de récupérer l\'hôpital complet, tentative fallback /prestataires-only');
           const resp2 = await fetch(`${process.env.REACT_APP_GATEWAY_URL || 'http://localhost:8081'}/api/hospitaux/${hospital.id}/prestataires-only`, {
             method: 'GET',
             headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${localStorage.getItem('token')}`
             }
           });
           if (resp2.ok) {
             const prestOnly = await resp2.json();
             console.log('👥 Prestataires-only récupérés (fallback):', prestOnly);
             if (Array.isArray(prestOnly)) {
               hospital.prestataires = prestOnly;
             }
           } else {
             console.warn('⚠️ Fallback prestataires-only a échoué:', resp2.status, resp2.statusText);
           }
         }
       } catch (error) {
         console.error('❌ Erreur lors de la récupération de l\'hôpital / prestataires:', error);
       }

      // Si après tout hospital.prestataires est vide, forcer un appel à /prestataires-only
      try {
        if ((!hospital.prestataires || hospital.prestataires.length === 0) && hospital.id) {
          console.log('🔁 Dernier essai: récupération forcée via /prestataires-only');
          const resp3 = await fetch(`${process.env.REACT_APP_GATEWAY_URL || 'http://localhost:8081'}/api/hospitaux/${hospital.id}/prestataires-only`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (resp3.ok) {
            const prestOnly2 = await resp3.json();
            console.log('👥 Prestataires-only récupérés (dernier essai):', prestOnly2);
            if (Array.isArray(prestOnly2) && prestOnly2.length > 0) {
              hospital.prestataires = prestOnly2;
            }
          } else {
            console.warn('⚠️ Dernier essai prestataires-only a échoué:', resp3.status, resp3.statusText);
          }
        }
      } catch (e) {
        console.error('❌ Erreur dernier essai prestataires-only:', e);
      }

      setEditingHospital(hospital);
      setIsEditMode(true);

      // Pré-remplir le formulaire avec les données existantes
      setHospitalForm({
        nom: hospital.nom || '',
        description: hospital.description || '',
        ville: hospital.ville || '',
        pays: hospital.pays || '',
        telephoneFixe: hospital.telephoneFixe || '',
        type: hospital.type || 'hopital',
        latitude: hospital.latitude || 0,
        longitude: hospital.longitude || 0
      });

      // Charger les services existants
      if (hospital.services) {
        console.log('📋 Services trouvés:', hospital.services);
        setSelectedServices(hospital.services.map(s => s.type || s));
      } else {
        console.log('⚠️ Aucun service trouvé');
        setSelectedServices([]);
      }

       // ✅ SIMPLIFICATION : Charger directement depuis hospital.prestataires
       if (hospital.prestataires && hospital.prestataires.length > 0) {
         console.log('👥 Prestataires trouvés dans hospital.prestataires:', hospital.prestataires);
         
         const prestatairesMappes = hospital.prestataires.map(p => {
           // Convertir le type enum vers le format frontend
           const typeFrontend = p.type ? p.type.toLowerCase().replace('_', '-') : '';
           
           const prestataireMappe = {
             id: p.id || Date.now() + Math.random(),
             nom: p.nom || '',
             type: typeFrontend,
             specialite: p.specialite || '',
             telephone: p.telephone || '',
             email: p.email || ''
           };
           
           console.log('👤 Prestataire mappé:', prestataireMappe);
           return prestataireMappe;
         });
         
         console.log('✅ Prestataires mappés:', prestatairesMappes);
         setProviders(prestatairesMappes);
       } else {
         console.log('⚠️ Aucun prestataire trouvé dans hospital.prestataires');
         setProviders([]);
       }

      // Afficher le dialog
      setShowAddDialog(true);
      setActiveStep(0);
    };

// Fonction pour afficher les notifications
const showNotification = (message, type = 'success') => {
  // Implémentation simple avec alert - vous pouvez adapter avec un système de toast
  if (type === 'error') {
    alert(`❌ ${message}`);
  } else {
    alert(`✅ ${message}`);
  }
};

// Fonction pour sauvegarder un nouvel hôpital
const saveNewHospital = async () => {
  if (!locationInfo) return;

  console.log('💾 Sauvegarde nouvel hôpital - Prestataires actuels:', providers);
  console.log('💾 Services sélectionnés:', selectedServices);

   const newHospital = {
      nom: hospitalForm.nom,
      description: hospitalForm.description,
      ville: hospitalForm.ville,
      pays: hospitalForm.pays,
      telephoneFixe: hospitalForm.telephoneFixe,
      type: hospitalForm.type,
      latitude: locationInfo.latitude,
      longitude: locationInfo.longitude,
      adresseComplete: locationInfo.adresseComplete,
    services: selectedServices.map((serviceName) => {
      // ✅ CORRECTION : Associer le premier prestataire à tous les services
      // (ou laisser vide si aucun prestataire)
      const provider = providers.length > 0 ? providers[0] : null;
      
      console.log(`💾 Service "${serviceName}" - Prestataire associé:`, provider?.nom || 'Aucun');
      
      return {
        type: serviceName
      };
    }),
    prestataires: providers.map(provider => ({
      nom: provider.nom,
      type: convertToEnumType(provider.type),
      specialite: provider.specialite,
      telephone: provider.telephone,
      email: provider.email || ''
    })),
    status: 'pending',
    active: true,
      dateCreation: new Date().toISOString().split('T')[0]
    };

  console.log('💾 Hôpital à sauvegarder:', newHospital);

  try {
     const savedHospital = await createHospital(newHospital);

    // Sauvegarder les prestataires en localStorage pour cet hôpital
    if (savedHospital && savedHospital.id && providers.length > 0) {
      saveProvidersToLocalStorage(savedHospital.id, providers);
      
      // Mettre à jour le cache également
      setHospitalProvidersCache(prev => ({
        ...prev,
        [savedHospital.id]: providers
      }));
    }

    if (onHospitalAdd) {
      onHospitalAdd(savedHospital);
    }

    cancelAdding();
     showNotification('🏥 Hôpital ajouté avec succès! En attente de validation.', 'success');
     console.log("✅ Hôpital enregistré:", savedHospital);
   } catch (error) {
     console.error("❌ Erreur lors de l'enregistrement:", error);
     showNotification("Erreur lors de l'enregistrement de l'établissement", 'error');
   }
};

  // Fonction pour sauvegarder les modifications
  const saveEditedHospital = async () => {
    if (!editingHospital) return;

    console.log('💾 Sauvegarde modification hôpital - Prestataires actuels:', providers);
    console.log('💾 Services sélectionnés pour modification:', selectedServices);

    try {
      const updatedHospitalData = {
        nom: hospitalForm.nom,
        description: hospitalForm.description,
        ville: hospitalForm.ville,
        pays: hospitalForm.pays,
        telephoneFixe: hospitalForm.telephoneFixe,
        type: hospitalForm.type,
        latitude: hospitalForm.latitude || editingHospital.latitude,
        longitude: hospitalForm.longitude || editingHospital.longitude,
        adresseComplete: locationInfo?.adresseComplete || editingHospital.adresseComplete,
        services: selectedServices.map((serviceName) => {
          // ✅ CORRECTION : Associer le premier prestataire à tous les services
          const provider = providers.length > 0 ? providers[0] : null;
          
          console.log(`💾 Modification - Service "${serviceName}" - Prestataire associé:`, provider?.nom || 'Aucun');
          
          return {
            type: serviceName
          };
        }),
        prestataires: providers.map(provider => ({
          nom: provider.nom,
          type: convertToEnumType(provider.type),
          specialite: provider.specialite,
          telephone: provider.telephone,
          email: provider.email || ''
        })),
        active: editingHospital.active,
        status: editingHospital.status
      };

      console.log('🔄 Sauvegarde modifications pour:', editingHospital.id, updatedHospitalData);

      const result = await updateHopital(editingHospital.id, updatedHospitalData);
      console.log('✅ Hôpital modifié avec succès:', result);

      // Sauvegarder les prestataires en localStorage ET dans le cache
      if (providers.length > 0) {
        saveProvidersToLocalStorage(editingHospital.id, providers);
      }
      
      setHospitalProvidersCache(prev => ({
        ...prev,
        [editingHospital.id]: providers
      }));

      // Mettre à jour l'état local
      if (onHospitalUpdate) {
        onHospitalUpdate(editingHospital.id, result);
      }

      // Réinitialiser et fermer
      cancelAdding();
      setSelectedHospital(null);
      showNotification('✅ Hôpital modifié avec succès!', 'success');

  } catch (error) {
      console.error('❌ Erreur modification hôpital:', error);
      showNotification('❌ Erreur lors de la modification de l\'hôpital', 'error');
    }
  };

    // Fonction pour gérer les deux cas
    const saveHospital = async () => {
      if (isEditMode && editingHospital) {
        await saveEditedHospital();
      } else {
        await saveNewHospital();
      }
    };

  // Fonction pour activer/désactiver un hôpital
  const handleToggleHospitalStatus = async (hospitalId, activate) => {
    setLoadingAction(true);
    try {
      const updatedHospital = await toggleHospitalStatus(hospitalId, activate);

      if (onHospitalUpdate) {
        onHospitalUpdate(hospitalId, updatedHospital);
      }

      setSelectedHospital(null);
      console.log(`✅ Hôpital ${activate ? 'activé' : 'désactivé'}:`, updatedHospital);
    } catch (error) {
      console.error(`❌ Erreur lors de ${activate ? 'l\'activation' : 'la désactivation'}:`, error);
      alert(`Erreur lors de ${activate ? 'l\'activation' : 'la désactivation'}`);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleFormChange = (field, value) => {
    setHospitalForm(prev => ({ ...prev, [field]: value }));
  };

  // Contrôles de la carte
  const zoomIn = () => map && map.setZoom(map.getZoom() + 1);
  const zoomOut = () => map && map.setZoom(map.getZoom() - 1);

  const changeMapType = (type) => {
    setMapType(type);
  };

  const confirmedHospitals = hospitals.filter(h => h.active);
  const pendingHospitals = hospitals.filter(h => !h.active);

  // Rendu des différentes étapes
  const renderStepContent = (step) => {
    switch (step) {
      case 0: // Informations établissement
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Informations de l'établissement
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Renseignez les informations générales de l'établissement
            </Typography>

            {/* Informations de l'établissement */}
            <Box display="flex" gap={2} sx={{ mb: 2 }}>
              <TextField
                label="Pays *"
                value={hospitalForm.pays}
                onChange={(e) => handleFormChange('pays', e.target.value)}
                sx={{ flex: 1 }}
                placeholder="Ex: Sénégal"
              />
              <TextField
                label="Ville *"
                value={hospitalForm.ville}
                onChange={(e) => handleFormChange('ville', e.target.value)}
                sx={{ flex: 1 }}
                placeholder="Ex: Dakar"
              />
            </Box>

            <TextField
              fullWidth
              label="Nom de l'établissement *"
              value={hospitalForm.nom}
              onChange={(e) => handleFormChange('nom', e.target.value)}
              sx={{ mb: 2 }}
              placeholder="Ex: Hôpital Principal de Ziguinchor"
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description des services"
              value={hospitalForm.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              sx={{ mb: 2 }}
              placeholder="Décrivez les services VIH disponibles..."
            />

            <Box display="flex" gap={2} sx={{ mb: 2 }}>
              <FormControl sx={{ flex: 1 }}>
                <InputLabel>Type d'établissement</InputLabel>
                <Select
                  value={hospitalForm.type}
                  onChange={(e) => handleFormChange('type', e.target.value)}
                  label="Type d'établissement"
                >
                  <MenuItem value="hopital-regional">Hôpital régional</MenuItem>
                  <MenuItem value="district-sanitaire">District Sanitaire</MenuItem>
                  <MenuItem value="centre-sante">Centre de Santé (CS)</MenuItem>
                  <MenuItem value="poste-sante">Poste de Santé (PS)</MenuItem>
                  <MenuItem value="chr">Centre Hospitalier Régional (CHR)</MenuItem>
                  <MenuItem value="hopital">Hôpital</MenuItem>
                  <MenuItem value="cmia">CMIA (Centre Médical Inter-Armées)</MenuItem>
                  <MenuItem value="dpc">DPC (Dispensaire Public Communautaire)</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Téléphone fixe"
                value={hospitalForm.telephoneFixe}
                onChange={(e) => handleFormChange('telephoneFixe', e.target.value)}
                sx={{ flex: 1 }}
                placeholder="Ex: +221 33 XXX XX XX"
              />
            </Box>
          </Box>
        );

      case 1: // Services disponibles
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
                <ListItem 
                  key={service} 
                  component="div"
                  onClick={() => handleServiceToggle(service)}
                  sx={{ cursor: 'pointer' }}
                >
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

              {/* Debug info */}
              {console.log('🔍 État actuel des prestataires dans le rendu:', providers)}

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
                  <strong>Établissement:</strong> {hospitalForm.nom || 'Non défini'}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  };

  // Ajoutez cette fonction


  return (
    <Box sx={{ height: '80vh', width: '100%', position: 'relative' }}>
      {/* En-tête avec statistiques */}


      {/* Contrôles de carte */}
     <Box
       sx={{
         position: 'absolute',
         top: 120,
         right: 10,
         zIndex: 1000,
         display: 'flex',
         flexDirection: 'column',
         gap: 1,
         backgroundColor: 'white',
         padding: 2,
         borderRadius: 2,
         boxShadow: 3
       }}
     >
        <Typography variant="body2" fontWeight="bold">Navigation</Typography>
        <Box display="flex" flexDirection="column" gap={1}>
          <IconButton onClick={zoomIn} size="small" color="primary" title="Zoomer">
            <ZoomIn />
          </IconButton>
          <IconButton onClick={zoomOut} size="small" color="primary" title="Dézoomer">
            <ZoomOut />
          </IconButton>

           <IconButton
             onClick={() => {
               // Vérifier si la géolocalisation est disponible
               if (!navigator.geolocation) {
                 alert("❌ Votre navigateur ne supporte pas la géolocalisation");
                 return;
               }

               setLoadingLocation(true);

               let bestPosition = null;
               let bestAccuracy = Infinity;
               let watchId = null;
               let timeoutId = null;

               // Fonction pour traiter la position avec précision maximale
               const processPosition = (position) => {
                 const { latitude, longitude, accuracy } = position.coords;
                 
                 // Enregistrer la meilleure position trouvée
                 if (accuracy < bestAccuracy) {
                   bestAccuracy = accuracy;
                   bestPosition = { lat: latitude, lng: longitude, accuracy };
                   console.log(`📍 Position améliorée: ${latitude}, ${longitude}, Précision: ${accuracy}m`);
                 }

                 // Si la précision est excellente (≤ 20m), utiliser immédiatement
                 if (accuracy <= 20) {
                   if (watchId !== null) {
                     navigator.geolocation.clearWatch(watchId);
                     watchId = null;
                   }
                   if (timeoutId !== null) {
                     clearTimeout(timeoutId);
                     timeoutId = null;
                   }

                   const userLoc = { lat: latitude, lng: longitude };
                   console.log('✅ Position exacte trouvée:', {
                     latitude,
                     longitude,
                     accuracy: `${accuracy}m de précision`
                   });

                   setUserLocation(userLoc);
                   setShowUserInfo(true);

                   if (map) {
                     map.panTo(userLoc);
                     const zoomLevel = accuracy < 10 ? 19 : accuracy < 20 ? 18 : 17;
                     map.setZoom(zoomLevel);
                   }

                   setLoadingLocation(false);
                 }
               };

               // Utiliser watchPosition pour obtenir plusieurs mises à jour
               watchId = navigator.geolocation.watchPosition(
                 (position) => {
                   processPosition(position);
                 },
                 (error) => {
                   console.error('❌ Erreur watchPosition:', error);
                   
                   if (watchId !== null) {
                     navigator.geolocation.clearWatch(watchId);
                     watchId = null;
                   }
                   if (timeoutId !== null) {
                     clearTimeout(timeoutId);
                     timeoutId = null;
                   }

                   // Si on a une position acceptable, l'utiliser même en cas d'erreur
                   if (bestPosition && bestPosition.accuracy <= 100) {
                     console.log(`✅ Utilisation de la meilleure position trouvée: ${bestPosition.accuracy}m`);
                     setUserLocation({ lat: bestPosition.lat, lng: bestPosition.lng });
                     setShowUserInfo(true);
                     
                     if (map) {
                       map.panTo({ lat: bestPosition.lat, lng: bestPosition.lng });
                       const zoomLevel = bestPosition.accuracy < 20 ? 18 : bestPosition.accuracy < 50 ? 17 : 16;
                       map.setZoom(zoomLevel);
                     }
                     
                     setLoadingLocation(false);
                     return;
                   }

                   // Sinon, essayer getCurrentPosition en fallback
                   navigator.geolocation.getCurrentPosition(
                     (position) => {
                       processPosition(position);
                     },
                     (fallbackError) => {
                       console.error('❌ Erreur getCurrentPosition:', fallbackError);
                       setLoadingLocation(false);

                       let errorMessage = "Impossible de déterminer votre position";
                       switch (fallbackError.code) {
                         case fallbackError.PERMISSION_DENIED:
                           errorMessage = "📍 Autorisation de localisation refusée. Veuillez autoriser la géolocalisation dans les paramètres de votre navigateur.";
                           break;
                         case fallbackError.POSITION_UNAVAILABLE:
                           errorMessage = "📍 Information de localisation indisponible (GPS désactivé ?)";
                           break;
                         case fallbackError.TIMEOUT:
                           errorMessage = "📍 Délai de localisation dépassé. Réessayez.";
                           break;
                       }

                       // Si on a une position acceptable même après timeout, l'utiliser
                       if (bestPosition && bestPosition.accuracy <= 100) {
                         console.log(`✅ Utilisation de la meilleure position après timeout: ${bestPosition.accuracy}m`);
                         setUserLocation({ lat: bestPosition.lat, lng: bestPosition.lng });
                         setShowUserInfo(true);
                         
                         if (map) {
                           map.panTo({ lat: bestPosition.lat, lng: bestPosition.lng });
                           const zoomLevel = bestPosition.accuracy < 20 ? 18 : bestPosition.accuracy < 50 ? 17 : 16;
                           map.setZoom(zoomLevel);
                         }
                         
                         alert(`Position trouvée avec une précision de ${Math.round(bestPosition.accuracy)}m. ${errorMessage}`);
                       } else if (!userLocation) {
                         // Fallback vers Ziguinchor uniquement si aucune position n'est connue
                         const ziguinchor = { lat: 12.5833, lng: -16.2719 };
                         setUserLocation(ziguinchor);
                         setShowUserInfo(true);

                         if (map) {
                           map.panTo(ziguinchor);
                           map.setZoom(12);
                         }
                         
                         alert(errorMessage);
                       } else {
                         alert(errorMessage);
                       }
                     },
                     {
                       enableHighAccuracy: true,
                       timeout: 20000,
                       maximumAge: 0
                     }
                   );
                 },
                 {
                   enableHighAccuracy: true,
                   timeout: 30000,
                   maximumAge: 0
                 }
               );

               // Timeout de sécurité après 30 secondes
               timeoutId = setTimeout(() => {
                 if (watchId !== null) {
                   navigator.geolocation.clearWatch(watchId);
                   watchId = null;
                 }

                 // Si on a une position acceptable, l'utiliser
                 if (bestPosition && bestPosition.accuracy <= 100) {
                   console.log(`✅ Timeout atteint, utilisation de la meilleure position: ${bestPosition.accuracy}m`);
                   setUserLocation({ lat: bestPosition.lat, lng: bestPosition.lng });
                   setShowUserInfo(true);
                   
                   if (map) {
                     map.panTo({ lat: bestPosition.lat, lng: bestPosition.lng });
                     const zoomLevel = bestPosition.accuracy < 20 ? 18 : bestPosition.accuracy < 50 ? 17 : 16;
                     map.setZoom(zoomLevel);
                   }
                   
                   setLoadingLocation(false);
                   alert(`Position trouvée avec une précision de ${Math.round(bestPosition.accuracy)}m.`);
                 } else {
                   setLoadingLocation(false);
                   alert("📍 Délai de localisation dépassé. Impossible d'obtenir une position précise. Réessayez.");
                 }
               }, 30000);
             }}
             size="small"
             color="primary"
             title={loadingLocation ? "Recherche de votre position..." : "Me localiser sur ma position exacte"}
             disabled={loadingLocation}
           >
             <Box sx={{ position: 'relative', display: 'inline-flex' }}>
               <MyLocation
                 sx={{
                   fontSize: 20,
                   color: loadingLocation ? 'action.disabled' : 'primary.main'
                 }}
               />
               {loadingLocation && (
                 <CircularProgress
                   size={24}
                   sx={{
                     color: 'primary.main',
                     position: 'absolute',
                     top: -2,
                     left: -2,
                     zIndex: 1,
                   }}
                 />
               )}
             </Box>
           </IconButton>
        </Box>



        <Typography variant="body2" fontWeight="bold" sx={{ mt: 1 }}>Vue</Typography>
        <Box display="flex" flexDirection="column" gap={0.5}>
          <IconButton
            size="small"
            onClick={() => changeMapType('roadmap')}
            color={mapType === 'roadmap' ? 'primary' : 'default'}
          >
            <MapIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => changeMapType('satellite')}
            color={mapType === 'satellite' ? 'primary' : 'default'}
          >
            <Satellite fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Carte Google Maps */}
      <LoadScript
        googleMapsApiKey={GOOGLE_MAPS_API_KEY}
        libraries={GOOGLE_MAPS_LIBRARIES}
        onError={onLoadError}
        onLoad={() => {
          console.log('✅ Google Maps chargé avec succès');
          setMapLoaded(true);
        }}
        loadingElement={
          <Box sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            textAlign: 'center'
          }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 1 }}>
              Chargement de Google Maps...
            </Typography>
          </Box>
        }
      >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={userLocation || defaultCenter}
          zoom={zoomLevel}
          onLoad={onMapLoad}
          onClick={onMapClick}
          options={{
            mapTypeId: mapType,
            streetViewControl: true,
            mapTypeControl: false,
            fullscreenControl: true
          }}
        >
           {/* Hôpitaux - EXCLURE ceux à la position utilisateur */}
    {hospitals.map(hospital => {
      const lat = toNumber(hospital.latitude);
      const lng = toNumber(hospital.longitude);
      if (lat === null || lng === null) return null;
      if (userLocation && Math.abs(lat - userLocation.lat) < 0.0001 && Math.abs(lng - userLocation.lng) < 0.0001) return null;
      return (
        <Marker
          key={hospital.id}
          position={{ lat, lng }}
          icon={hospital.active ? ICONS.active : ICONS.inactive}
          zIndex={10}
          onClick={() => onMarkerClick(hospital)}
        />
      );
    })}

           {/* Position cliquée */}
           {clickedPosition && (
        <Marker
               position={clickedPosition}
               icon={ICONS.current}
               title="Emplacement sélectionné pour ajout"
             />
           )}

           {/* Marqueur de position utilisateur - UN SEUL qui change de couleur */}
    {userLocation && (
        <Marker
          position={userLocation}
          icon={{
                 url: (() => {
                   // Vérifier s'il y a un hôpital à cette position
                   const hospitalAtPosition = hospitals.find(h =>
                     h.latitude && h.longitude &&
                     Math.abs(h.latitude - userLocation.lat) < 0.0001 &&
                     Math.abs(h.longitude - userLocation.lng) < 0.0001
                   );

                   if (hospitalAtPosition) {
                     // Si hôpital actif → Rouge, sinon → Violet
                     return hospitalAtPosition.active ? ICONS.active : ICONS.inactive;
                   } else {
                     // Pas d'hôpital → Rouge (position libre)
                     return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
                   }
                 })(),
            scaledSize: { width: 40, height: 40 }
          }}
               title={(() => {
                 const hospitalAtPosition = hospitals.find(h =>
                   h.latitude && h.longitude &&
                   Math.abs(h.latitude - userLocation.lat) < 0.0001 &&
                   Math.abs(h.longitude - userLocation.lng) < 0.0001
                 );

                 if (hospitalAtPosition) {
                   return hospitalAtPosition.active ? "Hôpital actif - Cliquez pour voir les détails" : "Hôpital en attente de validation - Cliquez pour voir les détails";
                 } else {
                   return "Votre position actuelle - Cliquez pour ajouter un établissement";
                 }
               })()}
               zIndex={20}
          onClick={() => {
                 // Vérifier s'il y a déjà un hôpital à cette position
                 const existingHospital = hospitals.find(h =>
                   h.latitude && h.longitude &&
                   Math.abs(h.latitude - userLocation.lat) < 0.0001 &&
                   Math.abs(h.longitude - userLocation.lng) < 0.0001
                 );

                 if (existingHospital) {
                   // Afficher les détails de l'hôpital existant
                   setSelectedHospital(existingHospital);
            } else {
                   // Demander confirmation pour ajouter un établissement à cette position
                   const confirmAdd = window.confirm("Voulez-vous ajouter un établissement de santé à votre position actuelle ?\n\nCliquez sur OK pour ajouter, ou Annuler pour sortir.");

                   if (confirmAdd) {
                     setClickedPosition(userLocation);
                     setLoadingLocation(true);

                     // Réinitialisation du formulaire et des étapes
                     setActiveStep(0);
                     setSelectedServices([]);
                     setProviders([]);
                     setCurrentProvider({ type: '', nom: '', nom_prestataire: '', prenom: '', specialite: '', telephone: '', email: '' });

                     // Géocodage pour obtenir l'adresse
                     getAddressFromCoords(userLocation.lat, userLocation.lng).then(addressResult => {
                       if (addressResult) {
                         const locationInfo = extractLocationInfo(addressResult.address_components);
                         setLocationInfo({
                           ...locationInfo,
                           adresseComplete: addressResult.formatted_address,
                           latitude: userLocation.lat,
                           longitude: userLocation.lng
                         });

                         setHospitalForm(prev => ({
                           ...prev,
                           ville: locationInfo.ville || '',
                           pays: locationInfo.pays || 'Sénégal',
                           latitude: userLocation.lat,
                           longitude: userLocation.lng,
                           nom: locationInfo.ville ? `Nouvelle Structure - ${locationInfo.ville}` : 'Nouvelle Structure'
                         }));
                       } else {
                         setLocationInfo({
                           ville: 'Ville inconnue',
                           pays: 'Sénégal',
                           adresseComplete: `Position: ${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}`,
                           latitude: userLocation.lat,
                           longitude: userLocation.lng
                         });

                         setHospitalForm(prev => ({
                           ...prev,
                           latitude: userLocation.lat,
                           longitude: userLocation.lng,
                           nom: 'Nouvelle Structure'
                         }));
                       }

                       setShowAddDialog(true);
                       setLoadingLocation(false);
                     });
                   }
            }
          }}
        />
           )}

           {/* ✅ INFO WINDOW CORRIGÉE POUR AFFICHER LES PRESTATAIRES DEPUIS LES SERVICES */}
    {selectedHospital && (
      <InfoWindow
        position={{
          lat: toNumber(selectedHospital.latitude) ?? toNumber(selectedHospital.lat) ?? defaultCenter.lat,
          lng: toNumber(selectedHospital.longitude) ?? toNumber(selectedHospital.lng) ?? defaultCenter.lng
        }}
        onCloseClick={() => setSelectedHospital(null)}
      >
                <Box sx={{ maxWidth: 280, p: 0, borderRadius: 2, overflow: 'hidden' }}>
                  {/* Header stylé avec gradient */}
                  <Box sx={{
                    background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                    color: 'white',
                    p: 2,
                    borderRadius: '8px 8px 0 0'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 36, height: 36 }}>
                        🏥
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1rem', lineHeight: 1.2 }}>
            {selectedHospital.nom}
          </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Box sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: selectedHospital.active ? '#4caf50' : '#f44336'
                          }} />
                          <Typography variant="caption" sx={{ opacity: 0.9 }}>
                            {selectedHospital.active ? 'Actif' : 'En attente'}
          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  {/* Contenu principal */}
                  <Box sx={{ p: 2, bgcolor: 'white' }}>
                    {/* Informations clés */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="body2" sx={{ color: '#666', fontSize: '0.875rem' }}>
              📍 {selectedHospital.ville}, {selectedHospital.pays}
            </Typography>
                      </Box>

            {selectedHospital.telephoneFixe && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="body2" sx={{ color: '#666', fontSize: '0.875rem' }}>
                📞 {selectedHospital.telephoneFixe}
            </Typography>
          </Box>
                      )}

                      {selectedHospital.description && (
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#555',
                            fontSize: '0.8rem',
                            fontStyle: 'italic',
                            lineHeight: 1.4,
                            mt: 1
                          }}
                        >
                          "{selectedHospital.description.length > 80
                            ? selectedHospital.description.substring(0, 80) + '...'
                            : selectedHospital.description}"
                      </Typography>
                      )}
                    </Box>

                    {/* Services compacts */}
                    {selectedHospital.services && selectedHospital.services.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, color: '#333' }}>
                          🩺 Services ({selectedHospital.services.length})
        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selectedHospital.services.slice(0, 2).map((service, index) => (
                            <Chip
              key={index}
                              label={typeof service === 'string' ? service : service.type}
                              size="small"
                              variant="outlined"
              sx={{
                                fontSize: '0.75rem',
                                height: 24,
                                '& .MuiChip-label': { px: 1 }
                              }}
                            />
                          ))}
                          {selectedHospital.services.length > 2 && (
                            <Chip
                              label={`+${selectedHospital.services.length - 2}`}
                  size="small"
                              variant="outlined"
                              sx={{
                                fontSize: '0.75rem',
                                height: 24,
                                '& .MuiChip-label': { px: 1 }
                              }}
                            />
                          )}
              </Box>
              </Box>
                    )}

                    {/* ✅ PRESTATAIRES DEPUIS LES SERVICES */}
                    {selectedHospital.services && selectedHospital.services.filter(s => s.nomPrestataire).length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, color: '#333' }}>
                          👨‍⚕️ Prestataires ({selectedHospital.services.filter(s => s.nomPrestataire).length})
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selectedHospital.services
                            .filter(service => service.nomPrestataire) // Seulement les services avec prestataires
                            .slice(0, 2)
                            .map((service, index) => (
                              <Chip
                                key={index}
                                label={`${service.nomPrestataire} (${service.typePrestataire || 'N/A'})`}
                                size="small"
                                variant="outlined"
                                color="secondary"
                                sx={{
                                  fontSize: '0.75rem',
                                  height: 24,
                                  '& .MuiChip-label': { px: 1 }
                                }}
                              />
                            ))}
                          {selectedHospital.services.filter(s => s.nomPrestataire).length > 2 && (
                            <Chip
                              label={`+${selectedHospital.services.filter(s => s.nomPrestataire).length - 2}`}
                              size="small"
                              variant="outlined"
                              color="secondary"
                              sx={{
                                fontSize: '0.75rem',
                                height: 24,
                                '& .MuiChip-label': { px: 1 }
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                    )}

                    {/* Boutons d'action compacts */}
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleEditHospital(selectedHospital)}
                        startIcon={<Edit sx={{ fontSize: 16 }} />}
                        sx={{
                          fontSize: '0.75rem',
                          py: 0.5,
                          px: 1.5,
                          minWidth: 'auto'
                        }}
                      >
                        Modifier
                      </Button>

                      {/* Bouton d'activation pour les hôpitaux en attente (admin) */}
                      {!selectedHospital.active && (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          disabled={loadingAction}
                          onClick={() => handleToggleHospitalStatus(selectedHospital.id, true)}
                          sx={{
                            fontSize: '0.75rem',
                            py: 0.5,
                            px: 1.5,
                            minWidth: 'auto'
                          }}
                        >
                          {loadingAction ? 'Activation...' : 'Activer'}
                        </Button>
                      )}
                    </Box>
    </Box>
                </Box>
              </InfoWindow>
            )}
        </GoogleMap>
      </LoadScript>

            {/* Dialog pour ajouter/modifier */}
            <Dialog
              open={showAddDialog}
              onClose={cancelAdding}
              maxWidth="md"
                     fullWidth
            >
              <DialogTitle>
                <Box display="flex" alignItems="center" gap={1}>
                  <AddLocation color="primary" />
                  {isEditMode ? `Modifier ${editingHospital?.nom}` : 'Ajouter un établissement de santé'}
                  </Box>
                <Stepper activeStep={activeStep} sx={{ mt: 2 }}>
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </DialogTitle>

              <DialogContent>
                {renderStepContent(activeStep)}
              </DialogContent>

              <DialogActions>
                <Button onClick={activeStep === 0 ? cancelAdding : handleBack}>
                  {activeStep === 0 ? 'Annuler' : 'Retour'}
                </Button>
                <Button
                  onClick={activeStep === steps.length - 1 ? saveHospital : handleNext}
                  variant="contained"
                  disabled={
                    (activeStep === steps.length - 1 && !hospitalForm.nom.trim()) ||
                    (activeStep < steps.length - 1 && !canProceedToNext())
                  }
                >
                  {activeStep === steps.length - 1 ?
                    (isEditMode ? 'Mettre à jour' : 'Enregistrer') :
                    'Suivant'
                  }
                </Button>
              </DialogActions>
            </Dialog>

      {/* Indicateurs */}
      {loadingLocation && (
        <Snackbar
          open={loadingLocation}
          message="📡 Détection de votre position..."
        />
      )}

      <Box
        sx={{
          position: 'absolute',
          bottom: 10,
          left: 10,
          backgroundColor: 'info.main',
          color: 'white',
          padding: 1,
          borderRadius: 1,
          zIndex: 1000
        }}
      >
        <Typography variant="body2">
          🎯 Cliquez sur la carte pour ajouter un établissement
        </Typography>
      </Box>

      {!mapLoaded && !mapError && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            textAlign: 'center'
          }}
        >
          <CircularProgress />
          <Typography variant="body2" sx={{ mt: 1 }}>
            Chargement de la carte...
          </Typography>
        </Box>
      )}

      {mapError && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            textAlign: 'center',
            p: 3,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 3,
            maxWidth: 400
          }}
        >
          <Typography variant="h6" color="error" gutterBottom>
            ❌ Erreur de chargement de la carte
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Impossible de charger Google Maps. Vérifiez votre connexion internet.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Tentative {retryCount}/3
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => {
              setMapError(null);
              setRetryCount(0);
              setMapLoaded(false);
            }}
            sx={{ mt: 1 }}
          >
            🔄 Réessayer
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default CartographyMap;












