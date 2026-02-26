package sn.uasz.Patient_PVVIH.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import sn.uasz.Patient_PVVIH.dtos.*;
import sn.uasz.Patient_PVVIH.feign.UserServiceClient;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserIntegrationService {

    private final UserServiceClient userServiceClient;

    // ========== MAPPING METHODS ==========
    private UserPatientDto mapToUserPatientDto(UserServicePatientDto source) {
        if (source == null) return null;
        
        UserPatientDto target = new UserPatientDto();
        target.setCodePatient(source.getCodePatient());
        target.setNom(source.getNomUtilisateur());
        target.setPrenom(source.getPrenomUtilisateur());
        target.setEmail(source.getUsername());
        target.setTelephone(source.getTelephone());
        
        // Conversion Date vers LocalDate
        if (source.getDateNaissance() != null) {
            target.setDateNaissance(source.getDateNaissance().toInstant()
                .atZone(ZoneId.systemDefault()).toLocalDate());
        }
        
        target.setAdresse(source.getAdressePermanent());
        target.setNationalite(source.getNationalite());
        target.setSexe(source.getSexe());
        target.setProfession(source.getProfession());
        target.setSituationMatrimoniale(source.getStatutMatrimoniale());
        target.setUtilisateurId(source.getUtilisateurId());
        target.setNomUtilisateur(source.getNomUtilisateur());
        target.setPrenomUtilisateur(source.getPrenomUtilisateur());
        target.setNationaliteUtilisateur(source.getNationaliteUtilisateur());
        
        return target;
    }

    private UserServicePatientDto mapToUserServicePatientDto(UserPatientDto source) {
        if (source == null) return null;
        
        return UserServicePatientDto.builder()
            .codePatient(source.getCodePatient())
            .nomUtilisateur(source.getNom())
            .prenomUtilisateur(source.getPrenom())
            .username(source.getEmail())
            .telephone(source.getTelephone())
            .dateNaissance(source.getDateNaissance() != null ? 
                java.util.Date.from(source.getDateNaissance().atStartOfDay(ZoneId.systemDefault()).toInstant()) : null)
            .adressePermanent(source.getAdresse())
            .nationalite(source.getNationalite())
            .sexe(source.getSexe())
            .profession(source.getProfession())
            .statutMatrimoniale(source.getSituationMatrimoniale())
            .utilisateurId(source.getUtilisateurId())
            .nationaliteUtilisateur(source.getNationaliteUtilisateur())
            .build();
    }

    // ========== PATIENTS METHODS ==========
    public List<UserPatientDto> getAllPatients() {
        try {
            log.info("🔄 Récupération de tous les patients depuis gestion_user");
            List<UserServicePatientDto> servicePatients = userServiceClient.getAllPatients();
            List<UserPatientDto> patients = servicePatients.stream()
                .map(this::mapToUserPatientDto)
                .collect(Collectors.toList());
            log.info("✅ {} patients récupérés et mappés", patients.size());
            return patients;
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération des patients: {}", e.getMessage());
            throw new RuntimeException("Erreur lors de la récupération des patients", e);
        }
    }

    public UserPatientDto getPatientByCode(String codePatient) {
        try {
            log.info("🔄 Récupération du patient avec code: {}", codePatient);
            UserServicePatientDto servicePatient = userServiceClient.getPatientByCode(codePatient);
            UserPatientDto patient = mapToUserPatientDto(servicePatient);
            log.info("✅ Patient récupéré et mappé: {}", patient.getNom());
            return patient;
        } catch (feign.FeignException.Forbidden e) {
            log.warn("⚠️ Accès refusé (403) pour le patient {}: le patient n'existe pas dans gestion_user ou accès non autorisé", codePatient);
            return null; // Retourner null au lieu de lancer une exception
        } catch (feign.FeignException.NotFound e) {
            log.warn("⚠️ Patient {} non trouvé (404) dans gestion_user", codePatient);
            return null; // Retourner null au lieu de lancer une exception
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération du patient {}: {}", codePatient, e.getMessage());
            return null; // Retourner null au lieu de lancer une exception
        }
    }

    public UserPatientDto createPatient(UserPatientDto patientDto) {
        try {
            log.info("🔄 Création d'un nouveau patient: {}", patientDto.getNom());
            UserServicePatientDto servicePatientDto = mapToUserServicePatientDto(patientDto);
            UserServicePatientDto createdServicePatient = userServiceClient.createPatient(servicePatientDto);
            UserPatientDto createdPatient = mapToUserPatientDto(createdServicePatient);
            log.info("✅ Patient créé avec code: {}", createdPatient.getCodePatient());
            return createdPatient;
        } catch (Exception e) {
            log.error("❌ Erreur lors de la création du patient: {}", e.getMessage());
            throw new RuntimeException("Erreur lors de la création du patient", e);
        }
    }

    public UserPatientDto updatePatient(String codePatient, UserPatientDto patientDto) {
        try {
            log.info("🔄 Mise à jour du patient: {}", codePatient);
            UserServicePatientDto servicePatientDto = mapToUserServicePatientDto(patientDto);
            UserServicePatientDto updatedServicePatient = userServiceClient.updatePatient(codePatient, servicePatientDto);
            UserPatientDto updatedPatient = mapToUserPatientDto(updatedServicePatient);
            log.info("✅ Patient mis à jour: {}", updatedPatient.getNom());
            return updatedPatient;
        } catch (Exception e) {
            log.error("❌ Erreur lors de la mise à jour du patient {}: {}", codePatient, e.getMessage());
            throw new RuntimeException("Erreur lors de la mise à jour du patient", e);
        }
    }

    public void deletePatient(String codePatient) {
        try {
            log.info("🔄 Suppression du patient: {}", codePatient);
            userServiceClient.deletePatient(codePatient);
            log.info("✅ Patient supprimé: {}", codePatient);
        } catch (Exception e) {
            log.error("❌ Erreur lors de la suppression du patient {}: {}", codePatient, e.getMessage());
            throw new RuntimeException("Erreur lors de la suppression du patient", e);
        }
    }

    // ========== DOCTORS METHODS ==========
    public List<DoctorDto> getAllDoctors() {
        try {
            log.info("🔄 Récupération de tous les médecins depuis gestion_user");
            List<DoctorDto> doctors = userServiceClient.getAllDoctors();
            log.info("✅ {} médecins récupérés", doctors.size());
            return doctors;
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération des médecins: {}", e.getMessage());
            throw new RuntimeException("Erreur lors de la récupération des médecins", e);
        }
    }

    public DoctorDto getDoctorByCode(String codeDoctor) {
        try {
            log.info("🔄 Récupération du médecin avec code: {}", codeDoctor);
            DoctorDto doctor = userServiceClient.getDoctorByCode(codeDoctor);
            log.info("✅ Médecin récupéré: {}", doctor.getNom());
            return doctor;
        } catch (feign.FeignException.Forbidden e) {
            log.warn("⚠️ Accès refusé (403) pour le médecin {}: le médecin n'existe pas dans gestion_user ou accès non autorisé", codeDoctor);
            return null; // Retourner null au lieu de lancer une exception
        } catch (feign.FeignException.NotFound e) {
            log.warn("⚠️ Médecin {} non trouvé (404) dans gestion_user", codeDoctor);
            return null; // Retourner null au lieu de lancer une exception
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération du médecin {}: {}", codeDoctor, e.getMessage());
            return null; // Retourner null au lieu de lancer une exception
        }
    }

    // ========== HOSPITALS METHODS ==========
    public List<HopitalDto> getAllHospitals() {
        try {
            log.info("🔄 Récupération de tous les hôpitaux depuis gestion_user");
            List<HopitalDto> hospitals = userServiceClient.getAllHospitals();
            log.info("✅ {} hôpitaux récupérés", hospitals.size());
            return hospitals;
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération des hôpitaux: {}", e.getMessage());
            throw new RuntimeException("Erreur lors de la récupération des hôpitaux", e);
        }
    }

    public HopitalDto getHospitalById(Long id) {
        try {
            log.info("🔄 Récupération de l'hôpital avec ID: {}", id);
            HopitalDto hospital = userServiceClient.getHospitalById(id);
            log.info("✅ Hôpital récupéré: {}", hospital.getNom());
            return hospital;
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération de l'hôpital {}: {}", id, e.getMessage());
            throw new RuntimeException("Hôpital non trouvé: " + id, e);
        }
    }

    public List<HopitalDto> getActiveHospitals() {
        try {
            log.info("🔄 Récupération des hôpitaux actifs depuis gestion_user");
            List<HopitalDto> hospitals = userServiceClient.getActiveHospitals();
            log.info("✅ {} hôpitaux actifs récupérés", hospitals.size());
            return hospitals;
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération des hôpitaux actifs: {}", e.getMessage());
            throw new RuntimeException("Erreur lors de la récupération des hôpitaux actifs", e);
        }
    }

    // ========== ASSISTANTS METHODS ==========
    public List<AssistantDto> getAllAssistants() {
        try {
            log.info("🔄 Récupération de tous les assistants depuis gestion_user");
            List<AssistantDto> assistants = userServiceClient.getAllAssistants();
            log.info("✅ {} assistants récupérés", assistants.size());
            return assistants;
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération des assistants: {}", e.getMessage());
            throw new RuntimeException("Erreur lors de la récupération des assistants", e);
        }
    }

    public AssistantDto getAssistantByCode(String codeAssistant) {
        try {
            log.info("🔄 Récupération de l'assistant avec code: {}", codeAssistant);
            AssistantDto assistant = userServiceClient.getAssistantByCode(codeAssistant);
            log.info("✅ Assistant récupéré: {}", assistant.getNom());
            return assistant;
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération de l'assistant {}: {}", codeAssistant, e.getMessage());
            throw new RuntimeException("Assistant non trouvé: " + codeAssistant, e);
        }
    }
}