// src/components/AdvancedSearch.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Typography,
  Chip,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Search,
  Clear,
  LocalHospital,
  LocationOn,
  Phone,
} from "@mui/icons-material";

const AdvancedSearch = () => {
  const [searchCriteria, setSearchCriteria] = useState({
    nom: "",
    ville: "",
    pays: "",
    serviceMedical: "",
    actif: "",
  });

  const [resultats, setResultats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [villes, setVilles] = useState([]);
  const [pays, setPays] = useState([]);

  // Données mockées pour services médicaux (remplacer par API si besoin)
  const servicesMedicaux = [
    { code: "CDI", nom: "Centre de Dépistage Intégré" },
    { code: "USP", nom: "Unité de Soins et Prise en charge" },
    { code: "PTME", nom: "Prévention Transmission Mère-Enfant" },
    { code: "LABO", nom: "Laboratoire d'analyses" },
    { code: "PHARM", nom: "Pharmacie" },
  ];

  useEffect(() => {
    chargerFiltres();
  }, []);

  const chargerFiltres = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.REACT_APP_GATEWAY_URL || 'http://localhost:8081'}/api/hopitaux-proxy/actifs`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const hopitaux = await response.json();

        // Extraire villes et pays uniques
        const villesUniques = [
          ...new Set(hopitaux.map((h) => h.ville)),
        ].filter(Boolean);
        const paysUniques = [
          ...new Set(hopitaux.map((h) => h.pays)),
        ].filter(Boolean);

        setVilles(villesUniques);
        setPays(paysUniques);
      }
    } catch (err) {
      console.error("Erreur chargement filtres:", err);
    }
  };

  const handleInputChange = (field) => (event) => {
    setSearchCriteria((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const effectuerRecherche = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const params = new URLSearchParams();

      // Ajouter les critères de recherche non vides
      Object.entries(searchCriteria).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(
        `${process.env.REACT_APP_GATEWAY_URL || 'http://localhost:8081'}/api/hopitaux-proxy/recherche?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Erreur lors de la recherche");

      const data = await response.json();
      setResultats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const reinitialiserRecherche = () => {
    setSearchCriteria({
      nom: "",
      ville: "",
      pays: "",
      serviceMedical: "",
      actif: "",
    });
    setResultats([]);
    setError(null);
  };

  const criteresActifs = Object.values(searchCriteria).filter(
    (val) => val !== ""
  ).length;

  return (
    <Box>
      {/* Formulaire de recherche */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          🔍 Critères de Recherche
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nom de l'hôpital"
              value={searchCriteria.nom}
              onChange={handleInputChange("nom")}
              placeholder="Ex: Hôpital Régional de Ziguinchor"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Ville</InputLabel>
              <Select
                value={searchCriteria.ville}
                onChange={handleInputChange("ville")}
                label="Ville"
              >
                <MenuItem value="">Toutes les villes</MenuItem>
                {villes.map((ville) => (
                  <MenuItem key={ville} value={ville}>
                    {ville}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Pays</InputLabel>
              <Select
                value={searchCriteria.pays}
                onChange={handleInputChange("pays")}
                label="Pays"
              >
                <MenuItem value="">Tous les pays</MenuItem>
                {pays.map((pays) => (
                  <MenuItem key={pays} value={pays}>
                    {pays}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Service médical</InputLabel>
              <Select
                value={searchCriteria.serviceMedical}
                onChange={handleInputChange("serviceMedical")}
                label="Service médical"
              >
                <MenuItem value="">Tous les services</MenuItem>
                {servicesMedicaux.map((service) => (
                  <MenuItem key={service.code} value={service.code}>
                    {service.nom} ({service.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Statut</InputLabel>
              <Select
                value={searchCriteria.actif}
                onChange={handleInputChange("actif")}
                label="Statut"
              >
                <MenuItem value="">Tous les statuts</MenuItem>
                <MenuItem value="true">Actif</MenuItem>
                <MenuItem value="false">Inactif</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Search />}
            onClick={effectuerRecherche}
            disabled={loading}
            aria-label="Rechercher"
          >
            {loading ? <CircularProgress size={24} /> : "Rechercher"}
          </Button>

          <Button
            variant="outlined"
            startIcon={<Clear />}
            onClick={reinitialiserRecherche}
          >
            Réinitialiser
          </Button>
        </Box>

        {criteresActifs > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Filtres actifs: {criteresActifs}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Résultats */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          📋 Résultats de la Recherche ({resultats.length} structures trouvées)
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {resultats.length === 0 && !loading && (
          <Typography
            color="text.secondary"
            sx={{ textAlign: "center", py: 4 }}
          >
            Aucun résultat trouvé. Modifiez vos critères de recherche.
          </Typography>
        )}

        <Grid container spacing={2}>
          {resultats.map((hopital) => (
            <Grid item xs={12} md={6} key={hopital.id}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" alignItems="flex-start" gap={2}>
                    <LocalHospital color="primary" />
                    <Box flex={1}>
                      <Typography variant="h6" gutterBottom>
                        {hopital.nom}
                      </Typography>

                      <Box
                        display="flex"
                        alignItems="center"
                        gap={1}
                        sx={{ mb: 1 }}
                      >
                        <LocationOn fontSize="small" color="action" />
                        <Typography variant="body2">
                          {hopital.ville}, {hopital.pays}
                        </Typography>
                        <Chip
                          label={hopital.active ? "Actif" : "Inactif"}
                          size="small"
                          color={hopital.active ? "success" : "default"}
                        />
                      </Box>

                      {hopital.telephoneFixe && (
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={1}
                          sx={{ mb: 1 }}
                        >
                          <Phone fontSize="small" color="action" />
                          <Typography variant="body2">
                            {hopital.telephoneFixe}
                          </Typography>
                        </Box>
                      )}

                      {hopital.adresseComplete && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          {hopital.adresseComplete}
                        </Typography>
                      )}

                      {hopital.latitude && hopital.longitude && (
                        <Chip
                          label="📍 Géolocalisé"
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default AdvancedSearch;
