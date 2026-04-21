package sn.uasz.referencement_PVVIH.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;
import sn.uasz.referencement_PVVIH.config.FeignClientConfig;
import sn.uasz.referencement_PVVIH.dtos.DossierViewDto;
import sn.uasz.referencement_PVVIH.dtos.ReferenceDossierDto;

import java.util.List;

@FeignClient(
    name = "gestion-patient",
    url = "${feign.patient-service.url:http://gestion-patient:8080}",
    configuration = FeignClientConfig.class
)
public interface DossierClient {
    
    @GetMapping("/api/dossiers/by-code/{codeDossier}")
    DossierViewDto getDossierByCode(@PathVariable("codeDossier") String codeDossier);
    
    @GetMapping("/api/dossiers/by-patient/{codePatient}")
    List<DossierViewDto> getDossiersByPatient(@PathVariable("codePatient") String codePatient);
    
    @GetMapping("/api/dossiers/{codeDossier}/with-patient")
    DossierViewDto getDossierWithPatient(@PathVariable("codeDossier") String codeDossier);
}
