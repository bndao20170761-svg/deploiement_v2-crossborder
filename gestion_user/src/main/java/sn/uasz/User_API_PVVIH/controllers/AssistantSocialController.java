package sn.uasz.User_API_PVVIH.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import sn.uasz.User_API_PVVIH.dtos.AssistantSocialDto;
import sn.uasz.User_API_PVVIH.services.AssistantSocialService;

import java.util.List;

@RestController
@CrossOrigin(origins = {"http://localhost:3001", "http://localhost:3002", "http://localhost:3003", "http://gateway-pvvih:8080"})
@RequestMapping("/api/assistants")
public class AssistantSocialController {

    private final AssistantSocialService assistantSocialService;

    public AssistantSocialController(AssistantSocialService assistantSocialService) {
        this.assistantSocialService = assistantSocialService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<AssistantSocialDto>> getAllAssistants() {
        try {
            List<AssistantSocialDto> assistants = assistantSocialService.getAllAssistants();
            return ResponseEntity.ok(assistants);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{codeAssistant}")
    public ResponseEntity<AssistantSocialDto> getAssistantByCode(@PathVariable String codeAssistant) {
        try {
            AssistantSocialDto assistant = assistantSocialService.getAssistantByCode(codeAssistant);
            return ResponseEntity.ok(assistant);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<?> createAssistant(@RequestBody AssistantSocialDto assistantDto) {
        try {
            AssistantSocialDto createdAssistant = assistantSocialService.creerAssistant(assistantDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdAssistant);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la création de l'assistant social");
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{codeAssistant}")
    public ResponseEntity<?> updateAssistant(
            @PathVariable String codeAssistant,
            @RequestBody AssistantSocialDto assistantDto) {
        try {
            AssistantSocialDto updatedAssistant = assistantSocialService.modifierAssistant(codeAssistant, assistantDto);
            return ResponseEntity.ok(updatedAssistant);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("non trouvé")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
            }
            return ResponseEntity.badRequest().body(e.getMessage());
        }  catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la modification de l'assistant social");
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{codeAssistant}")
    public ResponseEntity<?> deleteAssistant(@PathVariable String codeAssistant) {
        try {
            assistantSocialService.supprimerAssistant(codeAssistant);
            return ResponseEntity.ok().body("Assistant social supprimé avec succès");
        } catch (RuntimeException e) {
            if (e.getMessage().contains("non trouvé")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
            }
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la suppression de l'assistant social");
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/exists/{codeAssistant}")
    public ResponseEntity<Boolean> checkAssistantCodeExists(@PathVariable String codeAssistant) {
        try {
            boolean exists = assistantSocialService.existsByCodeAssistant(codeAssistant);
            return ResponseEntity.ok(exists);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/count")
    public ResponseEntity<Long> countAssistants() {
        try {
            long count = assistantSocialService.countAssistants();
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Endpoint pour récupérer un assistant par username/email
     * Accessible aux assistants (pour récupérer leurs propres infos) et aux admins
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'ASSISTANT')")
    @GetMapping("/by-username/{username}")
    public ResponseEntity<AssistantSocialDto> getAssistantByUsername(@PathVariable String username) {
        try {
            AssistantSocialDto assistant = assistantSocialService.getAssistantByUsername(username);
            return ResponseEntity.ok(assistant);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("non trouvé")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}