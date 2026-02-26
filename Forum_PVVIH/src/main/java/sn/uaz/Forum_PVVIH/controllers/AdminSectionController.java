// AdminSectionController.java
package sn.uaz.Forum_PVVIH.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import sn.uaz.Forum_PVVIH.dtos.SectionCreationDto;
import sn.uaz.Forum_PVVIH.dtos.SectionDto;
import sn.uaz.Forum_PVVIH.services.SectionService;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/admin/sections")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*")
public class AdminSectionController {

    private final SectionService sectionService;

    // Créer une nouvelle section
    @PostMapping
    public ResponseEntity<SectionDto> creerSection(@Valid @RequestBody SectionCreationDto sectionDto) {
        try {
            SectionDto nouvelleSection = sectionService.creerSection(sectionDto);
            return ResponseEntity.ok(nouvelleSection);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Récupérer toutes les sections
    @GetMapping
    public ResponseEntity<List<SectionDto>> getToutesSections() {
        List<SectionDto> sections = sectionService.getToutesSections();
        return ResponseEntity.ok(sections);
    }

    // Récupérer une section par ID
    @GetMapping("/{id}")
    public ResponseEntity<SectionDto> getSectionById(@PathVariable String id) {
        try {
            SectionDto section = sectionService.getSectionById(id);
            return ResponseEntity.ok(section);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Mettre à jour une section
    @PutMapping("/{id}")
    public ResponseEntity<SectionDto> mettreAJourSection(
            @PathVariable String id, 
            @Valid @RequestBody SectionCreationDto sectionDto) {
        try {
            SectionDto sectionMiseAJour = sectionService.mettreAJourSection(id, sectionDto);
            return ResponseEntity.ok(sectionMiseAJour);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Supprimer une section
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimerSection(@PathVariable String id) {
        try {
            sectionService.supprimerSection(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Initialiser les sections par défaut
    @PostMapping("/init")
    public ResponseEntity<String> initialiserSectionsParDefaut() {
        try {
            sectionService.initialiserSectionsParDefaut();
            return ResponseEntity.ok("Sections initialisées avec succès");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors de l'initialisation");
        }
    }
}