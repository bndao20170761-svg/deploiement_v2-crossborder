package sn.uasz.Patient_PVVIH.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;
import sn.uasz.Patient_PVVIH.config.FeignClientConfig;
import sn.uasz.Patient_PVVIH.dtos.*;

import java.util.List;

@FeignClient(
        name = "user-api-pvvih",
        url = "${feign.user-service.url:http://gestion-user:8080}",  // URL du microservice gestion_user
        configuration = FeignClientConfig.class
)
public interface UserServiceClient {

    // ========== PATIENTS ==========
    @GetMapping("/api/patients")
    List<UserServicePatientDto> getAllPatients();

    @GetMapping("/api/patients/{codePatient}")
    UserServicePatientDto getPatientByCode(@PathVariable("codePatient") String codePatient);

    @PostMapping("/api/patients")
    UserServicePatientDto createPatient(@RequestBody UserServicePatientDto patientDto);

    @PutMapping("/api/patients/{codePatient}")
    UserServicePatientDto updatePatient(@PathVariable("codePatient") String codePatient, @RequestBody UserServicePatientDto patientDto);

    @DeleteMapping("/api/patients/{codePatient}")
    void deletePatient(@PathVariable("codePatient") String codePatient);

    // ========== DOCTORS ==========
    @GetMapping("/api/doctors")
    List<DoctorDto> getAllDoctors();

    @GetMapping("/api/doctors/{codeDoctor}")
    DoctorDto getDoctorByCode(@PathVariable("codeDoctor") String codeDoctor);

    @PostMapping("/api/doctors")
    DoctorDto createDoctor(@RequestBody DoctorDto doctorDto);

    @PutMapping("/api/doctors/{codeDoctor}")
    DoctorDto updateDoctor(@PathVariable("codeDoctor") String codeDoctor, @RequestBody DoctorDto doctorDto);

    @DeleteMapping("/api/doctors/{codeDoctor}")
    void deleteDoctor(@PathVariable("codeDoctor") String codeDoctor);

    // ========== HOSPITALS ==========
    @GetMapping("/api/hospitaux/tous")
    List<HopitalDto> getAllHospitals();

    @GetMapping("/api/hospitaux/{id}")
    HopitalDto getHospitalById(@PathVariable("id") Long id);

    @PostMapping("/api/hospitaux")
    HopitalDto createHospital(@RequestBody HopitalDto hospitalDto);

    @PutMapping("/api/hospitaux/{id}")
    HopitalDto updateHospital(@PathVariable("id") Long id, @RequestBody HopitalDto hospitalDto);

    @DeleteMapping("/api/hospitaux/{id}")
    void deleteHospital(@PathVariable("id") Long id);

    @GetMapping("/api/hospitaux/actifs")
    List<HopitalDto> getActiveHospitals();

    @GetMapping("/api/hospitaux/mes-hopitaux")
    List<HopitalDto> getMyHospitals();

    @GetMapping("/api/hospitaux/{id}/details")
    HopitalDto getHospitalWithDetails(@PathVariable("id") Long id);

    // ========== ASSISTANTS ==========
    @GetMapping("/api/membres")
    List<AssistantDto> getAllAssistants();

    @GetMapping("/api/membres/{codeAssistant}")
    AssistantDto getAssistantByCode(@PathVariable("codeAssistant") String codeAssistant);

    @PostMapping("/api/membres")
    AssistantDto createAssistant(@RequestBody AssistantDto assistantDto);

    @PutMapping("/api/membres/{codeAssistant}")
    AssistantDto updateAssistant(@PathVariable("codeAssistant") String codeAssistant, @RequestBody AssistantDto assistantDto);

    @DeleteMapping("/api/membres/{codeAssistant}")
    void deleteAssistant(@PathVariable("codeAssistant") String codeAssistant);
}