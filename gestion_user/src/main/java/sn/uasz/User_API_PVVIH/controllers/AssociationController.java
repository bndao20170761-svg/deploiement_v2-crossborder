package sn.uasz.User_API_PVVIH.controllers;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import sn.uasz.User_API_PVVIH.dtos.AssociationDto;
import sn.uasz.User_API_PVVIH.services.AssociationService;

import java.util.List;

@RestController
@RequestMapping("/api/associations")
@CrossOrigin(origins = {"http://localhost:3001", "http://localhost:3002", "http://localhost:3003", "http://gateway-pvvih:8080"})
public class AssociationController {

    private final AssociationService associationService;

    public AssociationController(AssociationService associationService) {
        this.associationService = associationService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<AssociationDto>> getAllAssociations() {
        return ResponseEntity.ok(associationService.getAllAssociations());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<AssociationDto> createAssociation(@Valid @RequestBody AssociationDto associationDto) {
        return ResponseEntity.ok(associationService.creerAssociation(associationDto));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{codeAssociation}")
    public ResponseEntity<AssociationDto> updateAssociation(
            @PathVariable String codeAssociation, 
            @Valid @RequestBody AssociationDto associationDto) {
        return ResponseEntity.ok(associationService.modifierAssociation(codeAssociation, associationDto));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{codeAssociation}")
    public ResponseEntity<Void> deleteAssociation(@PathVariable String codeAssociation) {
        associationService.supprimerAssociation(codeAssociation);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{codeAssociation}")
    public ResponseEntity<AssociationDto> getAssociationByCode(@PathVariable String codeAssociation) {
        return ResponseEntity.ok(associationService.getAssociationByCode(codeAssociation));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/count")
    public ResponseEntity<Long> countAssociations() {
        return ResponseEntity.ok(associationService.countAssociations());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/ville/{ville}")
    public ResponseEntity<List<AssociationDto>> getAssociationsByCity(@PathVariable String ville) {
        return ResponseEntity.ok(associationService.getAssociationsByCity(ville));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/pays/{pays}")
    public ResponseEntity<List<AssociationDto>> getAssociationsByCountry(@PathVariable String pays) {
        return ResponseEntity.ok(associationService.getAssociationsByCountry(pays));
    }
}