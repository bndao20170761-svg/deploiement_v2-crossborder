package sn.uasz.User_API_PVVIH.controllers;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import sn.uasz.User_API_PVVIH.dtos.PatientDto;
import sn.uasz.User_API_PVVIH.services.PatientService;

import java.util.List;

@RestController
//@CrossOrigin(origins = "http://localhost:3000")
@CrossOrigin(origins="*",allowedHeaders = "*")
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientService service;

    public PatientController(PatientService service) {
        this.service = service;
    }
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN') or hasRole('ASSISTANT')")
    @GetMapping
    public List<PatientDto> getAll() {
        return service.getAll();
    }

    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN') or hasRole('ASSISTANT')")
    @GetMapping("/{codePatient}")
    public PatientDto getPatientByCode(@PathVariable String codePatient) {
        return service.getPatientByCode(codePatient);
    }

    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN') or hasRole('ASSISTANT')")
    @PostMapping
    public PatientDto create(@RequestBody PatientDto dto) {
        return service.create(dto);
    }
    @PreAuthorize("hasRole('DOCTOR')  or hasRole('ADMIN') or hasRole('ASSISTANT')")
    @PutMapping("/{codePatient}")
    public PatientDto update(@PathVariable String codePatient, @RequestBody PatientDto dto) {
        return service.update(codePatient, dto);
    }
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ASSISTANT')")
    @GetMapping("/mes-patients")
    public List<PatientDto> getAll_() {
        return service.getAll();
    }
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN') ")
    @DeleteMapping("/{codePatient}")
    public void delete(@PathVariable String codePatient) {
        service.delete(codePatient);
    }
}
