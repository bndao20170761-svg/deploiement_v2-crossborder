package com.enda.crossborder.controller;

import com.enda.crossborder.dto.PatientDataDTO;
import com.enda.crossborder.entity.DossierPatient;
import com.enda.crossborder.service.PatientMappingService;
import com.enda.crossborder.service.DossierPatientService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class PatientController {

    private final PatientMappingService patientMappingService;
    private final DossierPatientService dossierPatientService;

    /**
     * Endpoint pour recevoir les données de a_reference_front
     */
    @PostMapping("/sync")
    public ResponseEntity<?> syncPatientData(@RequestBody PatientDataDTO patientDataDTO) {
        try {
            log.info("Réception des données pour le dossier: {}", patientDataDTO.getCodeDossier());
            
            // Vérifier si le dossier existe déjà
            DossierPatient existingDossier = dossierPatientService.findByCodeDossier(patientDataDTO.getCodeDossier());
            
            if (existingDossier != null) {
                // Mettre à jour le dossier existant
                DossierPatient updatedDossier = patientMappingService.mapToDossierPatient(patientDataDTO);
                updatedDossier.setId(existingDossier.getId());
                updatedDossier.setCreatedAt(existingDossier.getCreatedAt());
                updatedDossier.setUpdatedAt(java.time.LocalDate.now());
                
                DossierPatient savedDossier = dossierPatientService.save(updatedDossier);
                log.info("Dossier mis à jour avec succès: {}", savedDossier.getCodeDossier());
                
                return ResponseEntity.ok("Dossier mis à jour avec succès");
            } else {
                // Créer un nouveau dossier
                DossierPatient newDossier = patientMappingService.mapToDossierPatient(patientDataDTO);
                DossierPatient savedDossier = dossierPatientService.save(newDossier);
                log.info("Nouveau dossier créé avec succès: {}", savedDossier.getCodeDossier());
                
                return ResponseEntity.ok("Nouveau dossier créé avec succès");
            }
            
        } catch (Exception e) {
            log.error("Erreur lors de la synchronisation du dossier: {}", patientDataDTO.getCodeDossier(), e);
            return ResponseEntity.badRequest().body("Erreur lors de la synchronisation: " + e.getMessage());
        }
    }

    /**
     * Endpoint pour récupérer les données d'un patient
     */
    @GetMapping("/{codeDossier}")
    public ResponseEntity<PatientDataDTO> getPatientData(@PathVariable String codeDossier) {
        try {
            DossierPatient dossierPatient = dossierPatientService.findByCodeDossier(codeDossier);
            
            if (dossierPatient == null) {
                return ResponseEntity.notFound().build();
            }
            
            PatientDataDTO patientDataDTO = patientMappingService.mapToPatientDataDTO(dossierPatient);
            return ResponseEntity.ok(patientDataDTO);
            
        } catch (Exception e) {
            log.error("Erreur lors de la récupération du dossier: {}", codeDossier, e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Endpoint pour lister tous les patients
     */
    @GetMapping
    public ResponseEntity<?> getAllPatients() {
        try {
            var patients = dossierPatientService.findAll();
            return ResponseEntity.ok(patients);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération de la liste des patients", e);
            return ResponseEntity.badRequest().body("Erreur lors de la récupération des patients");
        }
    }

    /**
     * Endpoint pour supprimer un patient
     */
    @DeleteMapping("/{codeDossier}")
    public ResponseEntity<?> deletePatient(@PathVariable String codeDossier) {
        try {
            DossierPatient dossierPatient = dossierPatientService.findByCodeDossier(codeDossier);
            
            if (dossierPatient == null) {
                return ResponseEntity.notFound().build();
            }
            
            dossierPatientService.delete(dossierPatient);
            log.info("Dossier supprimé avec succès: {}", codeDossier);
            
            return ResponseEntity.ok("Dossier supprimé avec succès");
            
        } catch (Exception e) {
            log.error("Erreur lors de la suppression du dossier: {}", codeDossier, e);
            return ResponseEntity.badRequest().body("Erreur lors de la suppression: " + e.getMessage());
        }
    }
}
