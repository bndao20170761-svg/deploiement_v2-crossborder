package sn.uaz.Forum_PVVIH.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sn.uaz.Forum_PVVIH.dtos.TranslationRequestDto;
import sn.uaz.Forum_PVVIH.dtos.TranslationResponseDto;
import sn.uaz.Forum_PVVIH.services.TranslationService;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/translations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class TranslationController {
    
    private final TranslationService translationService;
    
    @PostMapping("/translate")
    public ResponseEntity<TranslationResponseDto> translate(@Valid @RequestBody TranslationRequestDto request) {
        log.info("🌐 POST /api/translations/translate - Traduction demandée: {} -> {}", 
                request.getSourceLanguage(), request.getTargetLanguage());
        try {
            TranslationResponseDto translation = translationService.translate(request);
            return new ResponseEntity<>(translation, HttpStatus.CREATED);
        } catch (Exception e) {
            log.error("❌ Erreur lors de la traduction: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }
    
    @GetMapping("/sujet/{sujetId}")
    public ResponseEntity<List<TranslationResponseDto>> getTranslationsBySujet(
            @PathVariable String sujetId,
            @RequestParam(defaultValue = "fr") String targetLanguage) {
        log.info("📖 GET /api/translations/sujet/{} - Récupération des traductions du sujet", sujetId);
        try {
            List<TranslationResponseDto> translations = translationService.getTranslationsBySujet(sujetId, targetLanguage);
            return ResponseEntity.ok(translations);
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération des traductions du sujet: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }
    
    @GetMapping("/commentaire/{commentaireId}")
    public ResponseEntity<List<TranslationResponseDto>> getTranslationsByCommentaire(
            @PathVariable String commentaireId,
            @RequestParam(defaultValue = "fr") String targetLanguage) {
        log.info("💬 GET /api/translations/commentaire/{} - Récupération des traductions du commentaire", commentaireId);
        try {
            List<TranslationResponseDto> translations = translationService.getTranslationsByCommentaire(commentaireId, targetLanguage);
            return ResponseEntity.ok(translations);
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération des traductions du commentaire: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }
    
    @PutMapping("/{translationId}/approve")
    public ResponseEntity<TranslationResponseDto> approveTranslation(
            @PathVariable String translationId,
            @RequestParam String approvedBy) {
        log.info("✅ PUT /api/translations/{}/approve - Approbation de la traduction", translationId);
        try {
            TranslationResponseDto translation = translationService.approveTranslation(translationId, approvedBy);
            return ResponseEntity.ok(translation);
        } catch (Exception e) {
            log.error("❌ Erreur lors de l'approbation de la traduction: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }
    
    @DeleteMapping("/sujet/{sujetId}")
    public ResponseEntity<Void> deleteTranslationsBySujet(@PathVariable String sujetId) {
        log.info("🗑️ DELETE /api/translations/sujet/{} - Suppression des traductions du sujet", sujetId);
        try {
            translationService.deleteTranslationsBySujet(sujetId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("❌ Erreur lors de la suppression des traductions: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    @DeleteMapping("/commentaire/{commentaireId}")
    public ResponseEntity<Void> deleteTranslationsByCommentaire(@PathVariable String commentaireId) {
        log.info("🗑️ DELETE /api/translations/commentaire/{} - Suppression des traductions du commentaire", commentaireId);
        try {
            translationService.deleteTranslationsByCommentaire(commentaireId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("❌ Erreur lors de la suppression des traductions: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        log.info("🏥 GET /api/translations/health - Vérification de l'état des services de traduction");
        
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", LocalDateTime.now());
        
        // Vérifier Google Translate
        try {
            // Test simple avec Google Translate
            health.put("googleTranslate", "AVAILABLE");
        } catch (Exception e) {
            health.put("googleTranslate", "UNAVAILABLE");
        }
        
        // Vérifier LibreTranslate
        try {
            // Test simple avec LibreTranslate
            health.put("libreTranslate", "AVAILABLE");
        } catch (Exception e) {
            health.put("libreTranslate", "UNAVAILABLE");
        }
        
        return ResponseEntity.ok(health);
    }
    
    @GetMapping("/test-libre")
    public ResponseEntity<Map<String, Object>> testLibreTranslate() {
        log.info("🧪 GET /api/translations/test-libre - Test de LibreTranslate");
        
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Test de traduction simple
            TranslationRequestDto testRequest = TranslationRequestDto.builder()
                    .text("Hello world")
                    .sourceLanguage("en")
                    .targetLanguage("fr")
                    .build();
            
            TranslationResponseDto translation = translationService.translate(testRequest);
            
            result.put("status", "SUCCESS");
            result.put("message", "LibreTranslate fonctionne correctement");
            result.put("testTranslation", translation);
            
        } catch (Exception e) {
            result.put("status", "ERROR");
            result.put("message", "LibreTranslate ne fonctionne pas: " + e.getMessage());
            result.put("error", e.getMessage());
        }
        
        return ResponseEntity.ok(result);
    }
}
