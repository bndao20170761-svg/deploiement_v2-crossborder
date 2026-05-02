# Requirements Document

## Introduction

Ce document décrit les exigences pour corriger l'accès de l'assistant social au module de référencement PVVIH. Deux problèmes sont identifiés : (1) l'assistant est rejeté lors du chargement des médecins d'un hôpital à l'étape 1 de la procédure `CreateReferenceSurCarte`, ce qui le redirige vers la page de connexion ; (2) l'assistant doit pouvoir consulter les références envoyées et reçues (filtrées par hôpital partagé avec le médecin du patient), ainsi que leurs décomptes, de la même façon qu'un médecin.

## Glossary

- **Assistant** : Utilisateur avec le profil `ASSISTANT` dans `gestion_user`, rattaché à un hôpital via `AssistantSocial.hopitalId`.
- **Doctor** : Utilisateur avec le profil `DOCTOR`, rattaché à un hôpital via `Doctor.hopital`.
- **gestion_user** : Microservice gérant les utilisateurs (doctors, assistants, patients, hôpitaux).
- **gestion_reference** : Microservice gérant les références de dossiers PVVIH.
- **a_reference_front** : Frontend React du module de référencement.
- **Feign Client** : Client HTTP déclaratif utilisé par `gestion_reference` pour appeler `gestion_user`.
- **FeignClientInterceptor** : Composant qui propage le token JWT de la requête entrante vers les appels Feign sortants.
- **JWT** : JSON Web Token utilisé pour l'authentification inter-services.
- **ReferenceDossier** : Entité représentant une référence de dossier médical d'un patient vers un médecin d'un hôpital.
- **Référence envoyée** : Référence dont le patient est suivi par un médecin du même hôpital que l'assistant, avec `validation=true` et `etat=false`.
- **Référence reçue** : Référence dont le patient est suivi par un médecin du même hôpital que l'assistant, avec `validation=true`.
- **CreateReferenceSurCarte** : Composant React permettant à l'assistant d'initier une référence depuis la carte des hôpitaux.
- **ThreadLocal** : Mécanisme Java de stockage de données par thread, utilisé ici pour propager le token JWT dans les appels Feign.

## Requirements

### Requirement 1

**User Story:** En tant qu'assistant, je veux pouvoir charger la liste des médecins d'un hôpital lors de la création d'une référence sur carte, afin de sélectionner le médecin destinataire sans être redirigé vers la page de connexion.

#### Acceptance Criteria

1. WHEN l'assistant initie la procédure `CreateReferenceSurCarte` et que le composant appelle `getDoctorsByHospital(hopitalId)`, THE système SHALL retourner la liste des médecins de cet hôpital sans erreur d'authentification.
2. WHEN `gestion_reference` effectue un appel Feign vers `GET /api/hospitaux/{id}/doctors` de `gestion_user`, THE `FeignClientInterceptor` SHALL propager le token JWT de la requête HTTP entrante vers l'en-tête `Authorization` de l'appel Feign sortant.
3. IF le token JWT n'est pas disponible dans le `RequestContextHolder` au moment de l'appel Feign, THEN THE `FeignClientInterceptor` SHALL tenter de récupérer le token depuis le `ThreadLocal` `CURRENT_TOKEN` défini dans `JwtAuthTokenFilter`.
4. WHEN l'assistant est authentifié avec un token JWT valide contenant le rôle `ROLE_ASSISTANT`, THE `gestion_user` SHALL autoriser l'accès à `GET /api/hospitaux/{id}/doctors` pour ce rôle.

### Requirement 2

**User Story:** En tant qu'assistant, je veux voir les références envoyées pour les patients de mon hôpital, afin de suivre les dossiers initiés depuis mon établissement.

#### Acceptance Criteria

1. WHEN l'assistant appelle `GET /api/references-dossiers/envoyees`, THE système SHALL retourner les références dont le patient est suivi par un médecin rattaché au même hôpital que l'assistant, avec `validation=true` et `etat=false`.
2. WHEN `gestion_reference` recherche le médecin créateur du patient pour filtrer les références, THE `ReferenceServiceHelper` SHALL utiliser le fallback vers `DataSyncService` si le patient n'est pas trouvé en base locale.
3. IF la récupération du médecin créateur du patient échoue via Feign, THEN THE système SHALL exclure silencieusement cette référence du résultat sans lever d'exception bloquante.

### Requirement 3

**User Story:** En tant qu'assistant, je veux voir les références reçues pour les patients de mon hôpital, afin de savoir quels patients ont été référencés vers mon établissement.

#### Acceptance Criteria

1. WHEN l'assistant appelle `GET /api/references-dossiers/recues`, THE système SHALL retourner les références dont le patient est suivi par un médecin rattaché au même hôpital que l'assistant, avec `validation=true`.
2. WHEN le système filtre les références reçues pour l'assistant, THE `ReferenceDossierService` SHALL comparer `patientDoctor.getHopital().getId()` avec `assistant.getHopitalId()` pour déterminer l'appartenance à l'hôpital.
3. IF l'assistant n'a pas de `hopitalId` renseigné, THEN THE système SHALL retourner une liste vide.

### Requirement 4

**User Story:** En tant qu'assistant, je veux voir le décompte des références envoyées et reçues, afin d'avoir un aperçu rapide de l'activité de référencement de mon hôpital.

#### Acceptance Criteria

1. WHEN l'assistant appelle `GET /api/references-dossiers/count/envoyees`, THE système SHALL retourner le nombre de références envoyées filtrées selon les mêmes critères que `getReferencesEnvoyees()`.
2. WHEN l'assistant appelle `GET /api/references-dossiers/count/recues-non-lues`, THE système SHALL retourner le nombre de références reçues non lues filtrées selon les mêmes critères que `getReferencesRecues()`.
3. WHEN l'assistant appelle `GET /api/references-dossiers/count/assistant`, THE système SHALL retourner le nombre total de références associées à l'hôpital de l'assistant.

### Requirement 5

**User Story:** En tant qu'assistant, je veux que le frontend affiche les sections "Références envoyées" et "Références reçues" avec leurs décomptes, afin d'avoir la même visibilité qu'un médecin sur les références de mon hôpital.

#### Acceptance Criteria

1. WHEN l'assistant est connecté sur `a_reference_front`, THE interface SHALL afficher les sections "Références envoyées" et "Références reçues" avec les mêmes composants que ceux utilisés pour le médecin.
2. WHEN le frontend charge les décomptes de références, THE service frontend SHALL appeler les endpoints `/count/envoyees` et `/count/recues-non-lues` en transmettant le token JWT de l'assistant.
3. IF le rôle de l'utilisateur connecté est `ASSISTANT`, THEN THE frontend SHALL afficher les mêmes vues de liste de références que pour le rôle `DOCTOR`.
