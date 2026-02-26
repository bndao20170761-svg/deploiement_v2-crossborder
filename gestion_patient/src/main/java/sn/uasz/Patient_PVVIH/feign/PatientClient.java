package sn.uasz.Patient_PVVIH.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;
import sn.uasz.Patient_PVVIH.config.FeignClientConfig;
import sn.uasz.Patient_PVVIH.dtos.PatientDto;

import java.util.List;

@FeignClient(
        name = "referencement-PVVIH",
        url = "${feign.reference-service.url:http://gestion-reference:8080}",  // ⚡ URL du MS referencement_PVVIH
        configuration = FeignClientConfig.class
)
public interface PatientClient {

    @GetMapping("/api/patients")
    List<PatientDto> getAll();

    @PostMapping
    PatientDto create(@RequestBody PatientDto dto);

    @PutMapping("/{codePatient}")
    PatientDto update(@PathVariable("codePatient") String codePatient, @RequestBody PatientDto dto);

    @DeleteMapping("/{codePatient}")
    void delete(@PathVariable("codePatient") String codePatient);
}
