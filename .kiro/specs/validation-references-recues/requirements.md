# Requirements Document

## Introduction

Ce document décrit les exigences pour corriger l'affichage de la liste des références reçues dans le module `gestion_reference`. Lorsqu'un assistant initie une référence, le champ `validation` est positionné à `false` en attente de validation par le médecin référenceur. Ces références ne doivent pas apparaître dans la liste "Références reçues" tant que `validation` ne passe pas à `true`. Le problème concerne à la fois l'affichage côté frontend et le filtrage côté backend.

## Glossary

- **ReferenceDossier** : Entité représentant une référence de dossier médical d'un patient vers un médecin d'un hôpital.
- **validation** : Champ booléen de `ReferenceDossier`. `false` = référence initiée par un assistant, en attente de validation du médecin. `true` = référence validée, visible dans les listes.
- **etat** : Champ booléen de `ReferenceDossier`. `false` = référence non encore acceptée par le destinataire. `true` = référence acceptée (statut RECUE).
- **Références reçues** : Liste des références adressées au médecin connecté (ou à l'hôpital de l'assistant), avec `validation=true`.
- **Références envoyées** : Liste des références émises par le médecin connecté (ou l'hôpital de l'assistant), avec `validation=true` et `etat=false`.
- **Assistant** : Utilisateur avec le profil `ASSISTANT`, rattaché à un hôpital.
- **Doctor** : Utilisateur avec le profil `DOCTOR`, rattaché à un hôpital.
- **gestion_reference** : Microservice Spring Boot gérant les références de dossiers PVVIH.
- **a_reference_front** : Frontend React du module de référencement.
- **ReferenceDossierService** : Service Spring Boot contenant la logique métier des références.
- **ReferenceDossierList** : Composant React affichant la liste des références reçues ou envoyées.

## Requirements

### Requirement 1

**User Story:** En tant que médecin destinataire, je veux que la liste des références reçues n'affiche que les références validées, afin de ne pas voir les références encore en attente de validation par le médecin référenceur.

#### Acceptance Criteria

1. WHEN le médecin connecté appelle `GET /api/references-dossiers/recues`, THE système SHALL retourner uniquement les références dont `validation=true` et dont `codeDocteur` correspond au code du médecin connecté.
2. WHILE `validation=false`, THE système SHALL exclure la référence de la liste retournée par `GET /api/references-dossiers/recues`, quel que soit le rôle de l'utilisateur connecté.
3. WHEN un assistant initie une référence, THE système SHALL positionner `validation=false` sur la référence créée, de sorte qu'elle n'apparaisse pas dans la liste des références reçues du médecin destinataire.

### Requirement 2

**User Story:** En tant qu'assistant, je veux que la liste des références reçues de mon hôpital n'affiche que les références validées, afin d'avoir une vue cohérente avec celle du médecin.

#### Acceptance Criteria

1. WHEN l'assistant connecté appelle `GET /api/references-dossiers/recues`, THE système SHALL retourner uniquement les références dont `validation=true` et dont le patient est suivi par un médecin du même hôpital que l'assistant.
2. IF `validation=false`, THEN THE système SHALL exclure la référence de la liste retournée pour l'assistant, même si le patient appartient à l'hôpital de l'assistant.

### Requirement 3

**User Story:** En tant que médecin référenceur, je veux voir dans la liste des références envoyées les références initiées par un assistant (validation=false) pour mes patients, afin de pouvoir les valider.

#### Acceptance Criteria

1. WHEN le médecin connecté appelle `GET /api/references-dossiers/envoyees`, THE système SHALL inclure les références dont `validation=false` et dont le `codePatient` correspond à un patient du médecin connecté.
2. WHEN le médecin valide une référence via `POST /api/references-dossiers/valider/{codeReference}`, THE système SHALL positionner `validation=true` sur la référence, la rendant visible dans la liste des références reçues du médecin destinataire.
3. WHILE `validation=false`, THE système SHALL afficher la référence avec un indicateur visuel distinct (fond jaune) dans la liste des références envoyées du médecin référenceur.

### Requirement 4

**User Story:** En tant qu'utilisateur du frontend, je veux que le composant `ReferenceDossierList` reflète fidèlement le filtre `validation` retourné par le backend, afin que l'affichage soit cohérent avec les données réelles.

#### Acceptance Criteria

1. WHEN le backend retourne une liste de références pour l'onglet "recues", THE `ReferenceDossierList` SHALL afficher uniquement les références présentes dans la réponse, sans appliquer de filtre supplémentaire côté client sur `validation`.
2. WHEN une référence a `validation=false` et apparaît dans l'onglet "envoyees", THE `ReferenceDossierList` SHALL afficher cette référence avec un fond jaune pour indiquer qu'elle est en attente de validation.
3. WHEN le médecin valide une référence depuis la liste des envoyées, THE `ReferenceDossierList` SHALL recharger la liste pour refléter le changement de statut.
