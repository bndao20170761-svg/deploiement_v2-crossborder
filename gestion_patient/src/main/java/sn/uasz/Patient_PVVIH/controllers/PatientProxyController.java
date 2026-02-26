package sn.uasz.Patient_PVVIH.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import sn.uasz.Patient_PVVIH.dtos.PatientDto;
import sn.uasz.Patient_PVVIH.services.PatientServiceProxy;

import java.util.List;

@RestController
@RequestMapping("/api/patients-proxy")
@RequiredArgsConstructor
public class PatientProxyController {

    private final PatientServiceProxy proxy;

    @GetMapping
    public List<PatientDto> getAll() {
        return proxy.getAll();
    }

    @PostMapping
    public PatientDto create(@RequestBody PatientDto dto) {
        return proxy.create(dto);
    }

    @PutMapping("/{codePatient}")
    public PatientDto update(@PathVariable String codePatient, @RequestBody PatientDto dto) {
        return proxy.update(codePatient, dto);
    }

    @DeleteMapping("/{codePatient}")
    public void delete(@PathVariable String codePatient) {
        proxy.delete(codePatient);
    }
}
