// src/components/CartographyMap.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { toggleHospitalStatus } from '../services/hospitalService';
import { createHopital, updateHopital, getHopitalAvecPrestataires, getPrestatairesByHopitalId } from '../services/hopitalService';
import CreateReferenceSurCarte from './CreateReferenceSurCarte';
import { getTranslation } from '../utils/translations';

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
  Edit,
  Description as FileText
} from '@mui/icons-material';

// Configuration de la carte
const mapContainerStyle = {
  width: '100%',
  height: '120%'
};

// Centre sur le Sénégal
const defaultCenter = {
  lat: 14.4974,
  lng: -14.4524
};

// Zoom pour voir tout le pays
const DEFAULT_ZOOM = 7;

const ICONS = {
  confirmed: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
  pending: 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png',
  inactive: "http://maps.google.com/mapfiles/ms/icons/purple-dot.png",
  active: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
  user: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  current: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
};

// Services disponibles — générés dynamiquement selon la langue
const getAvailableServices = (language) => [
  getTranslation('serviceConsultationVIH', language),
  getTranslation('serviceDepistageVIH', language),
  getTranslation('serviceTraitementARV', language),
  getTranslation('servicePTME', language),
  getTranslation('serviceSuiviBiologique', language),
  getTranslation('serviceConseilPsychosocial', language),
  getTranslation('servicePreventionIST', language),
  getTranslation('serviceDistributionPreservatifs', language),
  getTranslation('serviceInfectionsOpportunistes', language),
];

// Types de prestataires — générés dynamiquement selon la langue
const getProviderTypes = (language) => [
  { value: 'medecin-pec', label: getTranslation('providerMedecinPec', language), icon: <MedicalServices /> },
  { value: 'assistant-social', label: getTranslation('providerAssistantSocial', language), icon: <Groups /> },
  { value: 'pediatre', label: getTranslation('providerPediatre', language), icon: <Person /> }
];

const GOOGLE_MAPS_API_KEY = 'AIzaSyCBwr6styheEc8XB3JyeL9Ky3eebVUy9KU';

// Constante pour éviter la recréation du tableau à chaque render
const GOOGLE_MAPS_LIBRARIES = ['places', 'geometry'];

const CartographyMap = ({ hospitals, onHospitalUpdate, onHospitalAdd, language = 'fr' }) => {
   const [map, setMap] = useState(null);

   // Listes traduites selon la langue courante
   const AVAILABLE_SERVICES = getAvailableServices(language);
   const PROVIDER_TYPES = getProviderTypes(language);
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

   // État pour gérer la référence de patient
   const [showReferenceDialog, setShowReferenceDialog] = useState(false);
   const [selectedHopitalForReference, setSelectedHopitalForReference] = useState(null);

   // Fonction pour charger les prestataires depuis le backend
   const loadProvidersFromBackend = async (hospitalId) => {
     try {
       console.log(`Chargement des prestataires depuis le backend pour l'hôpital ${hospitalId}`);
       const prestataires = await getPrestatairesByHopitalId(hospitalId);
       console.log(`Prestataires chargés depuis le backend:`, prestataires);

       // Mapper les prestataires pour le frontend
       const prestatairesMappes = prestataires.map(p => ({
         id: p.id,
         nom: p.nom,
         nom_prestataire: p.nom.split(' ')[0] || '',
         prenom: p.nom.split(' ').slice(1).join(' ') || '',
         type: p.type ? p.type.toLowerCase().replace('_', '-') : '',
         specialite: p.specialite || '',
         telephone: p.telephone || '',
         email: p.email || ''
       }));

       return prestatairesMappes;
     } catch (error) {
       console.error('Erreur chargement prestataires depuis backend:', error);
       return [];
     }
   };

   const [hospitalForm, setHospitalForm] = useState({
     nom: '',
     ville: '',
     pays: '',
     telephoneFixe: '',
     type: 'hopital',
     latitude: 0,
     longitude: 0
   });

   // 🔥 NOUVEAUX ÉTATS POUR LA MODIFICATION
   const [editingHospital, setEditingHospital] = useState(null);
   const [isEditMode, setIsEditMode] = useState(false);

   // Steps pour le stepper
   const steps = [
     getTranslation('stepInfoEtablissement', language),
     getTranslation('stepServicesDisponibles', language),
     getTranslation('stepPrestataires', language)
   ];

   // Fonction pour gérer la référence de patient
   const handleReferencePatient = (hospital) => {
     console.log('Référencer un patient pour l\'hôpital:', hospital);
     setSelectedHopitalForReference(hospital);
     setShowReferenceDialog(true);
     setSelectedHospital(null); // Fermer la fenêtre d'info
   };

   // ✅ AJOUT DU LOG DE DEBUG POUR LES HÔPITAUX REÇUS
   useEffect(() => {
     console.log('🔍 Hôpitaux reçus dans CartographyMap:', hospitals);
     hospitals.forEach((h, index) => {
       console.log(`🏥 Hôpital ${index + 1}:`, h.nom);
       console.log(`   Services:`, h.services);
       console.log(`   Prestataires dans services:`, h.services?.filter(s => s.nomPrestataire));
     });
   }, [hospitals]);

   // Effet pour initialiser les hôpitaux au démarrage
   useEffect(() => {
     if (hospitals.length > 0) {
       hospitals.forEach(hospital => {
         console.log(` Hôpital ${hospital.nom} prêt pour le chargement des prestataires`);
       });
     }
   }, [hospitals]);

   // ✅ Rappels définis AVANT les useEffect qui les référencent
   const onMapLoad = useCallback((mapInstance) => {
     setMap(mapInstance);
     setMapLoaded(true);

     if (window.google) {
       setGeocoding(new window.google.maps.Geocoder());
     }
   }, []);

    const onLoadError = useCallback((error) => {
     console.error('Erreur Google Maps:', error);
      setMapLoaded(false);
    }, []);

   // Fonction pour afficher les notifications
   const showNotification = (message, type = 'success') => {
     // Implémentation simple avec alert - vous pouvez adapter avec un système de toast
     if (type === 'error') {
       alert(`❌ ${message}`);
     } else {
       alert(`✅ ${message}`);
     }
   };

    // Fallback géolocalisation par IP (fonctionne sur HTTP)
    const locateByIP = useCallback(async (applyPosition) => {
      try {
        console.log('📡 Tentative géolocalisation par IP...');
        const response = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(8000) });
        if (!response.ok) throw new Error('ipapi.co failed');
        const data = await response.json();
        if (data.latitude && data.longitude) {
          console.log(`📍 Position par IP: ${data.latitude}, ${data.longitude} (${data.city})`);
          applyPosition(data.latitude, data.longitude, 5000); // précision ~5km pour IP
          return true;
        }
      } catch (e) {
        console.warn('ipapi.co échoué, essai ip-api.com...', e);
      }
      try {
        const response = await fetch('http://ip-api.com/json/?fields=lat,lon,city,status', { signal: AbortSignal.timeout(8000) });
        const data = await response.json();
        if (data.status === 'success' && data.lat && data.lon) {
          console.log(`📍 Position par IP (fallback): ${data.lat}, ${data.lon}`);
          applyPosition(data.lat, data.lon, 5000);
          return true;
        }
      } catch (e) {
        console.error('Géolocalisation par IP échouée:', e);
      }
      return false;
    }, []);

    const locateUser = useCallback(() => {
      if (!map) return;

      setLoadingLocation(true);

      const applyPosition = (lat, lng, accuracy) => {
        const userLoc = { lat, lng };
        setUserLocation(userLoc);
        setShowUserInfo(false);
        setLoadingLocation(false);
        if (map) {
          map.panTo(userLoc);
          // Zoom adapté : précision GPS vs IP
          const zoom = accuracy < 50 ? 17 : accuracy < 500 ? 15 : accuracy < 5000 ? 12 : 10;
          map.setZoom(zoom);
        }
      };

      const isHttpBlocked = window.location.protocol === 'http:' &&
        window.location.hostname !== 'localhost' &&
        window.location.hostname !== '127.0.0.1';

      // Sur HTTP non-localhost, navigator.geolocation est bloqué par le navigateur
      // On passe directement à la géolocalisation par IP
      if (isHttpBlocked || !navigator.geolocation) {
        console.warn('Géolocalisation GPS non disponible sur HTTP, utilisation de la géolocalisation par IP');
        locateByIP(applyPosition).then(success => {
          if (!success) {
            setLoadingLocation(false);
            showNotification('Position indisponible. Activez HTTPS pour une localisation précise.', 'error');
          }
        });
        return;
      }

      // Sur HTTPS ou localhost : utiliser le GPS du navigateur
      let bestPosition = null;
      let bestAccuracy = Infinity;
      let watchId = null;
      let timeoutId = null;

      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          if (accuracy < bestAccuracy) {
            bestAccuracy = accuracy;
            bestPosition = { lat: latitude, lng: longitude, accuracy };
          }
          if (accuracy <= 50) {
            if (watchId !== null) navigator.geolocation.clearWatch(watchId);
            if (timeoutId !== null) clearTimeout(timeoutId);
            applyPosition(latitude, longitude, accuracy);
          }
        },
        (error) => {
          console.error('❌ Erreur GPS:', error);
          if (watchId !== null) navigator.geolocation.clearWatch(watchId);
          if (timeoutId !== null) clearTimeout(timeoutId);

          if (bestPosition) {
            applyPosition(bestPosition.lat, bestPosition.lng, bestPosition.accuracy);
            return;
          }

          // Fallback par IP si GPS échoue
          locateByIP(applyPosition).then(success => {
            if (!success) {
              setLoadingLocation(false);
              const msg = error.code === 1
                ? 'Permission refusée. Autorisez la géolocalisation dans votre navigateur.'
                : 'Position indisponible.';
              showNotification(msg, 'error');
            }
          });
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
      );

      timeoutId = setTimeout(() => {
        if (watchId !== null) { navigator.geolocation.clearWatch(watchId); watchId = null; }
        if (bestPosition) {
          applyPosition(bestPosition.lat, bestPosition.lng, bestPosition.accuracy);
        } else {
          locateByIP(applyPosition).then(success => {
            if (!success) {
              setLoadingLocation(false);
              showNotification('Délai dépassé. Réessayez.', 'error');
            }
          });
        }
      }, 25000);
    }, [map, language, locateByIP]);

   // Ne pas appeler locateUser automatiquement au chargement

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
        const confirmAdd = window.confirm(getTranslation('confirmAddAtCurrentPosition', language));

        if (!confirmAdd) {
          console.log("Ajout annulé par l'utilisateur");
          return;
        }
      }
    } else {
      // Clic ailleurs sur la carte
     const confirmAdd = window.confirm(getTranslation('confirmAddAtLocation', language));

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
         pays: locationInfo.pays || getTranslation('defaultCountry', language),
         latitude: lat,
         longitude: lng,
         nom: locationInfo.ville
           ? `${getTranslation('defaultFacilityName', language)} - ${locationInfo.ville}`
           : getTranslation('defaultFacilityName', language)
       }));
     } else {
       setLocationInfo({
         ville: getTranslation('defaultCity', language),
         pays: getTranslation('defaultCountry', language),
         adresseComplete: `Position: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
         latitude: lat,
         longitude: lng
       });

       setHospitalForm(prev => ({
         ...prev,
         latitude: lat,
         longitude: lng,
         nom: getTranslation('defaultFacilityName', language)
       }));
    }

       setShowAddDialog(true);
    setLoadingLocation(false);
  }, [geocoding, userLocation, hospitals]);

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
      console.log(' Prestataires mis à jour dans l\'état local');
      
      setCurrentProvider({ type: '', nom: '', nom_prestataire: '', prenom: '', specialite: '', telephone: '', email: '' });
    }
  };

  const handleRemoveProvider = (providerId) => {
    const updatedProviders = providers.filter(p => p.id !== providerId);
    setProviders(updatedProviders);
    console.log(' Prestataire supprimé de l\'état local');
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
          specialite = getTranslation('specialiteSociologue', language);
        } else if (value === 'pediatre') {
          specialite = getTranslation('providerPediatre', language);
        } else if (value === 'medecin-pec') {
          specialite = getTranslation('specialiteGeneraliste', language);
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
        alert(getTranslation('validationFacilityName', language));
        return;
      }
    } else if (activeStep === 1) {
      // Étape 1: Services - au moins un service doit être sélectionné
      if (selectedServices.length === 0) {
        alert(getTranslation('validationSelectService', language));
        return;
      }
    } else if (activeStep === 2) {
      // Étape 2: Prestataires - au moins un prestataire doit être ajouté
      if (providers.length === 0) {
        alert(getTranslation('validationAddProvider', language));
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

  // ✅ AJOUT DES LOGS DE DEBUG DANS onMarkerClick
  const onMarkerClick = useCallback((hospital) => {
    console.log('🏥 Hôpital cliqué:', hospital);
    console.log('📋 Services dans l\'hôpital:', hospital.services);
    console.log('👥 Prestataires dans les services:', hospital.services?.filter(s => s.nomPrestataire));
    setSelectedHospital(hospital);
  }, []);

  const fitMapToHospitals = useCallback(() => {
    if (!map || hospitals.length === 0) return;

    const bounds = new window.google.maps.LatLngBounds();

    hospitals.forEach(hospital => {
      if (hospital.latitude != null && hospital.longitude != null && 
          !isNaN(hospital.latitude) && !isNaN(hospital.longitude)) {
        bounds.extend(new window.google.maps.LatLng(
          parseFloat(hospital.latitude), 
          parseFloat(hospital.longitude)
        ));
      }
    });

    if (userLocation) {
      bounds.extend(new window.google.maps.LatLng(userLocation.lat, userLocation.lng));
    }

    map.fitBounds(bounds);

    const listener = window.google.maps.event.addListener(map, 'idle', function() {
      if (map.getZoom() > 15) map.setZoom(15);
      window.google.maps.event.removeListener(listener);
    });
  }, [map, hospitals, userLocation]);

  useEffect(() => {
    if (map && hospitals.length > 0) {
      setTimeout(fitMapToHospitals, 1000);
    }
  }, [map, hospitals, fitMapToHospitals]);

  const handleAddAtUserLocation = useCallback(async () => {
    if (!userLocation) return;

    const confirmAdd = window.confirm(getTranslation('confirmAddAtCurrentPosition', language));

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
          ville: locationInfo.ville || getTranslation('defaultCityZiguinchor', language),
          pays: locationInfo.pays || getTranslation('defaultCountry', language),
          latitude: userLocation.lat,
          longitude: userLocation.lng,
          nom: locationInfo.ville
            ? `${getTranslation('defaultFacilityName', language)} - ${locationInfo.ville}`
            : getTranslation('defaultFacilityNameZiguinchor', language)
        }));
      } else {
        setLocationInfo({
          ville: getTranslation('defaultCityZiguinchor', language),
          pays: getTranslation('defaultCountry', language),
          adresseComplete: `${getTranslation('currentPosition', language)} ${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}`,
          latitude: userLocation.lat,
          longitude: userLocation.lng
        });

        setHospitalForm(prev => ({
          ...prev,
          ville: getTranslation('defaultCityZiguinchor', language),
          pays: getTranslation('defaultCountry', language),
          latitude: userLocation.lat,
          longitude: userLocation.lng,
          nom: getTranslation('defaultFacilityNameZiguinchor', language)
        }));
      }

      setShowAddDialog(true);
      setShowUserInfo(false);
    } catch (error) {
      console.error(getTranslation('errorGeocoding', language), error);
    } finally {
      setLoadingLocation(false);
    }
  }, [userLocation, geocoding, language]);

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
        ville: '',
        pays: '',
        telephoneFixe: '',
        type: 'hopital',
        latitude: 0,
        longitude: 0
      });
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

    // 🔥 FONCTION POUR DÉMARRER LA MODIFICATION CORRIGÉE
     const handleEditHospital = (hospital) => {
       console.log('🔄 Début modification hôpital:', hospital);
       console.log('📋 Services dans l\'hôpital:', hospital.services);
       console.log('👥 Prestataires dans l\'hôpital (champ direct):', hospital.prestataires);
       console.log('🔍 Structure complète de l\'hôpital:', JSON.stringify(hospital, null, 2));

      setEditingHospital(hospital);
      setIsEditMode(true);

      // Pré-remplir le formulaire avec les données existantes
      setHospitalForm({
        nom: hospital.nom || '',
        ville: hospital.ville || '',
        pays: hospital.pays || '',
        telephoneFixe: hospital.telephoneFixe || '',
        type: hospital.type || 'hopital',
        latitude: hospital.latitude || 0,
        longitude: hospital.longitude || 0
      });

      // Charger les services existants
      if (hospital.services) {
        console.log(' Services trouvés:', hospital.services);
        setSelectedServices(hospital.services.map(s => s.type || s));
      } else {
        console.log(' Aucun service trouvé');
        setSelectedServices([]);
      }

      // Charger les prestataires depuis le backend
      const loadPrestataires = async () => {
        try {
          const prestataires = await loadProvidersFromBackend(hospital.id);
          setProviders(prestataires);
        } catch (error) {
          console.error('Erreur lors du chargement des prestataires:', error);
          // Fallback : utiliser les prestataires dans l'objet hospital si disponibles
          if (hospital.prestataires && hospital.prestataires.length > 0) {
            console.log(' Fallback : utilisation des prestataires dans hospital.prestataires');
            const prestatairesMappes = hospital.prestataires.map(p => ({
              id: p.id,
              nom: p.nom,
              nom_prestataire: p.nom.split(' ')[0] || '',
              prenom: p.nom.split(' ').slice(1).join(' ') || '',
              type: p.type ? p.type.toLowerCase().replace('_', '-') : '',
              specialite: p.specialite || '',
              telephone: p.telephone || '',
              email: p.email || ''
            }));
            setProviders(prestatairesMappes);
} else {
              setProviders([]);
            }
          };
        };

          loadPrestataires();

         // Afficher le dialog
         setShowAddDialog(true);
       };

// Fonction pour sauvegarder un nouvel hôpital
const saveNewHospital = async () => {
  if (!locationInfo) return;

  console.log('💾 Sauvegarde nouvel hôpital - Prestataires actuels:', providers);
  console.log('💾 Services sélectionnés:', selectedServices);

   const newHospital = {
      nom: hospitalForm.nom,
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
      type: provider.type,
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
     const savedHospital = await createHopital(newHospital);

    if (onHospitalAdd) {
      onHospitalAdd(savedHospital);
    }

    cancelAdding();
     showNotification(getTranslation('hospitalAddedSuccess', language), 'success');
     console.log(" Hôpital enregistré:", savedHospital);
   } catch (error) {
     console.error(" Erreur lors de l'enregistrement:", error);
     showNotification(getTranslation('errorSavingFacility', language), 'error');
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
          type: provider.type,
          specialite: provider.specialite,
          telephone: provider.telephone,
          email: provider.email || ''
        })),
        active: editingHospital.active,
        status: editingHospital.status
      };

      console.log(' Sauvegarde modifications pour:', editingHospital.id, updatedHospitalData);

      const result = await updateHopital(editingHospital.id, updatedHospitalData);
      console.log(' Hôpital modifié avec succès:', result);

      // Mettre à jour l'état local
      if (onHospitalUpdate) {
        onHospitalUpdate(editingHospital.id, result);
      }

      // Réinitialiser et fermer
      cancelAdding();
      setSelectedHospital(null);
      showNotification(' Hôpital modifié avec succès!', 'success');

  } catch (error) {
      console.error(' Erreur modification hôpital:', error);
      showNotification(' Erreur lors de la modification de l\'hôpital', 'error');
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
              {getTranslation('stepInfoTitle', language)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {getTranslation('stepInfoSubtitle', language)}
            </Typography>

            {/* Informations de l'établissement */}
            <Box display="flex" gap={2} sx={{ mb: 2 }}>
              <TextField
                label={getTranslation('fieldCountry', language)}
                value={hospitalForm.pays}
                onChange={(e) => handleFormChange('pays', e.target.value)}
                sx={{ flex: 1 }}
                placeholder={getTranslation('fieldCountryPlaceholder', language)}
              />
              <TextField
                label={getTranslation('fieldCity', language)}
                value={hospitalForm.ville}
                onChange={(e) => handleFormChange('ville', e.target.value)}
                sx={{ flex: 1 }}
                placeholder={getTranslation('fieldCityPlaceholder', language)}
              />
            </Box>

            <TextField
              fullWidth
              label={getTranslation('fieldFacilityName', language)}
              value={hospitalForm.nom}
              onChange={(e) => handleFormChange('nom', e.target.value)}
              sx={{ mb: 2 }}
              placeholder={getTranslation('fieldFacilityNamePlaceholder', language)}
            />

            <Box display="flex" gap={2} sx={{ mb: 2 }}>
              <FormControl sx={{ flex: 1 }}>
                <InputLabel>{getTranslation('fieldFacilityType', language)}</InputLabel>
                <Select
                  value={hospitalForm.type}
                  onChange={(e) => handleFormChange('type', e.target.value)}
                  label={getTranslation('fieldFacilityType', language)}
                >
                  <MenuItem value="hopital-regional">{getTranslation('typeHopitalRegional', language)}</MenuItem>
                  <MenuItem value="district-sanitaire">{getTranslation('typeDistrictSanitaire', language)}</MenuItem>
                  <MenuItem value="centre-sante">{getTranslation('typeCentreSante', language)}</MenuItem>
                  <MenuItem value="poste-sante">{getTranslation('typePosteSante', language)}</MenuItem>
                  <MenuItem value="chr">{getTranslation('typeChr', language)}</MenuItem>
                  <MenuItem value="hopital">{getTranslation('typeHopital', language)}</MenuItem>
                  <MenuItem value="cmia">{getTranslation('typeCmia', language)}</MenuItem>
                  <MenuItem value="dpc">{getTranslation('typeDpc', language)}</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label={getTranslation('fieldPhone', language)}
                value={hospitalForm.telephoneFixe}
                onChange={(e) => handleFormChange('telephoneFixe', e.target.value)}
                sx={{ flex: 1 }}
                placeholder={getTranslation('fieldPhonePlaceholder', language)}
              />
            </Box>
          </Box>
        );

      case 1: // Services disponibles
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {getTranslation('stepServicesTitle', language)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {getTranslation('stepServicesSubtitle', language)}
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
              {getTranslation('stepProvidersTitle', language)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {getTranslation('stepProvidersSubtitle', language)}
            </Typography>

            {/* Formulaire d'ajout/modification d'un prestataire */}
            <Box sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ mb: 0 }}>
                  {isEditingProvider ? getTranslation('editProviderTitle', language) : getTranslation('addProviderTitle', language)}
                </Typography>
                {isEditingProvider && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="secondary"
                    onClick={handleCancelEditProvider}
                    sx={{ minWidth: 'auto', px: 2 }}
                  >
                    {getTranslation('cancelEditProvider', language)}
                  </Button>
                )}
              </Box>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>{getTranslation('providerType', language)}</InputLabel>
                <Select
                  value={currentProvider.type}
                  label={getTranslation('providerType', language)}
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
                label={getTranslation('providerLastName', language)}
                value={currentProvider.nom_prestataire || ''}
                onChange={(e) => handleProviderChange('nom_prestataire', e.target.value)}
                sx={{ mb: 2 }}
                placeholder={getTranslation('providerLastNamePlaceholder', language)}
              />

              {/* Champ prénom visible */}
              <TextField
                fullWidth
                label={getTranslation('providerFirstName', language)}
                value={currentProvider.prenom || ''}
                onChange={(e) => handleProviderChange('prenom', e.target.value)}
                sx={{ mb: 2 }}
                placeholder={getTranslation('providerFirstNamePlaceholder', language)}
              />

              {/* Champs cachés - générés automatiquement */}
              <input type="hidden" value={currentProvider.nom} />
              <input type="hidden" value={currentProvider.specialite} />
              <input type="hidden" value={currentProvider.email} />

              {/* Champs visibles */}
              <TextField
                fullWidth
                label={getTranslation('providerPhone', language)}
                value={currentProvider.telephone || ''}
                onChange={(e) => handleProviderChange('telephone', e.target.value)}
                sx={{ mb: 2 }}
                placeholder={getTranslation('providerPhonePlaceholder', language)}
              />

              <Button
                variant="outlined"
                onClick={handleAddProvider}
                disabled={!currentProvider.type || !currentProvider.nom_prestataire || !currentProvider.prenom}
                sx={{ mt: 2 }}
                color={isEditingProvider ? 'primary' : 'default'}
              >
                {isEditingProvider ? getTranslation('updateProviderBtn', language) : getTranslation('addProviderBtn', language)}
              </Button>

              {/* Récapitulatif des valeurs générées automatiquement */}
              {currentProvider.type && currentProvider.nom_prestataire && currentProvider.prenom && (
                <Box sx={{ mt: 2, p: 2, bgcolor: isEditingProvider ? 'primary.50' : 'grey.100', borderRadius: 1, border: isEditingProvider ? '1px solid' : 'none', borderColor: 'primary.main' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight="bold">
                      📋 {isEditingProvider ? getTranslation('editingInProgress', language) : ''}{getTranslation('autoGeneratedSummary', language)}
                    </Typography>
                    {isEditingProvider && (
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={handleReloadProvider}
                        sx={{ minWidth: 'auto', px: 2, py: 0.5 }}
                      >
                        {getTranslation('reloadBtn', language)}
                      </Button>
                    )}
                  </Box>
                  <Typography variant="body2">
                    <strong>{getTranslation('fullName', language)}</strong> {currentProvider.nom}
                  </Typography>
                  <Typography variant="body2">
                    <strong>{getTranslation('specialtyLabel', language)}</strong> {currentProvider.specialite}
                  </Typography>
                  <Typography variant="body2">
                    <strong>{getTranslation('emailLabel', language)}</strong> {currentProvider.email}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Récapitulatif des prestataires ajoutés */}
            <Box sx={{ mt: 3, border: 1, borderColor: 'divider', borderRadius: 1, p: 2 }}>
              <Typography variant="h6" gutterBottom>
                📋 {getTranslation('providersSummaryTitle', language)} ({providers.length})
              </Typography>

              {/* Debug info */}
              {console.log('🔍 État actuel des prestataires dans le rendu:', providers)}

              {providers.length === 0 ? (
                <Alert severity="warning">
                  {getTranslation('noProviderWarning', language)}
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
                              title={getTranslation('editHospital', language)}
                            >
                              <Edit />
                            </IconButton>
                            <IconButton
                              edge="end"
                              onClick={() => handleRemoveProvider(provider.id)}
                              color="error"
                              size="small"
                              title={getTranslation('delete', language)}
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
                                {getTranslation('specialtyField', language)}: {provider.specialite}
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
                  {getTranslation('finalSummaryTitle', language)}
                </Typography>
                <Typography variant="body2">
                  <strong>{getTranslation('selectedServicesCount', language)}</strong> {selectedServices.length}
                </Typography>
                <Typography variant="body2">
                  <strong>{getTranslation('addedProvidersCount', language)}</strong> {providers.length}
                </Typography>
                <Typography variant="body2">
                  <strong>{getTranslation('facilityName', language)}</strong> {hospitalForm.nom || getTranslation('notDefined', language)}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ height: '80vh', width: '100%', position: 'relative' }}>
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
              <Typography variant="body2" fontWeight="bold">{getTranslation('mapNavigation', language)}</Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                <IconButton onClick={zoomIn} size="small" color="primary" title={getTranslation('zoomIn', language)}>
                  <ZoomIn />
                </IconButton>
                <IconButton onClick={zoomOut} size="small" color="primary" title={getTranslation('zoomOut', language)}>
                  <ZoomOut />
                </IconButton>

<IconButton
                    onClick={locateUser}
                    size="small"
                    color="primary"
                    title={loadingLocation ? getTranslation('searchingPosition', language) : getTranslation('useMyPosition', language)}
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

              <Typography variant="body2" fontWeight="bold" sx={{ mt: 1 }}>{getTranslation('mapView', language)}</Typography>
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
    {hospitals
      .filter(hospital => {
        // Filtrer les hôpitaux avec des coordonnées valides
        const hasValidCoords = hospital.latitude != null && hospital.longitude != null && 
                              !isNaN(hospital.latitude) && !isNaN(hospital.longitude);
        
        // Filtrer par rapport à la position utilisateur si elle existe
        const isNotUserPosition = !userLocation ||
               (Math.abs(hospital.latitude - userLocation.lat) > 0.0001 ||
                Math.abs(hospital.longitude - userLocation.lng) > 0.0001);
               
        return hasValidCoords && isNotUserPosition;
      })
      .map(hospital => (
        <Marker
          key={hospital.id}
                 position={{ lat: parseFloat(hospital.latitude), lng: parseFloat(hospital.longitude) }}
                 icon={hospital.active ? ICONS.active : ICONS.inactive}
                 zIndex={10}
                 onClick={() => onMarkerClick(hospital)}
        />
      ))
    }

           {/* Position cliquée */}
           {clickedPosition && (
        <Marker
               position={clickedPosition}
               icon={ICONS.current}
               title={getTranslation('markerSelectedLocation', language)}
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
                   const confirmAdd = window.confirm(getTranslation('confirmAddAtCurrentPosition', language));

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
                           pays: locationInfo.pays || getTranslation('defaultCountry', language),
                           latitude: userLocation.lat,
                           longitude: userLocation.lng,
                           nom: locationInfo.ville
                             ? `${getTranslation('defaultFacilityName', language)} - ${locationInfo.ville}`
                             : getTranslation('defaultFacilityName', language)
                         }));
                       } else {
                         setLocationInfo({
                           ville: getTranslation('defaultCity', language),
                           pays: getTranslation('defaultCountry', language),
                           adresseComplete: `Position: ${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}`,
                           latitude: userLocation.lat,
                           longitude: userLocation.lng
                         });

                         setHospitalForm(prev => ({
                           ...prev,
                           latitude: userLocation.lat,
                           longitude: userLocation.lng,
                           nom: getTranslation('defaultFacilityName', language)
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
    {selectedHospital && selectedHospital.latitude != null && selectedHospital.longitude != null && 
     !isNaN(selectedHospital.latitude) && !isNaN(selectedHospital.longitude) && (
      <InfoWindow
        position={{
          lat: parseFloat(selectedHospital.latitude),
          lng: parseFloat(selectedHospital.longitude)
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
                            {selectedHospital.active ? getTranslation('hospitalActive', language) : getTranslation('hospitalPending', language)}
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
                          🩺 {getTranslation('infoServices', language)} ({selectedHospital.services.length})
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
                          👨‍⚕️ {getTranslation('infoProviders', language)} ({selectedHospital.services.filter(s => s.nomPrestataire).length})
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

                    {/* Bouton d'action compact */}
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
        <Button
          size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => handleReferencePatient(selectedHospital)}
                        startIcon={<FileText sx={{ fontSize: 16 }} />}
                        sx={{
                          fontSize: '0.75rem',
                          py: 0.5,
                          px: 1.5,
                          minWidth: 'auto',
                          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)'
                        }}
                      >
                        {getTranslation('referPatient', language)}
        </Button>
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
                        {getTranslation('editHospital', language)}
        </Button>
      </Box>
    </Box>
                </Box>
              </InfoWindow>
            )}

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
                  {isEditMode ? `${getTranslation('editFacility', language)} ${editingHospital?.nom}` : getTranslation('addHealthFacility', language)}
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
                  {activeStep === 0 ? getTranslation('dialogCancel', language) : getTranslation('dialogBack', language)}
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
                    (isEditMode ? getTranslation('dialogUpdate', language) : getTranslation('dialogSave', language)) :
                    getTranslation('dialogNext', language)
                  }
                </Button>
              </DialogActions>
            </Dialog>
        </GoogleMap>
      </LoadScript>

            {/* Indicateurs */}
            {loadingLocation && (
              <Snackbar
                open={loadingLocation}
                message={getTranslation('detectingPosition', language)}
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
                {getTranslation('clickToAdd', language)}
              </Typography>
            </Box>

            {!mapLoaded && (
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
                  {getTranslation('loadingMap', language)}
                </Typography>
              </Box>
            )}

            {/* Dialog pour la référence de patient */}
            <Dialog
              open={showReferenceDialog}
              onClose={() => setShowReferenceDialog(false)}
              maxWidth="lg"
              fullWidth
            >
              <DialogTitle>
                <Box display="flex" alignItems="center" gap={1}>
                  <FileText color="primary" />
                  {getTranslation('referPatientFor', language)} {selectedHopitalForReference?.nom}
                </Box>
              </DialogTitle>
              <DialogContent>
                <CreateReferenceSurCarte
                  language={language}
                  selectedHospital={selectedHopitalForReference}
                  onBack={() => {
                    setShowReferenceDialog(false);
                    setSelectedHopitalForReference(null);
                  }}
                  onComplete={(data) => {
                    console.log('Référence créée:', data);
                    setShowReferenceDialog(false);
                    setSelectedHopitalForReference(null);
                  }}
                />
              </DialogContent>
            </Dialog>
          </Box>
        );
};

export default CartographyMap;

