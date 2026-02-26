package com.enda.crossborder.service;

import com.enda.crossborder.entity.DossierPatient;
import com.enda.crossborder.repository.DossierPatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class DossierPatientService {

    private final DossierPatientRepository dossierPatientRepository;

    /**
     * Sauvegarder un dossier patient
     */
    public DossierPatient save(DossierPatient dossierPatient) {
        try {
            log.info("Sauvegarde du dossier patient: {}", dossierPatient.getCodeDossier());
            return dossierPatientRepository.save(dossierPatient);
        } catch (Exception e) {
            log.error("Erreur lors de la sauvegarde du dossier patient: {}", dossierPatient.getCodeDossier(), e);
            throw new RuntimeException("Erreur lors de la sauvegarde du dossier patient", e);
        }
    }

    /**
     * Trouver un dossier patient par son code
     */
    @Transactional(readOnly = true)
    public DossierPatient findByCodeDossier(String codeDossier) {
        try {
            log.debug("Recherche du dossier patient: {}", codeDossier);
            return dossierPatientRepository.findByCodeDossier(codeDossier).orElse(null);
        } catch (Exception e) {
            log.error("Erreur lors de la recherche du dossier patient: {}", codeDossier, e);
            throw new RuntimeException("Erreur lors de la recherche du dossier patient", e);
        }
    }

    /**
     * Trouver un dossier patient par son ID
     */
    @Transactional(readOnly = true)
    public Optional<DossierPatient> findById(Long id) {
        try {
            log.debug("Recherche du dossier patient par ID: {}", id);
            return dossierPatientRepository.findById(id);
        } catch (Exception e) {
            log.error("Erreur lors de la recherche du dossier patient par ID: {}", id, e);
            throw new RuntimeException("Erreur lors de la recherche du dossier patient", e);
        }
    }

    /**
     * Lister tous les dossiers patients
     */
    @Transactional(readOnly = true)
    public List<DossierPatient> findAll() {
        try {
            log.debug("Récupération de tous les dossiers patients");
            return dossierPatientRepository.findAll();
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des dossiers patients", e);
            throw new RuntimeException("Erreur lors de la récupération des dossiers patients", e);
        }
    }

    /**
     * Supprimer un dossier patient
     */
    public void delete(DossierPatient dossierPatient) {
        try {
            log.info("Suppression du dossier patient: {}", dossierPatient.getCodeDossier());
            dossierPatientRepository.delete(dossierPatient);
        } catch (Exception e) {
            log.error("Erreur lors de la suppression du dossier patient: {}", dossierPatient.getCodeDossier(), e);
            throw new RuntimeException("Erreur lors de la suppression du dossier patient", e);
        }
    }

    /**
     * Supprimer un dossier patient par son code
     */
    public void deleteByCodeDossier(String codeDossier) {
        try {
            DossierPatient dossierPatient = findByCodeDossier(codeDossier);
            if (dossierPatient != null) {
                delete(dossierPatient);
            }
        } catch (Exception e) {
            log.error("Erreur lors de la suppression du dossier patient par code: {}", codeDossier, e);
            throw new RuntimeException("Erreur lors de la suppression du dossier patient", e);
        }
    }

    /**
     * Compter le nombre de dossiers patients
     */
    @Transactional(readOnly = true)
    public long count() {
        try {
            return dossierPatientRepository.count();
        } catch (Exception e) {
            log.error("Erreur lors du comptage des dossiers patients", e);
            throw new RuntimeException("Erreur lors du comptage des dossiers patients", e);
        }
    }

    /**
     * Vérifier si un dossier patient existe par son code
     */
    @Transactional(readOnly = true)
    public boolean existsByCodeDossier(String codeDossier) {
        try {
            return dossierPatientRepository.existsByCodeDossier(codeDossier);
        } catch (Exception e) {
            log.error("Erreur lors de la vérification de l'existence du dossier patient: {}", codeDossier, e);
            throw new RuntimeException("Erreur lors de la vérification de l'existence du dossier patient", e);
        }
    }

    /**
     * Rechercher des dossiers patients par nom complet
     */
    @Transactional(readOnly = true)
    public List<DossierPatient> findByNomCompletContaining(String nomComplet) {
        try {
            log.debug("Recherche des dossiers patients par nom: {}", nomComplet);
            return dossierPatientRepository.findByNomCompletContainingIgnoreCase(nomComplet);
        } catch (Exception e) {
            log.error("Erreur lors de la recherche des dossiers patients par nom: {}", nomComplet, e);
            throw new RuntimeException("Erreur lors de la recherche des dossiers patients", e);
        }
    }

    /**
     * Rechercher des dossiers patients par code patient
     */
    @Transactional(readOnly = true)
    public List<DossierPatient> findByCodePatient(String codePatient) {
        try {
            log.debug("Recherche des dossiers patients par code patient: {}", codePatient);
            return dossierPatientRepository.findByCodePatient(codePatient);
        } catch (Exception e) {
            log.error("Erreur lors de la recherche des dossiers patients par code patient: {}", codePatient, e);
            throw new RuntimeException("Erreur lors de la recherche des dossiers patients", e);
        }
    }
}
