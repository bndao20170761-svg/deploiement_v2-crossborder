package sn.uasz.referencement_PVVIH.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import sn.uasz.referencement_PVVIH.dtos.DossierViewDto;
import sn.uasz.referencement_PVVIH.services.ReferenceDossierService;

@RestController
@RequestMapping("/api/dossiers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DossierProxyController {

    private final ReferenceDossierService referenceDossierService;

    @GetMapping("/view/{codeDossier}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<DossierViewDto> getDossierView(@PathVariable String codeDossier) {
        try {
            DossierViewDto dossier = referenceDossierService.getDossierFromGestionPatient(codeDossier);
            return ResponseEntity.ok(dossier);
        } catch (Exception e) {
            return ResponseEntity.status(502).build();
        }
    }
}
