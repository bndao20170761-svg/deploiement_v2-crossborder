// SujetController.java
package sn.uaz.Forum_PVVIH.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sn.uaz.Forum_PVVIH.dtos.SujetCreationDto;
import sn.uaz.Forum_PVVIH.dtos.SujetResponseDto;
import sn.uaz.Forum_PVVIH.dtos.SectionDto;
import sn.uaz.Forum_PVVIH.services.SujetService;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/sujets")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class SujetController {

    private final SujetService sujetService;

    @GetMapping
    public ResponseEntity<List<SujetResponseDto>> getAllSujets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            List<SujetResponseDto> sujets = sujetService.getAllSujets(page, size);
            return ResponseEntity.ok(sujets);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<SujetResponseDto> getSujetById(@PathVariable String id) {
        try {
            SujetResponseDto sujet = sujetService.getSujetById(id);
            return ResponseEntity.ok(sujet);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Nouvel endpoint pour lire un sujet (publique, sans authentification)
    @GetMapping("/{id}/lire")
    public ResponseEntity<SujetResponseDto> lireSujet(@PathVariable String id) {
        log.info("📖 GET /api/sujets/{}/lire - Lecture publique du sujet", id);
        try {
            SujetResponseDto sujet = sujetService.lireSujet(id);
            return ResponseEntity.ok(sujet);
        } catch (Exception e) {
            log.error("❌ Erreur lors de la lecture du sujet {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<SujetResponseDto> createSujet(@Valid @RequestBody SujetCreationDto sujetDto) {
        log.info("📝 POST /api/sujets - Création d'un nouveau sujet: {}", sujetDto.getTitre());
        try {
            SujetResponseDto sujet = sujetService.createSujet(sujetDto);
            log.info("✅ Sujet créé avec succès: {}", sujet.getId());
            return ResponseEntity.ok(sujet);
        } catch (Exception e) {
            log.error("❌ Erreur lors de la création du sujet: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<SujetResponseDto> updateSujet(
            @PathVariable String id,
            @Valid @RequestBody SujetCreationDto sujetDto) {
        try {
            SujetResponseDto sujet = sujetService.updateSujet(id, sujetDto);
            return ResponseEntity.ok(sujet);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/user/{userId}")
    public ResponseEntity<SujetResponseDto> updateSujetByUserId(
            @PathVariable Long userId,
            @Valid @RequestBody SujetCreationDto sujetDto) {
        try {
            log.info("📝 PUT /api/sujets/user/{} - Modification du sujet de l'utilisateur", userId);
            SujetResponseDto sujet = sujetService.updateSujetByUserId(userId, sujetDto);
            log.info("✅ Sujet modifié avec succès pour l'utilisateur: {}", userId);
            return ResponseEntity.ok(sujet);
        } catch (Exception e) {
            log.error("❌ Erreur lors de la modification du sujet pour l'utilisateur {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSujet(@PathVariable String id) {
        try {
            sujetService.deleteSujet(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Endpoints supplémentaires
    @GetMapping("/section/{sectionId}")
    public ResponseEntity<List<SujetResponseDto>> getSujetsBySection(@PathVariable String sectionId) {
        try {
            List<SujetResponseDto> sujets = sujetService.getSujetsBySection(sectionId);
            return ResponseEntity.ok(sujets);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/auteur/{auteurId}")
    public ResponseEntity<List<SujetResponseDto>> getSujetsByAuteur(@PathVariable String auteurId) {
        try {
            List<SujetResponseDto> sujets = sujetService.getSujetsByAuteur(auteurId);
            return ResponseEntity.ok(sujets);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/recents")
    public ResponseEntity<List<SujetResponseDto>> getSujetsRecents(
            @RequestParam(defaultValue = "5") int limit) {
        try {
            List<SujetResponseDto> sujets = sujetService.getSujetsRecents(limit);
            return ResponseEntity.ok(sujets);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Endpoint public pour récupérer toutes les sections (pour l'autocomplétion)
    @GetMapping("/sections")
    public ResponseEntity<List<SectionDto>> getAllSections() {
        try {
            List<SectionDto> sections = sujetService.getAllSections();
            return ResponseEntity.ok(sections);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Endpoints pour gérer le statut des sujets
    @PutMapping("/{id}/activer")
    public ResponseEntity<SujetResponseDto> activerSujet(@PathVariable String id) {
        try {
            log.info("🟢 PUT /api/sujets/{}/activer - Activation du sujet", id);
            SujetResponseDto sujet = sujetService.activerSujet(id);
            log.info("✅ Sujet activé avec succès: {}", id);
            return ResponseEntity.ok(sujet);
        } catch (Exception e) {
            log.error("❌ Erreur lors de l'activation du sujet {}: {}", id, e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}/desactiver")
    public ResponseEntity<SujetResponseDto> desactiverSujet(@PathVariable String id) {
        try {
            log.info("🔴 PUT /api/sujets/{}/desactiver - Désactivation du sujet", id);
            SujetResponseDto sujet = sujetService.desactiverSujet(id);
            log.info("✅ Sujet désactivé avec succès: {}", id);
            return ResponseEntity.ok(sujet);
        } catch (Exception e) {
            log.error("❌ Erreur lors de la désactivation du sujet {}: {}", id, e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/actifs")
    public ResponseEntity<List<SujetResponseDto>> getSujetsActifs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            List<SujetResponseDto> sujets = sujetService.getSujetsActifs(page, size);
            return ResponseEntity.ok(sujets);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/inactifs")
    public ResponseEntity<List<SujetResponseDto>> getSujetsInactifs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            List<SujetResponseDto> sujets = sujetService.getSujetsInactifs(page, size);
            return ResponseEntity.ok(sujets);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}