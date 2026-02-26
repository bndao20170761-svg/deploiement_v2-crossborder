package sn.uasz.User_API_PVVIH.controllers;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import sn.uasz.User_API_PVVIH.dtos.MembreDto;
import sn.uasz.User_API_PVVIH.services.MembreService;

import java.util.List;

@RestController
@RequestMapping("/api/membres")
@CrossOrigin(origins = {"http://localhost:3001", "http://localhost:3002", "http://localhost:3003", "http://gateway-pvvih:8080"})
public class MembreController {

    private final MembreService membreService;

    public MembreController(MembreService membreService) {
        this.membreService = membreService;
    }
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<MembreDto>> getAllMembres() {
        return ResponseEntity.ok(membreService.getAllMembres());
    }
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<MembreDto> createMembre(@Valid @RequestBody MembreDto membreDto) {
        return ResponseEntity.ok(membreService.creerMembre(membreDto));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<MembreDto> updateMembre(
            @PathVariable Long id, 
            @Valid @RequestBody MembreDto membreDto) {
        return ResponseEntity.ok(membreService.modifierMembre(id, membreDto));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMembre(@PathVariable Long id) {
        membreService.supprimerMembre(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<MembreDto> getMembreById(@PathVariable Long id) {
        return ResponseEntity.ok(membreService.getMembreById(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/count")
    public ResponseEntity<Long> countMembres() {
        return ResponseEntity.ok(membreService.countMembres());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/association/{associationCode}")
    public ResponseEntity<List<MembreDto>> getMembresByAssociation(@PathVariable String associationCode) {
        return ResponseEntity.ok(membreService.getMembresByAssociation(associationCode));
    }
}