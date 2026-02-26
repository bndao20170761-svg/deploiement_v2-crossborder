package sn.uasz.referencement_PVVIH.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import sn.uasz.referencement_PVVIH.dtos.ReferenceDto;
import sn.uasz.referencement_PVVIH.dtos.ReferenceValidationDto;
import sn.uasz.referencement_PVVIH.entities.Reference;
import sn.uasz.referencement_PVVIH.mappers.ReferenceMapper;
import sn.uasz.referencement_PVVIH.services.ReferenceService;

import java.util.List;
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003", "http://gateway-pvvih:8080"})
@RestController
@RequestMapping("/api/references")
@RequiredArgsConstructor
public class ReferencementController {
    private final ReferenceService service;
    private  final ReferenceMapper mapper;

    @PreAuthorize("hasRole('DOCTOR') or hasRole('ASSISTANT')")
    @PostMapping("/New_ref")
    public ResponseEntity<Reference> createReference(@RequestBody ReferenceDto dto) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        // 🔍 Debug: Afficher toutes les authorities
        String authoritiesString = auth.getAuthorities().toString();
        System.out.println("🔍 Authorities du token: " + authoritiesString);
        System.out.println("🔍 Username: " + auth.getName());
        
        // Extraire les rôles de manière plus fiable
        boolean isDoctor = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().contains("DOCTOR"));
        boolean isAssistant = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().contains("ASSISTANT"));

        Reference savedRef;

        if (isDoctor) {
            System.out.println("✅ Utilisateur identifié comme DOCTOR");
            savedRef = service.createReference(dto);
        } else if (isAssistant) {
            System.out.println("✅ Utilisateur identifié comme ASSISTANT");
            savedRef = service.createReferenceByAssistant(dto);
        } else {
            System.out.println("❌ Rôle non reconnu. Authorities: " + authoritiesString);
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(null);
        }

        return ResponseEntity.ok(savedRef);
    }

    @PostMapping("/assistant")
    public ResponseEntity<Reference> creerReference(@RequestBody ReferenceDto dto) {
        System.out.println("📥 Reçu DTO: " + dto);
        Reference saved = service.createReferenceByAssistant(dto);
        return ResponseEntity.ok(saved);
    }

    @PreAuthorize("hasRole('DOCTOR') or hasRole('ASSISTANT')")
    @PutMapping("/contreReference/{id}")
    public ResponseEntity<ReferenceDto> contreReference(@PathVariable Long id) {
        Reference ref = service.contreReference(id);
        return ResponseEntity.ok(mapper.toReferenceDto(ref));
    }
    @PreAuthorize("hasRole('DOCTOR')")

    @PutMapping("/{id}/validation")
    public ResponseEntity<ReferenceValidationDto> validationReference(@PathVariable("id") Long referenceId) {
        try {
            ReferenceValidationDto validatedRef = service.validationReference(referenceId);
            return ResponseEntity.ok(validatedRef);
        } catch (RuntimeException ex) {
            if (ex.getMessage().contains("autorisé") || ex.getMessage().contains("Seul un médecin")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }




    @PreAuthorize("hasRole('DOCTOR')")
    @GetMapping("/count-envoyees-assistant")
    public ResponseEntity<Long> getCountReferencesEnvoyeesParAssistant() {
        try {
            long count = service.countReferencesEnvoyeesParAssistant();
            return ResponseEntity.ok(count);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(0L);
        }
    }
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ASSISTANT')")
    @GetMapping
    public ResponseEntity<List<ReferenceDto>> getAll() {
        List<ReferenceDto> references = service.findAll();
        return ResponseEntity.ok(references);
    }
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ASSISTANT')")
    @GetMapping("/{id}")
    public ResponseEntity<ReferenceDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }
    @PreAuthorize("hasRole('DOCTOR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteReference(id);
        return ResponseEntity.noContent().build();
    }
    @PreAuthorize("hasRole('DOCTOR')")
    @GetMapping("/sent")
    public ResponseEntity<List<ReferenceDto>> getReferencesEnvoyees() {
        System.out.println("🔥 getReferencesEnvoyees() called");
        List<ReferenceDto> result = service.getReferencesEnvoyees();
        System.out.println("✅ result envoyées = {}"+result);
        return ResponseEntity.ok(result);
    }

    @PreAuthorize("hasRole('DOCTOR') ")
    @GetMapping("/received")
    public ResponseEntity<List<ReferenceDto>> getReferencesRecues() {
        return ResponseEntity.ok(service.getReferencesRecues());
    }

    @PreAuthorize("hasRole('DOCTOR') ")
    @GetMapping("/count/recues-non-lues")
    public ResponseEntity<Long> countRecuesNonLues() {
        return ResponseEntity.ok(service.countReferencesRecuesNonLues());
    }
    @PreAuthorize("hasRole('DOCTOR') ")
    @GetMapping("/count/envoyees")
    public ResponseEntity<Long> countEnvoyees() {
        return ResponseEntity.ok(service.countReferencesEnvoyees());
    }
    @PreAuthorize("hasRole('DOCTOR')")
    @PutMapping("/{id}")
    public ResponseEntity<ReferenceDto> updateReference(
            @PathVariable Long id,
            @RequestBody ReferenceDto dto
    ) {
        Reference updated = service.updateReference(id, dto);
        return ResponseEntity.ok(mapper.toReferenceDto(updated));
    }

}
