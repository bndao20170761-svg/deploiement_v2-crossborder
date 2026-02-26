package sn.uasz.referencement_PVVIH.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;
import sn.uasz.referencement_PVVIH.config.FeignClientConfig;
import sn.uasz.referencement_PVVIH.dtos.DoctorFeignDto;
import sn.uasz.referencement_PVVIH.dtos.PatientFeignDto;

import java.util.List;
import java.util.Map;

@FeignClient(
    name = "gestion-user",
    url = "${feign.user-service.url:http://gestion-user:8080}",
    configuration = FeignClientConfig.class
)
public interface UserServiceClient {

    // ========== DOCTORS ==========
    @GetMapping("/api/doctors")
    List<DoctorFeignDto> getAllDoctors();

    @GetMapping("/api/doctors/{codeDoctor}")
    DoctorFeignDto getDoctorByCode(@PathVariable("codeDoctor") String codeDoctor);

    @PostMapping("/api/doctors")
    DoctorFeignDto createDoctor(@RequestBody DoctorFeignDto doctorDto);

    @PutMapping("/api/doctors/{codeDoctor}")
    DoctorFeignDto updateDoctor(@PathVariable("codeDoctor") String codeDoctor, @RequestBody DoctorFeignDto doctorDto);

    @DeleteMapping("/api/doctors/{codeDoctor}")
    void deleteDoctor(@PathVariable("codeDoctor") String codeDoctor);

    // ========== PATIENTS ==========
    @GetMapping("/api/patients")
    List<Map<String, Object>> getAllPatients();

    @GetMapping("/api/patients/{codePatient}")
    Map<String, Object> getPatientByCode(@PathVariable("codePatient") String codePatient);

    @PostMapping("/api/patients")
    Map<String, Object> createPatient(@RequestBody Map<String, Object> patientDto);

    @PutMapping("/api/patients/{codePatient}")
    Map<String, Object> updatePatient(@PathVariable("codePatient") String codePatient, @RequestBody Map<String, Object> patientDto);

    @DeleteMapping("/api/patients/{codePatient}")
    void deletePatient(@PathVariable("codePatient") String codePatient);

    // ========== HOSPITALS ==========
    @GetMapping("/api/hospitaux/tous")
    List<sn.uasz.referencement_PVVIH.dtos.HopitalDto> getAllHospitals();

    @GetMapping("/api/hospitaux/{id}")
    sn.uasz.referencement_PVVIH.dtos.HopitalDto getHospitalById(@PathVariable("id") Long id);

    @PostMapping("/api/hospitaux")
    sn.uasz.referencement_PVVIH.dtos.HopitalDto createHospital(@RequestBody sn.uasz.referencement_PVVIH.dtos.HopitalDto hospitalDto);

    @PutMapping("/api/hospitaux/{id}")
    sn.uasz.referencement_PVVIH.dtos.HopitalDto updateHospital(@PathVariable("id") Long id, @RequestBody sn.uasz.referencement_PVVIH.dtos.HopitalDto hospitalDto);

    @DeleteMapping("/api/hospitaux/{id}")
    void deleteHospital(@PathVariable("id") Long id);

    // Nouvelles méthodes d'hôpitaux
    @GetMapping("/api/hospitaux/actifs")
    List<sn.uasz.referencement_PVVIH.dtos.HopitalDto> getHospitauxActifs();

    @GetMapping("/api/hospitaux/carte")
    List<sn.uasz.referencement_PVVIH.dtos.HopitalDto> getHospitauxPourCarte();

    @GetMapping("/api/hospitaux/inactifs")
    List<sn.uasz.referencement_PVVIH.dtos.HopitalDto> getInactiveHospitals();

    @GetMapping("/api/hospitaux/mes-hopitaux")
    List<sn.uasz.referencement_PVVIH.dtos.HopitalDto> getMyHospitals();

    @GetMapping("/api/hospitaux/{id}/details")
    sn.uasz.referencement_PVVIH.dtos.HopitalDto getHopitalAvecDetails(@PathVariable("id") Long id);

    @GetMapping("/api/hospitaux/{id}/prestataires")
    sn.uasz.referencement_PVVIH.dtos.HopitalDto getHopitalAvecPrestataires(@PathVariable("id") Long id);

    @GetMapping("/api/hospitaux/recherche")
    List<sn.uasz.referencement_PVVIH.dtos.HopitalDto> rechercherHospitaux(
            @RequestParam(value = "ville", required = false) String ville,
            @RequestParam(value = "pays", required = false) String pays);

    @GetMapping("/api/hospitaux/count")
    Long countHospitals();

    @GetMapping("/api/hospitaux/pays/{pays}")
    List<sn.uasz.referencement_PVVIH.dtos.HopitalDto> getHospitalsByCountry(@PathVariable("pays") String pays);

    @GetMapping("/api/hospitaux/ville/{ville}")
    List<sn.uasz.referencement_PVVIH.dtos.HopitalDto> getHospitalsByCity(@PathVariable("ville") String ville);

    @PatchMapping("/api/hospitaux/{id}/status")
    sn.uasz.referencement_PVVIH.dtos.HopitalDto toggleHospitalStatus(@PathVariable("id") Long id, @RequestParam("active") boolean active);

    // ========== ASSISTANTS ==========
    @GetMapping("/api/assistants")
    List<sn.uasz.referencement_PVVIH.dtos.AssistantSocialDto> getAllAssistants();

    @GetMapping("/api/assistants/by-username/{username}")
    sn.uasz.referencement_PVVIH.dtos.AssistantSocialDto getAssistantByUsername(@PathVariable("username") String username);
}
