package sn.uasz.Patient_PVVIH.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;
import sn.uasz.Patient_PVVIH.config.FeignClientConfig;
import sn.uasz.Patient_PVVIH.dtos.PatientDto;

import java.util.List;

@FeignClient(
        name = "gestion-user",
    url = "${feign.user-service.url:http://gestion-user:8080}",
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
