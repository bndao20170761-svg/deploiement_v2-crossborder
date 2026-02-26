package sn.uaz.Forum_PVVIH.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sn.uaz.Forum_PVVIH.dtos.CommentaireCreationDto;
import sn.uaz.Forum_PVVIH.dtos.CommentaireResponseDto;
import sn.uaz.Forum_PVVIH.services.CommentaireService;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/commentaires")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class CommentaireController {

    private final CommentaireService commentaireService;

    // Créer un nouveau commentaire
    @PostMapping("/sujet/{sujetId}")
    public ResponseEntity<CommentaireResponseDto> createCommentaire(
            @PathVariable String sujetId,
            @Valid @RequestBody CommentaireCreationDto commentaireDto) {
        log.info("💬 POST /api/commentaires/sujet/{} - Création d'un nouveau commentaire", sujetId);
        try {
            CommentaireResponseDto commentaire = commentaireService.createCommentaire(sujetId, commentaireDto);
            return ResponseEntity.ok(commentaire);
        } catch (Exception e) {
            log.error("❌ Erreur lors de la création du commentaire: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // Récupérer les commentaires d'un sujet (avec pagination)
    @GetMapping("/sujet/{sujetId}")
    public ResponseEntity<List<CommentaireResponseDto>> getCommentairesBySujet(
            @PathVariable String sujetId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("📝 GET /api/commentaires/sujet/{} - Récupération des commentaires (page={}, size={})", 
                sujetId, page, size);
        try {
            List<CommentaireResponseDto> commentaires = commentaireService.getCommentairesBySujet(sujetId, page, size);
            return ResponseEntity.ok(commentaires);
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération des commentaires: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    // Récupérer tous les commentaires d'un sujet (sans pagination)
    @GetMapping("/sujet/{sujetId}/all")
    public ResponseEntity<List<CommentaireResponseDto>> getAllCommentairesBySujet(@PathVariable String sujetId) {
        log.info("📝 GET /api/commentaires/sujet/{}/all - Récupération de tous les commentaires", sujetId);
        try {
            List<CommentaireResponseDto> commentaires = commentaireService.getAllCommentairesBySujet(sujetId);
            return ResponseEntity.ok(commentaires);
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération de tous les commentaires: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    // Supprimer un commentaire
    @DeleteMapping("/{commentaireId}")
    public ResponseEntity<Void> deleteCommentaire(@PathVariable String commentaireId) {
        log.info("🗑️ DELETE /api/commentaires/{} - Suppression du commentaire", commentaireId);
        try {
            commentaireService.deleteCommentaire(commentaireId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("❌ Erreur lors de la suppression du commentaire: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // Récupérer les notifications d'un utilisateur
    @GetMapping("/notifications/{userId}")
    public ResponseEntity<List<CommentaireResponseDto>> getNotificationsByUser(@PathVariable String userId) {
        log.info("🔔 GET /api/commentaires/notifications/{} - Récupération des notifications", userId);
        try {
            List<CommentaireResponseDto> notifications = commentaireService.getNotificationsByUser(userId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération des notifications: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // Récupérer le nombre de notifications d'un utilisateur
    @GetMapping("/notifications/{userId}/count")
    public ResponseEntity<Integer> getNombreNotificationsByUser(@PathVariable String userId) {
        log.info("🔢 GET /api/commentaires/notifications/{}/count - Récupération du nombre de notifications", userId);
        try {
            int count = commentaireService.getNombreNotificationsByUser(userId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération du nombre de notifications: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // Activer un commentaire (marquer comme lu)
    @PutMapping("/{commentaireId}/activer")
    public ResponseEntity<CommentaireResponseDto> activerCommentaire(@PathVariable String commentaireId) {
        log.info("✅ PUT /api/commentaires/{}/activer - Activation du commentaire", commentaireId);
        try {
            CommentaireResponseDto commentaire = commentaireService.activerCommentaire(commentaireId);
            return ResponseEntity.ok(commentaire);
        } catch (Exception e) {
            log.error("❌ Erreur lors de l'activation du commentaire: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}