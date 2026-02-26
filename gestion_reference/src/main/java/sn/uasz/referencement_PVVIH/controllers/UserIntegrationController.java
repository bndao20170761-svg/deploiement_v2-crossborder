package sn.uasz.referencement_PVVIH.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import sn.uasz.referencement_PVVIH.dtos.DoctorFeignDto;
import sn.uasz.referencement_PVVIH.dtos.PatientFeignDto;
import sn.uasz.referencement_PVVIH.services.UserIntegrationService;

import java.util.List;

@RestController
@RequestMapping("/api/integration")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class UserIntegrationController {

    private final UserIntegrationService userIntegrationService;

    // ========== DOCTORS ENDPOINTS ==========
    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR') or hasRole('ASSISTANT')")
    @GetMapping("/doctors")
    public ResponseEntity<List<DoctorFeignDto>> getAllDoctors() {
        try {
            List<DoctorFeignDto> doctors = userIntegrationService.getAllDoctors();
            return ResponseEntity.ok(doctors);
        } catch (Exception e) {
            log.error("❌ Erreur dans getAllDoctors: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR') or hasRole('ASSISTANT')")
    @GetMapping("/doctors/{codeDoctor}")
    public ResponseEntity<DoctorFeignDto> getDoctorByCode(@PathVariable String codeDoctor) {
        try {
            DoctorFeignDto doctor = userIntegrationService.getDoctorByCode(codeDoctor);
            return ResponseEntity.ok(doctor);
        } catch (Exception e) {
            log.error("❌ Erreur dans getDoctorByCode: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/doctors")
    public ResponseEntity<DoctorFeignDto> createDoctor(@RequestBody DoctorFeignDto doctorDto) {
        try {
            DoctorFeignDto createdDoctor = userIntegrationService.createDoctor(doctorDto);
            return ResponseEntity.ok(createdDoctor);
        } catch (Exception e) {
            log.error("❌ Erreur dans createDoctor: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/doctors/{codeDoctor}")
    public ResponseEntity<DoctorFeignDto> updateDoctor(@PathVariable String codeDoctor, @RequestBody DoctorFeignDto doctorDto) {
        try {
            DoctorFeignDto updatedDoctor = userIntegrationService.updateDoctor(codeDoctor, doctorDto);
            return ResponseEntity.ok(updatedDoctor);
        } catch (Exception e) {
            log.error("❌ Erreur dans updateDoctor: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/doctors/{codeDoctor}")
    public ResponseEntity<Void> deleteDoctor(@PathVariable String codeDoctor) {
        try {
            userIntegrationService.deleteDoctor(codeDoctor);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("❌ Erreur dans deleteDoctor: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // ========== PATIENTS ENDPOINTS ==========
    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR') or hasRole('ASSISTANT') or hasRole('USER')")
    @GetMapping("/patients")
    public ResponseEntity<List<PatientFeignDto>> getAllPatients() {
        try {
            List<PatientFeignDto> patients = userIntegrationService.getAllPatients();
            return ResponseEntity.ok(patients);
        } catch (Exception e) {
            log.error("❌ Erreur dans getAllPatients: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR') or hasRole('ASSISTANT') or hasRole('USER')")
    @GetMapping("/patients/{codePatient}")
    public ResponseEntity<PatientFeignDto> getPatientByCode(@PathVariable String codePatient) {
        try {
            PatientFeignDto patient = userIntegrationService.getPatientByCode(codePatient);
            return ResponseEntity.ok(patient);
        } catch (Exception e) {
            log.error("❌ Erreur dans getPatientByCode: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR')")
    @PostMapping("/patients")
    public ResponseEntity<PatientFeignDto> createPatient(@RequestBody PatientFeignDto patientDto) {
        try {
            PatientFeignDto createdPatient = userIntegrationService.createPatient(patientDto);
            return ResponseEntity.ok(createdPatient);
        } catch (Exception e) {
            log.error("❌ Erreur dans createPatient: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR')")
    @PutMapping("/patients/{codePatient}")
    public ResponseEntity<PatientFeignDto> updatePatient(@PathVariable String codePatient, @RequestBody PatientFeignDto patientDto) {
        try {
            PatientFeignDto updatedPatient = userIntegrationService.updatePatient(codePatient, patientDto);
            return ResponseEntity.ok(updatedPatient);
        } catch (Exception e) {
            log.error("❌ Erreur dans updatePatient: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR')")
    @DeleteMapping("/patients/{codePatient}")
    public ResponseEntity<Void> deletePatient(@PathVariable String codePatient) {
        try {
            userIntegrationService.deletePatient(codePatient);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("❌ Erreur dans deletePatient: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // ========== HOSPITALS ENDPOINTS ==========
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/hospitals")
    public ResponseEntity<List<sn.uasz.referencement_PVVIH.dtos.HopitalDto>> getAllHospitals() {
        try {
            List<sn.uasz.referencement_PVVIH.dtos.HopitalDto> hospitals = userIntegrationService.getAllHospitals();
            return ResponseEntity.ok(hospitals);
        } catch (Exception e) {
            log.error("❌ Erreur dans getAllHospitals: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/hospitals/{id}")
    public ResponseEntity<sn.uasz.referencement_PVVIH.dtos.HopitalDto> getHospitalById(@PathVariable Long id) {
        try {
            sn.uasz.referencement_PVVIH.dtos.HopitalDto hospital = userIntegrationService.getHospitalById(id);
            return ResponseEntity.ok(hospital);
        } catch (Exception e) {
            log.error("❌ Erreur dans getHospitalById: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
}
