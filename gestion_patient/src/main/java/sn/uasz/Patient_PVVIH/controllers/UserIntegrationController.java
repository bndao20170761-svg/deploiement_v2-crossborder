package sn.uasz.Patient_PVVIH.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import sn.uasz.Patient_PVVIH.dtos.*;
import sn.uasz.Patient_PVVIH.services.UserIntegrationService;

import java.util.List;

@RestController
@RequestMapping("/api/user-integration")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class UserIntegrationController {

    private final UserIntegrationService userIntegrationService;

    // ========== PATIENTS ENDPOINTS ==========
    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR') or hasRole('ASSISTANT')")
    @GetMapping("/patients")
    public ResponseEntity<List<UserPatientDto>> getAllPatients() {
        try {
            List<UserPatientDto> patients = userIntegrationService.getAllPatients();
            return ResponseEntity.ok(patients);
        } catch (Exception e) {
            log.error("❌ Erreur dans getAllPatients: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_DOCTOR') or hasAuthority('ROLE_ASSISTANT')")
    @GetMapping("/patients/{codePatient}")
    public ResponseEntity<UserPatientDto> getPatientByCode(@PathVariable String codePatient) {
        try {
            UserPatientDto patient = userIntegrationService.getPatientByCode(codePatient);
            return ResponseEntity.ok(patient);
        } catch (Exception e) {
            log.error("❌ Erreur dans getPatientByCode: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_DOCTOR')")
    @PostMapping("/patients")
    public ResponseEntity<UserPatientDto> createPatient(@RequestBody UserPatientDto patientDto) {
        try {
            UserPatientDto createdPatient = userIntegrationService.createPatient(patientDto);
            return ResponseEntity.ok(createdPatient);
        } catch (Exception e) {
            log.error("❌ Erreur dans createPatient: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_DOCTOR')")
    @PutMapping("/patients/{codePatient}")
    public ResponseEntity<UserPatientDto> updatePatient(@PathVariable String codePatient, @RequestBody UserPatientDto patientDto) {
        try {
            UserPatientDto updatedPatient = userIntegrationService.updatePatient(codePatient, patientDto);
            return ResponseEntity.ok(updatedPatient);
        } catch (Exception e) {
            log.error("❌ Erreur dans updatePatient: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
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

    // ========== DOCTORS ENDPOINTS ==========
    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR') or hasRole('ASSISTANT')")
    @GetMapping("/doctors")
    public ResponseEntity<List<DoctorDto>> getAllDoctors() {
        try {
            List<DoctorDto> doctors = userIntegrationService.getAllDoctors();
            return ResponseEntity.ok(doctors);
        } catch (Exception e) {
            log.error("❌ Erreur dans getAllDoctors: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR') or hasRole('ASSISTANT')")
    @GetMapping("/doctors/{codeDoctor}")
    public ResponseEntity<DoctorDto> getDoctorByCode(@PathVariable String codeDoctor) {
        try {
            DoctorDto doctor = userIntegrationService.getDoctorByCode(codeDoctor);
            return ResponseEntity.ok(doctor);
        } catch (Exception e) {
            log.error("❌ Erreur dans getDoctorByCode: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    // ========== HOSPITALS ENDPOINTS ==========
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/hospitals")
    public ResponseEntity<List<HopitalDto>> getAllHospitals() {
        try {
            List<HopitalDto> hospitals = userIntegrationService.getAllHospitals();
            return ResponseEntity.ok(hospitals);
        } catch (Exception e) {
            log.error("❌ Erreur dans getAllHospitals: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/hospitals/{id}")
    public ResponseEntity<HopitalDto> getHospitalById(@PathVariable Long id) {
        try {
            HopitalDto hospital = userIntegrationService.getHospitalById(id);
            return ResponseEntity.ok(hospital);
        } catch (Exception e) {
            log.error("❌ Erreur dans getHospitalById: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/hospitals/active")
    public ResponseEntity<List<HopitalDto>> getActiveHospitals() {
        try {
            List<HopitalDto> hospitals = userIntegrationService.getActiveHospitals();
            return ResponseEntity.ok(hospitals);
        } catch (Exception e) {
            log.error("❌ Erreur dans getActiveHospitals: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // ========== ASSISTANTS ENDPOINTS ==========
    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR')")
    @GetMapping("/assistants")
    public ResponseEntity<List<AssistantDto>> getAllAssistants() {
        try {
            List<AssistantDto> assistants = userIntegrationService.getAllAssistants();
            return ResponseEntity.ok(assistants);
        } catch (Exception e) {
            log.error("❌ Erreur dans getAllAssistants: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR')")
    @GetMapping("/assistants/{codeAssistant}")
    public ResponseEntity<AssistantDto> getAssistantByCode(@PathVariable String codeAssistant) {
        try {
            AssistantDto assistant = userIntegrationService.getAssistantByCode(codeAssistant);
            return ResponseEntity.ok(assistant);
        } catch (Exception e) {
            log.error("❌ Erreur dans getAssistantByCode: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
}