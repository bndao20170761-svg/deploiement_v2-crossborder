package sn.uasz.Patient_PVVIH.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import sn.uasz.Patient_PVVIH.dtos.DossierDTO;
import sn.uasz.Patient_PVVIH.dtos.DossierViewDto;
import sn.uasz.Patient_PVVIH.entities.Dossier;
import sn.uasz.Patient_PVVIH.mappers.PatientPvvihMapper;
import sn.uasz.Patient_PVVIH.services.DossierService;

@RestController
@RequestMapping("/api/dossiers")
@RequiredArgsConstructor
public class DossierController {
    private final PatientPvvihMapper mapper;
    private final DossierService dossierService;

    /**
     * ✅ Endpoint pour créer un dossier patient
     */
    // @PreAuthorize("hasRole('DOCTOR')") // Temporairement désactivé pour debug
    @PostMapping
    public ResponseEntity<DossierViewDto> createDossier(@RequestBody DossierDTO dossierDTO) {
        System.out.println("📥 identificationBiom reçu = " +
                (dossierDTO.getIdentificationBiom() != null
                        ? dossierDTO.getIdentificationBiom().substring(0, Math.min(50, dossierDTO.getIdentificationBiom().length()))
                        : "null"));

        Dossier dossier = dossierService.createDossierPatient(dossierDTO);
        
        // Construire une réponse simple avec juste les infos de base
        DossierViewDto view = new DossierViewDto();
        view.setCodeDossier(dossier.getCodeDossier());
        view.setCodePatient(dossier.getPatientCode());
        view.setIdentificationBiom(dossier.getIdentificationBiom());
        
        System.out.println("✅ Dossier créé avec code: " + dossier.getCodeDossier());
        
        return ResponseEntity.ok(view);
    }


    // @PreAuthorize("hasRole('DOCTOR')") // Temporairement désactivé pour debug
    @GetMapping("/{codePatient}")
    public DossierViewDto getDossierView(@PathVariable String codePatient) {
        return dossierService.dossierView(codePatient);
    }
    // @PreAuthorize("hasRole('DOCTOR')") // Temporairement désactivé pour debug
    @GetMapping("/{codePatient}/has-dossier")
    public boolean patientHasDossier(@PathVariable String codePatient) {
        return dossierService.hasDossier(codePatient);
    }

    /**
     * Endpoint pour obtenir tous les dossiers d'un patient (pour Frontend)
     */
    // @PreAuthorize("hasRole('DOCTOR')") // Temporairement désactivé pour debug
    @GetMapping("/by-patient/{codePatient}")
    public java.util.List<DossierViewDto> getDossiersByPatient(@PathVariable String codePatient) {
        return dossierService.getDossiersByPatient(codePatient);
    }

}
