package sn.uasz.referencement_PVVIH.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import sn.uasz.referencement_PVVIH.dtos.DoctorDto;
import sn.uasz.referencement_PVVIH.dtos.HopitalDto;
import sn.uasz.referencement_PVVIH.dtos.PrestataireDto;
import sn.uasz.referencement_PVVIH.services.HopitalServiceProxy;

import java.util.List;

@RestController
@RequestMapping("/api/hopitaux-proxy")
@RequiredArgsConstructor
public class HopitalProxyController {

    private final HopitalServiceProxy hopitalProxy;



    @PreAuthorize("isAuthenticated()")
    @GetMapping("/actifs")
    public List<HopitalDto> getHospitauxActifs() {
        return hopitalProxy.getHospitauxActifs();
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/carte")
    public List<HopitalDto> getHospitauxPourCarte() {
        return hopitalProxy.getHospitauxPourCarte();
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}")
    public HopitalDto getHopitalById(@PathVariable Long id) {
        return hopitalProxy.getHopitalById(id);
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping
    public HopitalDto createHopital(@RequestBody HopitalDto dto) {
        return hopitalProxy.createHospital(dto);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR')")
    @PutMapping("/{id}")
    public HopitalDto updateHopital(@PathVariable Long id, @RequestBody HopitalDto dto) {
        return hopitalProxy.updateHospital(id, dto);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR')")
    @DeleteMapping("/{id}")
    public void deleteHopital(@PathVariable Long id) {
        hopitalProxy.deleteHopital(id);
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/recherche")
    public List<HopitalDto> rechercherHospitaux(
            @RequestParam(required = false) String ville,
            @RequestParam(required = false) String pays) {
        return hopitalProxy.rechercherHospitaux(ville, pays);
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/tous")
    public List<HopitalDto> getAllHospitals() {
        return hopitalProxy.getAllHospitals();
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}/details")
    public HopitalDto getHopitalAvecDetails(@PathVariable Long id) {
        return hopitalProxy.getHopitalAvecDetails(id);
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/mes-hopitaux")
    public List<HopitalDto> getMyHospitals() {
        return hopitalProxy.getMyHospitals();
    }

    // Endpoints pour les prestataires
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}/prestataires")
    public HopitalDto getHopitalAvecPrestataires(@PathVariable Long id) {
        return hopitalProxy.getHopitalAvecPrestataires(id);
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}/prestataires-only")
    public List<PrestataireDto> getPrestatairesByHopitalId(@PathVariable Long id) {
        return hopitalProxy.getPrestatairesByHopitalId(id);
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}/doctors")
    public List<DoctorDto> getDoctorsByHopital(@PathVariable Long id) {
        return hopitalProxy.getDoctorsByHopital(id);
    }
}