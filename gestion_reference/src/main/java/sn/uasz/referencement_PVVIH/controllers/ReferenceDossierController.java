package sn.uasz.referencement_PVVIH.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import sn.uasz.referencement_PVVIH.dtos.ReferenceDossierDto;
import sn.uasz.referencement_PVVIH.services.ReferenceDossierService;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/references-dossiers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReferenceDossierController {
    
    private final ReferenceDossierService referenceDossierService;
    
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ReferenceDossierDto>> getAllReferences() {
        List<ReferenceDossierDto> references = referenceDossierService.getAllReferences();
        return ResponseEntity.ok(references);
    }
    
    @GetMapping("/{codeReference}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ReferenceDossierDto> getReferenceByCode(@PathVariable String codeReference) {
        return referenceDossierService.getReferenceByCode(codeReference)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/patient/{codePatient}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ReferenceDossierDto>> getReferencesByPatient(@PathVariable String codePatient) {
        List<ReferenceDossierDto> references = referenceDossierService.getReferencesByPatient(codePatient);
        return ResponseEntity.ok(references);
    }
    
    @GetMapping("/hopital/{codeHopital}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ReferenceDossierDto>> getReferencesByHopital(@PathVariable String codeHopital) {
        List<ReferenceDossierDto> references = referenceDossierService.getReferencesByHopital(codeHopital);
        return ResponseEntity.ok(references);
    }
    
    @GetMapping("/medecin/{codeDocteur}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ReferenceDossierDto>> getReferencesByDoctor(@PathVariable String codeDocteur) {
        List<ReferenceDossierDto> references = referenceDossierService.getReferencesByDoctor(codeDocteur);
        return ResponseEntity.ok(references);
    }
    
    @GetMapping("/statut/{statut}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ReferenceDossierDto>> getReferencesByStatut(@PathVariable String statut) {
        List<ReferenceDossierDto> references = referenceDossierService.getReferencesByStatut(statut);
        return ResponseEntity.ok(references);
    }
    
    @GetMapping("/recues")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ReferenceDossierDto>> getReferencesRecues() {
        List<ReferenceDossierDto> references = referenceDossierService.getReferencesRecues();
        return ResponseEntity.ok(references);
    }
    
    @GetMapping("/envoyees")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ReferenceDossierDto>> getReferencesEnvoyees() {
        List<ReferenceDossierDto> references = referenceDossierService.getReferencesEnvoyees();
        return ResponseEntity.ok(references);
    }
    
    @GetMapping("/en-attente")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ReferenceDossierDto>> getReferencesEnAttente() {
        List<ReferenceDossierDto> references = referenceDossierService.getReferencesEnAttente();
        return ResponseEntity.ok(references);
    }
    
    @PostMapping
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<ReferenceDossierDto> createReference(@Valid @RequestBody ReferenceDossierDto referenceDossierDto) {
        try {
            ReferenceDossierDto createdReference = referenceDossierService.createReference(referenceDossierDto);
            return ResponseEntity.ok(createdReference);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{codeReference}")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<ReferenceDossierDto> updateReference(
            @PathVariable String codeReference,
            @Valid @RequestBody ReferenceDossierDto referenceDossierDto) {
        try {
            ReferenceDossierDto updatedReference = referenceDossierService.updateReference(codeReference, referenceDossierDto);
            return ResponseEntity.ok(updatedReference);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{codeReference}/accepter")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<ReferenceDossierDto> accepterReference(
            @PathVariable String codeReference,
            @RequestParam String codeDocteur,
            @RequestParam String nomDocteur) {
        try {
            ReferenceDossierDto acceptedReference = referenceDossierService.accepterReference(codeReference, codeDocteur, nomDocteur);
            return ResponseEntity.ok(acceptedReference);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{codeReference}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteReference(@PathVariable String codeReference) {
        try {
            referenceDossierService.deleteReference(codeReference);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/count/envoyees")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Long> countReferencesDossierEnvoyees() {
        long count = referenceDossierService.countReferencesDossierEnvoyees();
        return ResponseEntity.ok(count);
    }
    
    @GetMapping("/count/recues-non-lues")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Long> countReferencesDossierRecuesNonLues() {
        long count = referenceDossierService.countReferencesDossierRecuesNonLues();
        return ResponseEntity.ok(count);
    }
    
    @GetMapping("/can-accept/{codeReference}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Boolean> canAcceptReference(@PathVariable String codeReference) {
        boolean canAccept = referenceDossierService.canAcceptReference(codeReference);
        return ResponseEntity.ok(canAccept);
    }
    
    @GetMapping("/can-edit/{codeReference}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Boolean> canEditReference(@PathVariable String codeReference) {
        boolean canEdit = referenceDossierService.canEditReference(codeReference);
        return ResponseEntity.ok(canEdit);
    }
    
    @PostMapping("/accept/{codeReference}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ReferenceDossierDto> acceptReference(@PathVariable String codeReference) {
        try {
            ReferenceDossierDto acceptedReference = referenceDossierService.accepterReference(codeReference);
            return ResponseEntity.ok(acceptedReference);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
