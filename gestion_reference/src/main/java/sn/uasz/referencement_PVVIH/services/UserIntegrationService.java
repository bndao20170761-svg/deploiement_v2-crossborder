package sn.uasz.referencement_PVVIH.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import sn.uasz.referencement_PVVIH.dtos.DoctorDto;
import sn.uasz.referencement_PVVIH.dtos.DoctorFeignDto;
import sn.uasz.referencement_PVVIH.dtos.PatientDto;
import sn.uasz.referencement_PVVIH.dtos.PatientFeignDto;
import sn.uasz.referencement_PVVIH.feign.UserServiceClient;
import sn.uasz.referencement_PVVIH.mappers.DoctorMapper;
import sn.uasz.referencement_PVVIH.mappers.PatientMapper;

import java.util.List;
import java.util.Map;

import static org.apache.kafka.common.requests.DeleteAclsResponse.log;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserIntegrationService {

    private final UserServiceClient userServiceClient;
    private final DoctorMapper doctorMapper;
    private final PatientMapper patientMapper;
    private final PatientMappingService patientMappingService;

    // ========== DOCTORS ==========
    public List<DoctorFeignDto> getAllDoctors() {
        try {
            log.info("🔍 Récupération de tous les doctors via Feign Client");
            return userServiceClient.getAllDoctors();
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération des doctors: {}", e.getMessage());
            throw new RuntimeException("Erreur lors de la récupération des doctors", e);
        }
    }

    public DoctorFeignDto getDoctorByCode(String codeDoctor) {
        try {
            log.info("🔍 Récupération du doctor {} via Feign Client", codeDoctor);
            
            // Utiliser getAllDoctors et filtrer par code au lieu de l'endpoint individuel
            // car l'endpoint individuel nécessite le rôle ADMIN
            List<DoctorFeignDto> allDoctors = userServiceClient.getAllDoctors();
            
            return allDoctors.stream()
                    .filter(doctor -> codeDoctor.equals(doctor.getCodeDoctor()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Doctor non trouvé: " + codeDoctor));
                    
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération du doctor {}: {}", codeDoctor, e.getMessage());
            throw new RuntimeException("Erreur lors de la récupération du doctor", e);
        }
    }

    public DoctorFeignDto createDoctor(DoctorFeignDto doctorDto) {
        try {
            log.info("➕ Création d'un nouveau doctor via Feign Client");
            return userServiceClient.createDoctor(doctorDto);
        } catch (Exception e) {
            log.error("❌ Erreur lors de la création du doctor: {}", e.getMessage());
            throw new RuntimeException("Erreur lors de la création du doctor", e);
        }
    }

    public DoctorFeignDto updateDoctor(String codeDoctor, DoctorFeignDto doctorDto) {
        try {
            log.info("✏️ Mise à jour du doctor {} via Feign Client", codeDoctor);
            return userServiceClient.updateDoctor(codeDoctor, doctorDto);
        } catch (Exception e) {
            log.error("❌ Erreur lors de la mise à jour du doctor {}: {}", codeDoctor, e.getMessage());
            throw new RuntimeException("Erreur lors de la mise à jour du doctor", e);
        }
    }

    public void deleteDoctor(String codeDoctor) {
        try {
            log.info("🗑️ Suppression du doctor {} via Feign Client", codeDoctor);
            userServiceClient.deleteDoctor(codeDoctor);
        } catch (Exception e) {
            log.error("❌ Erreur lors de la suppression du doctor {}: {}", codeDoctor, e.getMessage());
            throw new RuntimeException("Erreur lors de la suppression du doctor", e);
        }
    }

    // ========== PATIENTS ==========
    public List<PatientFeignDto> getAllPatients() {
        try {
            log.info("🔍 Récupération de tous les patients via Feign Client");
            List<Map<String, Object>> rawPatients = userServiceClient.getAllPatients();
            return patientMappingService.mapToPatientFeignDtoList(rawPatients);
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération des patients: {}", e.getMessage());
            throw new RuntimeException("Erreur lors de la récupération des patients", e);
        }
    }

    public PatientFeignDto getPatientByCode(String codePatient) {
        try {
            log.info("🔍 Récupération du patient {} via Feign Client", codePatient);
            Map<String, Object> rawPatient = userServiceClient.getPatientByCode(codePatient);
            return patientMappingService.mapToPatientFeignDto(rawPatient);
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération du patient {}: {}", codePatient, e.getMessage());
            throw new RuntimeException("Erreur lors de la récupération du patient", e);
        }
    }

    public PatientFeignDto createPatient(PatientFeignDto patientDto) {
        try {
            log.info("➕ Création d'un nouveau patient via Feign Client");
            // Convertir PatientFeignDto vers Map pour l'envoi
            Map<String, Object> patientMap = patientMappingService.mapFromPatientFeignDto(patientDto);
            Map<String, Object> rawPatient = userServiceClient.createPatient(patientMap);
            return patientMappingService.mapToPatientFeignDto(rawPatient);
        } catch (Exception e) {
            log.error("❌ Erreur lors de la création du patient: {}", e.getMessage());
            throw new RuntimeException("Erreur lors de la création du patient", e);
        }
    }

    public PatientFeignDto updatePatient(String codePatient, PatientFeignDto patientDto) {
        try {
            log.info("✏️ Mise à jour du patient {} via Feign Client", codePatient);
            
            // 🔥 CORRECTION: Récupérer d'abord les données existantes
            Map<String, Object> existingPatientData = userServiceClient.getPatientByCode(codePatient);
            PatientFeignDto existingPatient = patientMappingService.mapToPatientFeignDto(existingPatientData);
            
            // Fusionner les données: garder les anciennes si les nouvelles sont null
            if (patientDto.getNom() == null || patientDto.getNom().isEmpty()) {
                patientDto.setNom(existingPatient.getNom());
            }
            if (patientDto.getPrenom() == null || patientDto.getPrenom().isEmpty()) {
                patientDto.setPrenom(existingPatient.getPrenom());
            }
            if (patientDto.getEmail() == null || patientDto.getEmail().isEmpty()) {
                patientDto.setEmail(existingPatient.getEmail());
            }
            if (patientDto.getTelephone() == null || patientDto.getTelephone().isEmpty()) {
                patientDto.setTelephone(existingPatient.getTelephone());
            }
            if (patientDto.getGenre() == null || patientDto.getGenre().isEmpty()) {
                patientDto.setGenre(existingPatient.getGenre());
            }
            if (patientDto.getDateNaissance() == null) {
                patientDto.setDateNaissance(existingPatient.getDateNaissance());
            }
            if (patientDto.getAdresse() == null || patientDto.getAdresse().isEmpty()) {
                patientDto.setAdresse(existingPatient.getAdresse());
            }
            if (patientDto.getPays() == null || patientDto.getPays().isEmpty()) {
                patientDto.setPays(existingPatient.getPays());
            }
            if (patientDto.getDoctorCreateCode() == null || patientDto.getDoctorCreateCode().isEmpty()) {
                patientDto.setDoctorCreateCode(existingPatient.getDoctorCreateCode());
            }
            
            log.info("📝 Données fusionnées: nom={}, prenom={}, email={}", 
                    patientDto.getNom(), patientDto.getPrenom(), patientDto.getEmail());
            
            // Convertir PatientFeignDto vers Map pour l'envoi
            Map<String, Object> patientMap = patientMappingService.mapFromPatientFeignDto(patientDto);
            
            log.info("📤 Envoi des données: {}", patientMap);
            
            Map<String, Object> rawPatient = userServiceClient.updatePatient(codePatient, patientMap);
            return patientMappingService.mapToPatientFeignDto(rawPatient);
        } catch (Exception e) {
            log.error("❌ Erreur lors de la mise à jour du patient {}: {}", codePatient, e.getMessage());
            throw new RuntimeException("Erreur lors de la mise à jour du patient", e);
        }
    }

    public void deletePatient(String codePatient) {
        try {
            log.info("🗑️ Suppression du patient {} via Feign Client", codePatient);
            userServiceClient.deletePatient(codePatient);
        } catch (Exception e) {
            log.error("❌ Erreur lors de la suppression du patient {}: {}", codePatient, e.getMessage());
            throw new RuntimeException("Erreur lors de la suppression du patient", e);
        }
    }

    // ========== HOSPITALS ==========
    public List<sn.uasz.referencement_PVVIH.dtos.HopitalDto> getAllHospitals() {
        try {
            log.info("🔍 Récupération de tous les hôpitaux via Feign Client");
            return userServiceClient.getAllHospitals();
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération des hôpitaux: {}", e.getMessage());
            throw new RuntimeException("Erreur lors de la récupération des hôpitaux", e);
        }
    }

    public sn.uasz.referencement_PVVIH.dtos.HopitalDto getHospitalById(Long id) {
        try {
            log.info("🔍 Récupération de l'hôpital {} via Feign Client", id);
            return userServiceClient.getHospitalById(id);
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération de l'hôpital {}: {}", id, e.getMessage());
            throw new RuntimeException("Erreur lors de la récupération de l'hôpital", e);
        }
    }

    public sn.uasz.referencement_PVVIH.dtos.HopitalDto createHospital(sn.uasz.referencement_PVVIH.dtos.HopitalDto hospitalDto) {
        try {
            log.info("➕ Création d'un nouvel hôpital via Feign Client");
            return userServiceClient.createHospital(hospitalDto);
        } catch (Exception e) {
            log.error("❌ Erreur lors de la création de l'hôpital: {}", e.getMessage());
            throw new RuntimeException("Erreur lors de la création de l'hôpital", e);
        }
    }

    public sn.uasz.referencement_PVVIH.dtos.HopitalDto updateHospital(Long id, sn.uasz.referencement_PVVIH.dtos.HopitalDto hospitalDto) {
        try {
            log.info("✏️ Mise à jour de l'hôpital {} via Feign Client", id);
            return userServiceClient.updateHospital(id, hospitalDto);
        } catch (Exception e) {
            log.error("❌ Erreur lors de la mise à jour de l'hôpital {}: {}", id, e.getMessage());
            throw new RuntimeException("Erreur lors de la mise à jour de l'hôpital", e);
        }
    }

    public void deleteHospital(Long id) {
        try {
            log.info("🗑️ Suppression de l'hôpital {} via Feign Client", id);
            userServiceClient.deleteHospital(id);
        } catch (Exception e) {
            log.error("❌ Erreur lors de la suppression de l'hôpital {}: {}", id, e.getMessage());
            throw new RuntimeException("Erreur lors de la suppression de l'hôpital", e);
        }
    }

    public List<sn.uasz.referencement_PVVIH.dtos.HopitalDto> getHospitauxActifs() {
        try {
            log.info("🔍 Récupération des hôpitaux actifs via Feign Client");
            return userServiceClient.getHospitauxActifs();
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération des hôpitaux actifs: {}", e.getMessage());
            throw new RuntimeException("Erreur lors de la récupération des hôpitaux actifs", e);
        }
    }

    public List<sn.uasz.referencement_PVVIH.dtos.HopitalDto> getHospitauxPourCarte() {
        try {
            log.info("🔍 Récupération des hôpitaux pour carte via Feign Client");
            return userServiceClient.getHospitauxPourCarte();
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération des hôpitaux pour carte: {}", e.getMessage());
            throw new RuntimeException("Erreur lors de la récupération des hôpitaux pour carte", e);
        }
    }

    public List<sn.uasz.referencement_PVVIH.dtos.HopitalDto> getInactiveHospitals() {
        try {
            log.info("🔍 Récupération des hôpitaux inactifs via Feign Client");
            return userServiceClient.getInactiveHospitals();
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération des hôpitaux inactifs: {}", e.getMessage());
            throw new RuntimeException("Erreur lors de la récupération des hôpitaux inactifs", e);
        }
    }

    public List<sn.uasz.referencement_PVVIH.dtos.HopitalDto> getMyHospitals() {
        try {
            log.info("🔍 Récupération de mes hôpitaux via Feign Client");
            return userServiceClient.getMyHospitals();
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération de mes hôpitaux: {}", e.getMessage());
            throw new RuntimeException("Erreur lors de la récupération de mes hôpitaux", e);
        }
    }

    public sn.uasz.referencement_PVVIH.dtos.HopitalDto getHopitalAvecDetails(Long id) {
        try {
            log.info("🔍 Récupération de l'hôpital {} avec détails via Feign Client", id);
            return userServiceClient.getHopitalAvecDetails(id);
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération de l'hôpital avec détails {}: {}", id, e.getMessage());
            throw new RuntimeException("Erreur lors de la récupération de l'hôpital avec détails", e);
        }
    }

    public sn.uasz.referencement_PVVIH.dtos.HopitalDto getHopitalAvecPrestataires(Long id) {
        try {
            log.info("🔍 Récupération de l'hôpital {} avec prestataires via Feign Client", id);
            return userServiceClient.getHopitalAvecPrestataires(id);
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération de l'hôpital avec prestataires {}: {}", id, e.getMessage());
            throw new RuntimeException("Erreur lors de la récupération de l'hôpital avec prestataires", e);
        }
    }

    public List<sn.uasz.referencement_PVVIH.dtos.HopitalDto> rechercherHospitaux(String ville, String pays) {
        try {
            log.info("🔍 Recherche d'hôpitaux (ville: {}, pays: {}) via Feign Client", ville, pays);
            return userServiceClient.rechercherHospitaux(ville, pays);
        } catch (Exception e) {
            log.error("❌ Erreur lors de la recherche d'hôpitaux: {}", e.getMessage());
            throw new RuntimeException("Erreur lors de la recherche d'hôpitaux", e);
        }
    }

    public Long countHospitals() {
        try {
            log.info("🔍 Comptage des hôpitaux via Feign Client");
            return userServiceClient.countHospitals();
        } catch (Exception e) {
            log.error("❌ Erreur lors du comptage des hôpitaux: {}", e.getMessage());
            throw new RuntimeException("Erreur lors du comptage des hôpitaux", e);
        }
    }

    public List<sn.uasz.referencement_PVVIH.dtos.HopitalDto> getHospitalsByCountry(String pays) {
        try {
            log.info("🔍 Récupération des hôpitaux par pays {} via Feign Client", pays);
            return userServiceClient.getHospitalsByCountry(pays);
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération des hôpitaux par pays {}: {}", pays, e.getMessage());
            throw new RuntimeException("Erreur lors de la récupération des hôpitaux par pays", e);
        }
    }

    public List<sn.uasz.referencement_PVVIH.dtos.HopitalDto> getHospitalsByCity(String ville) {
        try {
            log.info("🔍 Récupération des hôpitaux par ville {} via Feign Client", ville);
            return userServiceClient.getHospitalsByCity(ville);
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération des hôpitaux par ville {}: {}", ville, e.getMessage());
            throw new RuntimeException("Erreur lors de la récupération des hôpitaux par ville", e);
        }
    }

    public sn.uasz.referencement_PVVIH.dtos.HopitalDto toggleHospitalStatus(Long id, boolean active) {
        try {
            log.info("🔄 Changement du statut de l'hôpital {} (actif: {}) via Feign Client", id, active);
            return userServiceClient.toggleHospitalStatus(id, active);
        } catch (Exception e) {
            log.error("❌ Erreur lors du changement de statut de l'hôpital {}: {}", id, e.getMessage());
            throw new RuntimeException("Erreur lors du changement de statut de l'hôpital", e);
        }
    }

    // ========== MÉTHODES POUR L'USAGE INTERNE (DTOs internes) ==========
    
    /**
     * Récupère tous les doctors et les convertit en DTOs internes
     */
    public List<DoctorDto> getAllDoctorsInternal() {
        List<DoctorFeignDto> feignDoctors = getAllDoctors();
        return feignDoctors.stream()
                .map(doctorMapper::toDoctorDto)
                .toList();
    }

    /**
     * Récupère un doctor par code et le convertit en DTO interne
     */
    public DoctorDto getDoctorByCodeInternal(String codeDoctor) {
        DoctorFeignDto feignDoctor = getDoctorByCode(codeDoctor);
        return doctorMapper.toDoctorDto(feignDoctor);
    }

    /**
     * Récupère tous les patients et les convertit en DTOs internes
     */
    public List<PatientDto> getAllPatientsInternal() {
        List<PatientFeignDto> feignPatients = getAllPatients();
        return feignPatients.stream()
                .map(patientMapper::toPatientDto)
                .toList();
    }

    /**
     * Récupère un patient par code et le convertit en DTO interne
     */
    public PatientDto getPatientByCodeInternal(String codePatient) {
        PatientFeignDto feignPatient = getPatientByCode(codePatient);
        return patientMapper.toPatientDto(feignPatient);
    }

    /**
     * Récupère un doctor par username via FeignClient
     */
    public DoctorFeignDto getDoctorByUsername(String username) {
        try {
            log.info("🔍 Recherche doctor par username {} via Feign Client", username);
            List<DoctorFeignDto> doctors = getAllDoctors();
            
            log.info("📋 {} doctors récupérés depuis gestion_user", doctors.size());
            
            // Recherche par plusieurs critères
            return doctors.stream()
                    .filter(d -> {
                        // 1. Par username exact (DOCTOR_F1NO5L, etc.)
                        if (username.equals(d.getUsername())) {
                            log.info("✅ Doctor trouvé par username: {}", d.getCodeDoctor());
                            return true;
                        }
                        
                        // 2. Par email exact
                        if (username.equals(d.getEmail())) {
                            log.info("✅ Doctor trouvé par email: {}", d.getCodeDoctor());
                            return true;
                        }
                        
                        // 3. Par code doctor (si le username est un code)
                        if (username.equals(d.getCodeDoctor())) {
                            log.info("✅ Doctor trouvé par code: {}", d.getCodeDoctor());
                            return true;
                        }
                        
                        return false;
                    })
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Doctor non trouvé pour username: " + username));
        } catch (Exception e) {
            log.error("❌ Erreur lors de la recherche du doctor par username {}: {}", username, e.getMessage());
            throw new RuntimeException("Erreur lors de la recherche du doctor", e);
        }
    }

    // ========== ASSISTANTS ==========
    /**
     * Récupère tous les assistants via FeignClient
     */
    public List<sn.uasz.referencement_PVVIH.dtos.AssistantSocialDto> getAllAssistants() {
        try {
            log.info("🔍 Récupération de tous les assistants via Feign Client");
            return userServiceClient.getAllAssistants();
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération des assistants: {}", e.getMessage());
            throw new RuntimeException("Erreur lors de la récupération des assistants", e);
        }
    }

    /**
     * Récupère un assistant par username via FeignClient
     */
    public sn.uasz.referencement_PVVIH.dtos.AssistantSocialDto getAssistantByUsername(String username) {
        try {
            log.info("🔍 Recherche assistant par username {} via Feign Client", username);
            // Utiliser directement l'endpoint dédié qui permet aux assistants de récupérer leurs infos
            return userServiceClient.getAssistantByUsername(username);
        } catch (Exception e) {
            log.error("❌ Erreur lors de la recherche de l'assistant par username {}: {}", username, e.getMessage());
            throw new RuntimeException("Erreur lors de la recherche de l'assistant", e);
        }
    }
}
