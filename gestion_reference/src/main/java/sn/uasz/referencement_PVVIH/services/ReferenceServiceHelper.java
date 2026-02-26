package sn.uasz.referencement_PVVIH.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import sn.uasz.referencement_PVVIH.entities.Doctor;
import sn.uasz.referencement_PVVIH.entities.Patient;
import sn.uasz.referencement_PVVIH.entities.User;
import sn.uasz.referencement_PVVIH.repositories.AssistantSocialRepository;
import sn.uasz.referencement_PVVIH.repositories.DoctorRepository;
import sn.uasz.referencement_PVVIH.repositories.PatientRepository;
import sn.uasz.referencement_PVVIH.repositories.UserRepository;

import java.util.Optional;

/**
 * Helper pour ReferenceService - gère les fallbacks vers FeignClient
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ReferenceServiceHelper {

    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final AssistantSocialRepository assistantSocialRepository;
    private final DataSyncService dataSyncService;

    /**
     * Trouve un doctor avec fallback vers FeignClient
     */
    public Optional<Doctor> findDoctorByCode(String codeDoctor) {
        try {
            // 1. Chercher en local d'abord
            Optional<Doctor> local = doctorRepository.findByCodeDoctor(codeDoctor);
            if (local.isPresent()) {
                return local;
            }

            // 2. Fallback vers synchronisation
            Doctor synced = dataSyncService.getDoctorByCode(codeDoctor);
            return Optional.of(synced);
        } catch (Exception e) {
            log.error("Erreur recherche doctor {}: {}", codeDoctor, e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * Trouve un patient avec fallback vers FeignClient
     */
    public Optional<Patient> findPatientByCode(String codePatient) {
        try {
            // 1. Chercher en local d'abord
            Optional<Patient> local = patientRepository.findByCodePatient(codePatient);
            if (local.isPresent()) {
                return local;
            }

            // 2. Fallback vers synchronisation
            Patient synced = dataSyncService.getPatientByCode(codePatient);
            return Optional.of(synced);
        } catch (Exception e) {
            log.error("Erreur recherche patient {}: {}", codePatient, e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * Trouve un utilisateur avec fallback vers FeignClient
     */
    public Optional<User> findUserByUsername(String username) {
        try {
            // 1. Chercher en local d'abord
            Optional<User> local = userRepository.findByUsername(username);
            if (local.isPresent()) {
                return local;
            }

            // 2. Fallback vers synchronisation
            User synced = dataSyncService.getUserByUsername(username);
            return Optional.of(synced);
        } catch (Exception e) {
            log.error("Erreur recherche user {}: {}", username, e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * Trouve un doctor par utilisateur
     */
    public Optional<Doctor> findDoctorByUser(User user) {
        try {
            return doctorRepository.findByUtilisateur(user);
        } catch (Exception e) {
            log.error("Erreur recherche doctor par user: {}", e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * Trouve un doctor par username avec synchronisation
     */
    public Optional<Doctor> findDoctorByUsername(String username) {
        try {
            // 1. Chercher en local d'abord
            Optional<Doctor> local = doctorRepository.findByUtilisateur_Username(username);
            if (local.isPresent()) {
                return local;
            }

            // 2. Fallback vers synchronisation
            Doctor synced = dataSyncService.getDoctorByUsername(username);
            return Optional.of(synced);
        } catch (Exception e) {
            log.error("Erreur recherche doctor par username {}: {}", username, e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * Trouve un assistant social par utilisateur avec fallback vers FeignClient
     */
    public Optional<sn.uasz.referencement_PVVIH.entities.AssistantSocial> findAssistantByUser(User user) {
        try {
            // 1. Chercher en local d'abord
            Optional<sn.uasz.referencement_PVVIH.entities.AssistantSocial> local = 
                assistantSocialRepository.findByUtilisateur(user);
            if (local.isPresent()) {
                return local;
            }

            // 2. Fallback vers synchronisation via FeignClient
            sn.uasz.referencement_PVVIH.entities.AssistantSocial synced = 
                dataSyncService.getAssistantByUsername(user.getUsername());
            return Optional.of(synced);
        } catch (Exception e) {
            log.error("Erreur recherche assistant par user {}: {}", user.getUsername(), e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * Trouve un assistant social par code
     */
    public Optional<sn.uasz.referencement_PVVIH.entities.AssistantSocial> findAssistantByCode(String codeAssistant) {
        try {
            return assistantSocialRepository.findByCodeAssistant(codeAssistant);
        } catch (Exception e) {
            log.error("Erreur recherche assistant par code {}: {}", codeAssistant, e.getMessage());
            return Optional.empty();
        }
    }
}