package sn.uasz.User_API_PVVIH.controllers;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import sn.uasz.User_API_PVVIH.dtos.HopitalDto;
import sn.uasz.User_API_PVVIH.dtos.PrestataireDto;
import sn.uasz.User_API_PVVIH.services.HopitalService;

import java.util.List;

@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003", "http://localhost:8080", "http://localhost:8081", "http://gateway-pvvih:8080"})
@RequestMapping("/api/hospitaux")
public class HopitalController {

    private final HopitalService hopitalService;

    public HopitalController(HopitalService hopitalService) {
        this.hopitalService = hopitalService;
    }
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/tous")
    public ResponseEntity<List<HopitalDto>> getAllHospitals() {
        return ResponseEntity.ok(hopitalService.getAllHospitals());
    }
    @PreAuthorize("isAuthenticated()")
    @PostMapping
    public ResponseEntity<HopitalDto> createHospital(@Valid @RequestBody HopitalDto hopitalDto) {
        return ResponseEntity.ok(hopitalService.creerHopital(hopitalDto));
    }
    // ✅ CORRECTION: Permettre aux docteurs de modifier leurs propres hôpitaux ou aux admins de modifier tous
    @PreAuthorize("isAuthenticated()")
    @PutMapping("/{id}")
    public ResponseEntity<HopitalDto> updateHospital(@PathVariable Long id, @Valid @RequestBody HopitalDto hopitalDto) {
        try {
            return ResponseEntity.ok(hopitalService.modifierHopital(id, hopitalDto));
        } catch (RuntimeException e) {
            // Si l'utilisateur n'a pas les permissions, retourner 403
            if (e.getMessage().contains("permission") || e.getMessage().contains("autorisé")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            throw e;
        }
    }
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHospital(@PathVariable Long id) {
        hopitalService.supprimerHopital(id);
        return ResponseEntity.noContent().build();
    }
    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR') or hasRole('ASSISTANT')")
    @GetMapping("/{id}")
    public ResponseEntity<HopitalDto> getHospitalById(@PathVariable Long id) {
        return ResponseEntity.ok(hopitalService.getHopitalById(id));
    }
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/count")
    public ResponseEntity<Long> countHospitals() {
        return ResponseEntity.ok(hopitalService.countHospitals());
    }
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/pays/{pays}")
    public ResponseEntity<List<HopitalDto>> getHospitalsByCountry(@PathVariable String pays) {
        return ResponseEntity.ok(hopitalService.getHospitalsByCountry(pays));
    }
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/ville/{ville}")
    public ResponseEntity<List<HopitalDto>> getHospitalsByCity(@PathVariable String ville) {
        return ResponseEntity.ok(hopitalService.getHospitalsByCity(ville));
    }
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/status")
    public ResponseEntity<HopitalDto> toggleHospitalStatus(@PathVariable Long id, @RequestParam boolean active) {
        return ResponseEntity.ok(hopitalService.toggleHospitalStatus(id, active));
    }

    @PreAuthorize("isAuthenticated()") // Tous les utilisateurs connectés
    @GetMapping("/carte")
    public ResponseEntity<List<HopitalDto>> getHospitauxPourCarte() {
        return ResponseEntity.ok(hopitalService.getHospitauxPourCarte());
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/actifs")
    public ResponseEntity<List<HopitalDto>> getHospitauxActifs() {
        return ResponseEntity.ok(hopitalService.getHospitauxActifs());
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}/details")
    public ResponseEntity<HopitalDto> getHopitalAvecDetails(@PathVariable Long id) {
        return ResponseEntity.ok(hopitalService.getHopitalAvecDetails(id));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/recherche")
    public ResponseEntity<List<HopitalDto>> rechercherHospitaux(
            @RequestParam(required = false) String ville,
            @RequestParam(required = false) String pays) {
        return ResponseEntity.ok(hopitalService.rechercherHospitaux(ville, pays));
    }

    // Endpoint pour récupérer les hôpitaux désactivés
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/inactifs")
    public ResponseEntity<List<HopitalDto>> getInactiveHospitals() {
        List<HopitalDto> inactifs = hopitalService.getInactiveHospitals();
        return ResponseEntity.ok(inactifs);
    }

    // Endpoint pour activer/désactiver un hôpital

    // @PreAuthorize("isAuthenticated()")
    @GetMapping("/mes-hopitaux")
    public ResponseEntity<List<HopitalDto>> getMyHospitals() {
        try {
            List<HopitalDto> hopitaux = hopitalService.getHospitalsByCurrentDoctor();
            return ResponseEntity.ok(hopitaux);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }
    }

    // Endpoint pour récupérer un hôpital avec ses prestataires
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}/prestataires")
    public ResponseEntity<HopitalDto> getHopitalAvecPrestataires(@PathVariable Long id) {
        return ResponseEntity.ok(hopitalService.getHopitalAvecPrestataires(id));
    }

    // Endpoint pour récupérer seulement les prestataires d'un hôpital
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}/prestataires-only")
    public ResponseEntity<List<PrestataireDto>> getPrestatairesByHopitalId(@PathVariable Long id) {
        return ResponseEntity.ok(hopitalService.getPrestatairesByHopitalId(id));
    }
}