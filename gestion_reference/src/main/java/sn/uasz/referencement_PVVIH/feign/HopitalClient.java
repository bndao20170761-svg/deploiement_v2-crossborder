package sn.uasz.referencement_PVVIH.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;
import sn.uasz.referencement_PVVIH.config.FeignClientConfig;
import sn.uasz.referencement_PVVIH.dtos.HopitalDto;

import java.util.List;

@FeignClient(
    name = "gestion-user",
    url = "${feign.user-service.url:http://gestion-user:8080}",
    configuration = FeignClientConfig.class
)
public interface HopitalClient {

    @GetMapping("/api/hospitaux/actifs")
    List<HopitalDto> getHospitauxActifs();

    @GetMapping("/api/hospitaux/carte")
    List<HopitalDto> getHospitauxPourCarte();

    @GetMapping("/api/hospitaux/{id}")
    HopitalDto getHopitalById(@PathVariable("id") Long id);

    @PostMapping("/api/hospitaux")
    HopitalDto createHopital(@RequestBody HopitalDto dto);

    @PutMapping("/api/hospitaux/{id}")
    HopitalDto updateHopital(@PathVariable("id") Long id, @RequestBody HopitalDto dto);
    // AJOUTER CETTE MÉTHODE
    @GetMapping("/api/hospitaux/tous")
    List<HopitalDto> getAllHospitals();


    @DeleteMapping("/api/hospitaux/{id}")
    void deleteHopital(@PathVariable("id") Long id);

    @GetMapping("/api/hospitaux/recherche")
    List<HopitalDto> rechercherHospitaux(
        @RequestParam(required = false) String ville,
        @RequestParam(required = false) String pays);

    @GetMapping("/api/hospitaux/{id}/details")
    HopitalDto getHopitalAvecDetails(@PathVariable("id") Long id);

    @GetMapping("/api/hospitaux/mes-hopitaux")
    List<HopitalDto> getMyHospitals();
}