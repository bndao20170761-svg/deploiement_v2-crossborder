# Requirements Document

## Introduction

Ce document définit les exigences pour améliorer le système de chargement des prestataires lors de la modification d'un hôpital. Actuellement, le formulaire de modification d'hôpital ne charge pas les prestataires de manière fiable, car il dépend d'une cascade de sources de données (localStorage, initialData.prestataires, puis l'endpoint /prestataires-only). Cette approche entraîne des situations où les prestataires ne s'affichent pas lors de l'ouverture du formulaire de modification.

L'objectif est de garantir que les prestataires soient toujours chargés automatiquement et de manière fiable lors de la modification d'un hôpital, en utilisant l'endpoint backend existant `/prestataires-only` comme source de vérité principale.

## Glossary

- **System**: Le système frontend de gestion des hôpitaux (HospitalForm.js)
- **Backend**: Le service backend User_API_PVVIH qui expose les endpoints REST
- **Prestataire**: Un professionnel de santé (médecin, assistant social, pédiatre) associé à un hôpital
- **HospitalForm**: Le composant React responsable de la création et modification des hôpitaux
- **Endpoint_Prestataires**: L'endpoint backend `GET /api/hospitaux/{id}/prestataires-only`
- **LocalStorage**: Le stockage local du navigateur utilisé comme cache temporaire
- **InitialData**: Les données initiales passées au formulaire lors de son ouverture

## Requirements

### Requirement 1: Chargement automatique des prestataires

**User Story:** En tant qu'utilisateur, je veux que les prestataires d'un hôpital se chargent automatiquement lors de l'ouverture du formulaire de modification, afin de pouvoir visualiser et modifier les prestataires existants sans action manuelle.

#### Acceptance Criteria

1. WHEN THE HospitalForm est ouvert en mode modification avec un ID d'hôpital valide, THE System SHALL appeler automatiquement THE Endpoint_Prestataires
2. WHEN THE Endpoint_Prestataires retourne des données valides, THE System SHALL afficher les prestataires dans le formulaire
3. WHEN THE Endpoint_Prestataires retourne une liste vide, THE System SHALL afficher un message indiquant qu'aucun prestataire n'est associé à cet hôpital
4. THE System SHALL effectuer le chargement des prestataires pendant l'initialisation du composant (useEffect)
5. WHEN le chargement des prestataires est en cours, THE System SHALL afficher un indicateur de chargement visuel

### Requirement 2: Priorisation de la source de données

**User Story:** En tant que développeur, je veux que le système utilise l'endpoint backend comme source de vérité principale pour les prestataires, afin d'éviter les incohérences dues aux données en cache.

#### Acceptance Criteria

1. THE System SHALL utiliser THE Endpoint_Prestataires comme source de données principale pour les prestataires
2. WHEN THE HospitalForm est ouvert en mode modification, THE System SHALL ignorer les données de LocalStorage pour les prestataires
3. WHEN THE HospitalForm est ouvert en mode modification, THE System SHALL ignorer InitialData.prestataires si présent
4. WHEN THE Endpoint_Prestataires retourne des données, THE System SHALL remplacer toutes les données de prestataires existantes dans l'état du composant
5. THE System SHALL effectuer l'appel à THE Endpoint_Prestataires avant d'afficher le formulaire à l'utilisateur

### Requirement 3: Gestion des erreurs de chargement

**User Story:** En tant qu'utilisateur, je veux être informé si le chargement des prestataires échoue, afin de comprendre pourquoi les données ne s'affichent pas et de pouvoir réessayer.

#### Acceptance Criteria

1. WHEN THE Endpoint_Prestataires retourne une erreur HTTP (4xx ou 5xx), THE System SHALL afficher un message d'erreur explicite
2. WHEN une erreur réseau se produit lors de l'appel à THE Endpoint_Prestataires, THE System SHALL afficher un message d'erreur réseau
3. WHEN le chargement des prestataires échoue, THE System SHALL permettre à l'utilisateur de réessayer le chargement
4. WHEN une erreur se produit, THE System SHALL logger les détails de l'erreur dans la console pour le débogage
5. WHEN le token d'authentification est invalide ou expiré, THE System SHALL afficher un message d'erreur d'authentification approprié

### Requirement 4: Synchronisation avec le backend

**User Story:** En tant qu'utilisateur, je veux que les modifications apportées aux prestataires soient toujours synchronisées avec le backend, afin que les données restent cohérentes entre les sessions.

#### Acceptance Criteria

1. WHEN un prestataire est ajouté dans le formulaire, THE System SHALL mettre à jour l'état local uniquement (pas de sauvegarde immédiate au backend)
2. WHEN un prestataire est modifié dans le formulaire, THE System SHALL mettre à jour l'état local uniquement
3. WHEN un prestataire est supprimé dans le formulaire, THE System SHALL mettre à jour l'état local uniquement
4. WHEN l'utilisateur soumet le formulaire, THE System SHALL envoyer tous les prestataires (ajoutés, modifiés, supprimés) au backend
5. THE System SHALL ne plus utiliser LocalStorage pour persister les prestataires entre les sessions

### Requirement 5: Expérience utilisateur fluide

**User Story:** En tant qu'utilisateur, je veux une expérience de chargement fluide et informative, afin de comprendre l'état du système à tout moment.

#### Acceptance Criteria

1. WHEN le chargement des prestataires commence, THE System SHALL afficher un indicateur de chargement (spinner ou skeleton)
2. WHEN le chargement des prestataires est terminé avec succès, THE System SHALL masquer l'indicateur de chargement
3. WHEN le chargement des prestataires échoue, THE System SHALL masquer l'indicateur de chargement et afficher un message d'erreur
4. THE System SHALL afficher le nombre de prestataires chargés dans l'interface
5. WHEN aucun prestataire n'est trouvé, THE System SHALL afficher un message informatif encourageant l'utilisateur à ajouter des prestataires

### Requirement 6: Compatibilité avec le mode création

**User Story:** En tant qu'utilisateur, je veux que le formulaire continue de fonctionner normalement en mode création (sans ID d'hôpital), afin de pouvoir créer de nouveaux hôpitaux sans régression.

#### Acceptance Criteria

1. WHEN THE HospitalForm est ouvert en mode création (sans initialData.id), THE System SHALL ne pas appeler THE Endpoint_Prestataires
2. WHEN THE HospitalForm est en mode création, THE System SHALL permettre l'ajout de prestataires manuellement
3. WHEN THE HospitalForm est en mode création, THE System SHALL initialiser la liste des prestataires comme vide
4. THE System SHALL détecter le mode (création vs modification) en vérifiant la présence de initialData.id
5. WHEN le formulaire est en mode création, THE System SHALL ne pas afficher d'indicateur de chargement pour les prestataires

### Requirement 7: Nettoyage du code legacy

**User Story:** En tant que développeur, je veux supprimer le code obsolète lié au localStorage des prestataires, afin de simplifier la maintenance et d'éviter les bugs liés aux données en cache.

#### Acceptance Criteria

1. THE System SHALL supprimer les fonctions saveProvidersToLocalStorage, loadProvidersFromLocalStorage, et clearProvidersFromLocalStorage
2. THE System SHALL supprimer l'état hospitalProvidersCache qui n'est plus nécessaire
3. THE System SHALL supprimer tous les appels à localStorage pour les prestataires
4. THE System SHALL supprimer la logique de fallback qui vérifie localStorage puis initialData.prestataires
5. THE System SHALL conserver uniquement la logique d'appel direct à THE Endpoint_Prestataires pour le mode modification
