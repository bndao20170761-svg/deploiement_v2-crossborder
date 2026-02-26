package sn.uasz.referencement_PVVIH.services;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sn.uasz.referencement_PVVIH.dtos.DoctorFeignDto;
import sn.uasz.referencement_PVVIH.dtos.PatientFeignDto;
import sn.uasz.referencement_PVVIH.entities.Doctor;
import sn.uasz.referencement_PVVIH.entities.Patient;
import sn.uasz.referencement_PVVIH.entities.User;
import sn.uasz.referencement_PVVIH.entities.Hopital;
import sn.uasz.referencement_PVVIH.repositories.AssistantSocialRepository;
import sn.uasz.referencement_PVVIH.repositories.DoctorRepository;
import sn.uasz.referencement_PVVIH.repositories.HopitalRepository;
import sn.uasz.referencement_PVVIH.repositories.PatientRepository;
import sn.uasz.referencement_PVVIH.repositories.UserRepository;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.Optional;

/**
 * Service pour synchroniser les données entre gestion_user et gestion_reference
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DataSyncService {

    private final UserIntegrationService userIntegrationService;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final AssistantSocialRepository assistantSocialRepository;
    private final HopitalRepository hopitalRepository;
    
    @PersistenceContext
    private EntityManager entityManager;

    /**
     * Récupère un hôpital depuis gestion_user (source de vérité)
     * NE PAS chercher en local - toujours utiliser gestion_user
     */
    @Transactional
    private Hopital getHopitalFromGestionUser(Long hopitalId) {
        try {
            log.info("🔄 Récupération de l'hôpital {} depuis gestion_user (source de vérité)", hopitalId);
            
            // Toujours récupérer depuis gestion_user - c'est la source de vérité
            sn.uasz.referencement_PVVIH.dtos.HopitalDto hopitalDto = 
                userIntegrationService.getHospitalById(hopitalId);
            
            // Chercher si l'hôpital existe déjà en local
            Optional<Hopital> localHopital = hopitalRepository.findById(hopitalId);
            
            if (localHopital.isPresent()) {
                // Mettre à jour l'hôpital existant
                Hopital hopital = localHopital.get();
                hopital.setNom(hopitalDto.getNom());
                hopital.setPays(hopitalDto.getPays());
                hopital.setVille(hopitalDto.getVille());
                hopital.setActive(hopitalDto.getActive());
                hopital.setLatitude(hopitalDto.getLatitude());
                hopital.setLongitude(hopitalDto.getLongitude());
                hopital.setAdresseComplete(hopitalDto.getAdresseComplete());
                hopital.setTelephoneFixe(hopitalDto.getTelephoneFixe());
                
                hopital = hopitalRepository.save(hopital);
                log.info("🔄 Hôpital {} mis à jour", hopitalId);
                return hopital;
            } else {
                // Créer avec SQL natif pour préserver l'ID
                log.info("➕ Création de l'hôpital {} avec ID préservé via SQL natif", hopitalId);
                
                entityManager.createNativeQuery(
                    "INSERT INTO hopital (id, nom, pays, ville, active, latitude, longitude, adresse_complete, telephone_fixe) " +
                    "VALUES (:id, :nom, :pays, :ville, :active, :latitude, :longitude, :adresse, :telephone)")
                    .setParameter("id", hopitalDto.getId())
                    .setParameter("nom", hopitalDto.getNom())
                    .setParameter("pays", hopitalDto.getPays())
                    .setParameter("ville", hopitalDto.getVille())
                    .setParameter("active", hopitalDto.getActive())
                    .setParameter("latitude", hopitalDto.getLatitude())
                    .setParameter("longitude", hopitalDto.getLongitude())
                    .setParameter("adresse", hopitalDto.getAdresseComplete())
                    .setParameter("telephone", hopitalDto.getTelephoneFixe())
                    .executeUpdate();
                
                entityManager.flush();
                entityManager.clear();
                
                // Récupérer l'entité créée
                Hopital hopital = hopitalRepository.findById(hopitalId)
                    .orElseThrow(() -> new RuntimeException("Hôpital non trouvé après insertion"));
                
                log.info("✅ Hôpital {} créé avec ID préservé", hopitalDto.getId());
                return hopital;
            }
        } catch (Exception e) {
            log.error("❌ Erreur récupération hôpital {} depuis gestion_user: {}", hopitalId, e.getMessage());
            throw new RuntimeException("Impossible de récupérer l'hôpital depuis gestion_user: " + hopitalId);
        }
    }

    /**
     * Récupère ou synchronise un doctor depuis gestion_user
     */
    @Transactional
    public Doctor getDoctorByCode(String codeDoctor) {
        // 1. Chercher d'abord en local
        Optional<Doctor> localDoctor = doctorRepository.findByCodeDoctor(codeDoctor);
        if (localDoctor.isPresent()) {
            return localDoctor.get();
        }

        // 2. Si pas trouvé, récupérer depuis gestion_user via FeignClient
        try {
            DoctorFeignDto feignDoctor = userIntegrationService.getDoctorByCode(codeDoctor);
            
            // 3. Créer/synchroniser l'entité locale
            Doctor doctor = new Doctor();
            doctor.setCodeDoctor(feignDoctor.getCodeDoctor());
            doctor.setEmail(feignDoctor.getEmail() != null ? feignDoctor.getEmail() : "");
            doctor.setTelephone(feignDoctor.getTelephone() != null ? feignDoctor.getTelephone() : "");
            
            // Fonction/Spécialité avec valeur par défaut
            String fonction = feignDoctor.getSpecialite();
            if (fonction == null || fonction.trim().isEmpty()) {
                fonction = "Médecin";
            }
            doctor.setFonction(fonction);
            
            // Pseudo: utiliser le code doctor
            doctor.setPseudo(feignDoctor.getCodeDoctor());
            
            // Lieu d'exercice: utiliser l'hôpital ou valeur par défaut
            String lieuExercice = feignDoctor.getHopitalNom();
            if (lieuExercice == null || lieuExercice.trim().isEmpty()) {
                lieuExercice = "Non spécifié";
            }
            doctor.setLieuExercice(lieuExercice);
            
            // Associer à l'hôpital - TOUJOURS récupérer depuis gestion_user
            if (feignDoctor.getHopitalId() != null) {
                try {
                    Hopital hopital = getHopitalFromGestionUser(feignDoctor.getHopitalId());
                    doctor.setHopital(hopital);
                    log.info("✅ Hôpital {} associé au doctor {}", 
                            feignDoctor.getHopitalId(), codeDoctor);
                } catch (Exception e) {
                    log.error("❌ Erreur récupération hôpital {} pour doctor {}: {}", 
                            feignDoctor.getHopitalId(), codeDoctor, e.getMessage());
                    // Continuer sans hôpital - sera null
                    log.warn("⚠️ Le doctor {} sera créé sans association d'hôpital", codeDoctor);
                }
            }
            
            log.info("✅ Doctor {} synchronisé depuis gestion_user", codeDoctor);
            return doctorRepository.save(doctor);
        } catch (Exception e) {
            log.error("❌ Erreur synchronisation doctor {}: {}", codeDoctor, e.getMessage());
            throw new RuntimeException("Doctor introuvable: " + codeDoctor);
        }
    }

    /**
     * Récupère ou synchronise un patient depuis gestion_user
     */
    @Transactional
    public Patient getPatientByCode(String codePatient) {
        // 1. Chercher d'abord en local
        Optional<Patient> localPatient = patientRepository.findByCodePatient(codePatient);
        if (localPatient.isPresent()) {
            return localPatient.get();
        }

        // 2. Si pas trouvé, récupérer depuis gestion_user via FeignClient
        try {
            PatientFeignDto feignPatient = userIntegrationService.getPatientByCode(codePatient);
            
            // 3. Créer/synchroniser l'entité locale avec TOUS les champs
            Patient patient = new Patient();
            patient.setCodePatient(feignPatient.getCodePatient());
            patient.setTelephone(feignPatient.getTelephone());
            
            // Mapper tous les champs disponibles de PatientFeignDto vers Patient
            if (feignPatient.getAdresse() != null) {
                patient.setAdressePermanent(feignPatient.getAdresse());
            }
            
            if (feignPatient.getGenre() != null) {
                patient.setSexe(feignPatient.getGenre());
            }
            
            if (feignPatient.getDateNaissance() != null) {
                // Convertir LocalDate vers Date
                Date dateNaissance = Date.from(feignPatient.getDateNaissance()
                        .atStartOfDay(ZoneId.systemDefault()).toInstant());
                patient.setDateNaissance(dateNaissance);
                
                // Calculer l'âge
                long age = java.time.Period.between(feignPatient.getDateNaissance(), LocalDate.now()).getYears();
                patient.setAge(age);
            }
            
            // Pseudo: utiliser le nom du patient
            if (feignPatient.getNom() != null) {
                patient.setPseudo(feignPatient.getNom());
            }
            
            log.info("✅ Patient {} mappé avec tous les champs depuis gestion_user", codePatient);
            
            // 4. Associer le médecin créateur si disponible
            if (feignPatient.getDoctorCreateCode() != null && !feignPatient.getDoctorCreateCode().isEmpty()) {
                try {
                    Doctor doctorCreate = getDoctorByCode(feignPatient.getDoctorCreateCode());
                    patient.setDoctorCreate(doctorCreate);
                    log.info("✅ Médecin créateur {} associé au patient {}", 
                            feignPatient.getDoctorCreateCode(), codePatient);
                } catch (Exception e) {
                    log.warn("⚠️ Impossible d'associer le médecin créateur {} au patient {}: {}", 
                            feignPatient.getDoctorCreateCode(), codePatient, e.getMessage());
                    // Continuer sans médecin créateur - peut être défini plus tard
                }
            }
            
            return patientRepository.save(patient);
        } catch (Exception e) {
            log.error("Erreur synchronisation patient {}: {}", codePatient, e.getMessage());
            throw new RuntimeException("Patient introuvable: " + codePatient);
        }
    }

    /**
     * Récupère ou synchronise un utilisateur depuis gestion_user
     */
    @Transactional
    public User getUserByUsername(String username) {
        // 1. Chercher d'abord en local
        Optional<User> localUser = userRepository.findByUsername(username);
        if (localUser.isPresent()) {
            return localUser.get();
        }

        // 2. Si pas trouvé, créer un utilisateur minimal
        // (ou récupérer via un endpoint dédié si disponible)
        User user = new User();
        user.setUsername(username);
        user.setProfil("USER"); // Profil par défaut
        user.setActive(true);
        
        return userRepository.save(user);
    }

    /**
     * Force la synchronisation d'un doctor
     */
    @Transactional
    public Doctor syncDoctor(String codeDoctor) {
        try {
            DoctorFeignDto feignDoctor = userIntegrationService.getDoctorByCode(codeDoctor);
            
            Doctor doctor = doctorRepository.findByCodeDoctor(codeDoctor)
                    .orElse(new Doctor());
            
            doctor.setCodeDoctor(feignDoctor.getCodeDoctor());
            doctor.setEmail(feignDoctor.getEmail());
            doctor.setTelephone(feignDoctor.getTelephone());
            
            return doctorRepository.save(doctor);
        } catch (Exception e) {
            log.error("Erreur sync doctor {}: {}", codeDoctor, e.getMessage());
            throw new RuntimeException("Impossible de synchroniser le doctor: " + codeDoctor);
        }
    }

    /**
     * Récupère ou synchronise un doctor par username
     */
    @Transactional
    public Doctor getDoctorByUsername(String username) {
        try {
            // 1. Chercher d'abord en local
            Optional<Doctor> localDoctor = doctorRepository.findByUtilisateur_Username(username);
            if (localDoctor.isPresent()) {
                log.info("✅ Doctor trouvé localement pour username: {}", username);
                return localDoctor.get();
            }

            // 2. Si pas trouvé, récupérer depuis gestion_user via FeignClient
            log.info("🔄 Synchronisation doctor depuis gestion_user pour username: {}", username);
            DoctorFeignDto feignDoctor = userIntegrationService.getDoctorByUsername(username);
            
            // 3. Créer/synchroniser l'entité locale
            Doctor doctor = new Doctor();
            doctor.setCodeDoctor(feignDoctor.getCodeDoctor());
            doctor.setEmail(feignDoctor.getEmail() != null ? feignDoctor.getEmail() : "");
            doctor.setTelephone(feignDoctor.getTelephone() != null ? feignDoctor.getTelephone() : "");
            
            // Fonction/Spécialité avec valeur par défaut
            String fonction = feignDoctor.getSpecialite();
            if (fonction == null || fonction.trim().isEmpty()) {
                fonction = "Médecin"; // Valeur par défaut
            }
            doctor.setFonction(fonction);
            
            // Pseudo: utiliser le pseudo du DTO ou le code doctor
            String pseudo = feignDoctor.getPseudo();
            if (pseudo == null || pseudo.trim().isEmpty()) {
                pseudo = feignDoctor.getCodeDoctor();
            }
            doctor.setPseudo(pseudo);
            
            // Lieu d'exercice: utiliser le lieu du DTO ou l'hôpital ou valeur par défaut
            String lieuExercice = feignDoctor.getLieuExercice();
            if (lieuExercice == null || lieuExercice.trim().isEmpty()) {
                lieuExercice = feignDoctor.getHopitalNom();
                if (lieuExercice == null || lieuExercice.trim().isEmpty()) {
                    lieuExercice = "Non spécifié";
                }
            }
            doctor.setLieuExercice(lieuExercice);
            
            // 4. Associer à l'utilisateur local
            User user = getUserByUsername(username);
            doctor.setUtilisateur(user);
            
            // 5. Associer à l'hôpital - TOUJOURS récupérer depuis gestion_user
            if (feignDoctor.getHopitalId() != null) {
                try {
                    Hopital hopital = getHopitalFromGestionUser(feignDoctor.getHopitalId());
                    doctor.setHopital(hopital);
                    log.info("✅ Hôpital {} associé au doctor {}", 
                            feignDoctor.getHopitalId(), feignDoctor.getCodeDoctor());
                } catch (Exception e) {
                    log.error("❌ Erreur récupération hôpital {} pour doctor {}: {}", 
                            feignDoctor.getHopitalId(), feignDoctor.getCodeDoctor(), e.getMessage());
                    // Continuer sans hôpital - sera null
                    log.warn("⚠️ Le doctor {} sera créé sans association d'hôpital", feignDoctor.getCodeDoctor());
                }
            }
            
            log.info("✅ Doctor {} synchronisé depuis gestion_user", feignDoctor.getCodeDoctor());
            return doctorRepository.save(doctor);
        } catch (Exception e) {
            log.error("❌ Erreur synchronisation doctor par username {}: {}", username, e.getMessage());
            throw new RuntimeException("Doctor introuvable par username: " + username);
        }
    }

    /**
     * Force la re-synchronisation complète d'un patient depuis gestion_user
     * Utilisé pour s'assurer que toutes les associations (doctorCreate, hopital) sont à jour
     */
    @Transactional
    public Patient forceResyncPatient(String codePatient) {
        try {
            log.info("🔄 FORCE RE-SYNC du patient {} depuis gestion_user", codePatient);
            
            // Récupérer depuis gestion_user via FeignClient
            PatientFeignDto feignPatient = userIntegrationService.getPatientByCode(codePatient);
            
            // Chercher ou créer l'entité locale
            Patient patient = patientRepository.findByCodePatient(codePatient)
                    .orElse(new Patient());
            
            // Mettre à jour TOUS les champs disponibles dans PatientFeignDto
            patient.setCodePatient(feignPatient.getCodePatient());
            patient.setTelephone(feignPatient.getTelephone());
            
            // Convertir LocalDate en Date et calculer l'âge
            if (feignPatient.getDateNaissance() != null) {
                Date dateNaissance = Date.from(feignPatient.getDateNaissance()
                        .atStartOfDay(ZoneId.systemDefault()).toInstant());
                patient.setDateNaissance(dateNaissance);
                
                // Calculer l'âge
                long age = java.time.Period.between(feignPatient.getDateNaissance(), LocalDate.now()).getYears();
                patient.setAge(age);
            }
            
            // Mapper tous les champs avec des noms différents
            if (feignPatient.getGenre() != null) {
                patient.setSexe(feignPatient.getGenre());
            }
            
            if (feignPatient.getAdresse() != null) {
                patient.setAdressePermanent(feignPatient.getAdresse());
            }
            
            // Pseudo: utiliser le nom du patient
            if (feignPatient.getNom() != null) {
                patient.setPseudo(feignPatient.getNom());
            }
            
            log.info("✅ Tous les champs du patient {} mis à jour depuis gestion_user", codePatient);
            
            // IMPORTANT: Synchroniser le médecin créateur avec son hôpital
            if (feignPatient.getDoctorCreateCode() != null && !feignPatient.getDoctorCreateCode().isEmpty()) {
                try {
                    log.info("🔄 Synchronisation du médecin créateur {} pour patient {}", 
                            feignPatient.getDoctorCreateCode(), codePatient);
                    
                    // getDoctorByCode synchronise aussi l'hôpital du médecin
                    Doctor doctorCreate = getDoctorByCode(feignPatient.getDoctorCreateCode());
                    patient.setDoctorCreate(doctorCreate);
                    
                    log.info("✅ Médecin créateur {} associé au patient {} - Hôpital: {}", 
                            feignPatient.getDoctorCreateCode(), 
                            codePatient,
                            doctorCreate.getHopital() != null ? doctorCreate.getHopital().getId() : "null");
                } catch (Exception e) {
                    log.error("❌ Erreur synchronisation médecin créateur {} pour patient {}: {}", 
                            feignPatient.getDoctorCreateCode(), codePatient, e.getMessage());
                    throw new RuntimeException("Impossible de synchroniser le médecin créateur du patient");
                }
            } else {
                log.warn("⚠️ Patient {} n'a pas de médecin créateur dans gestion_user", codePatient);
            }
            
            Patient savedPatient = patientRepository.save(patient);
            log.info("✅ Patient {} re-synchronisé avec succès", codePatient);
            return savedPatient;
            
        } catch (Exception e) {
            log.error("❌ Erreur force re-sync patient {}: {}", codePatient, e.getMessage());
            throw new RuntimeException("Impossible de re-synchroniser le patient: " + codePatient);
        }
    }

    /**
     * Récupère ou synchronise un assistant par username depuis gestion_user
     */
    @Transactional
    public sn.uasz.referencement_PVVIH.entities.AssistantSocial getAssistantByUsername(String username) {
        try {
            // 1. Chercher d'abord en local
            Optional<sn.uasz.referencement_PVVIH.entities.AssistantSocial> localAssistant = 
                assistantSocialRepository.findByUtilisateur_Username(username);
            if (localAssistant.isPresent()) {
                log.info("✅ Assistant trouvé localement pour username: {}", username);
                return localAssistant.get();
            }

            // 2. Si pas trouvé, récupérer depuis gestion_user via FeignClient
            log.info("🔄 Synchronisation assistant depuis gestion_user pour username: {}", username);
            sn.uasz.referencement_PVVIH.dtos.AssistantSocialDto feignAssistant = 
                userIntegrationService.getAssistantByUsername(username);
            
            // 3. Créer/synchroniser l'entité locale
            sn.uasz.referencement_PVVIH.entities.AssistantSocial assistant = 
                new sn.uasz.referencement_PVVIH.entities.AssistantSocial();
            assistant.setCodeAssistant(feignAssistant.getCodeAssistant());
            assistant.setEmail(feignAssistant.getEmail());
            assistant.setTelephone(feignAssistant.getTelephone());
            assistant.setLieuExercice(feignAssistant.getLieuExercice());
            assistant.setPseudo(feignAssistant.getPseudo());
            
            // 4. Associer à l'utilisateur local
            User user = getUserByUsername(username);
            assistant.setUtilisateur(user);
            
            // 5. Associer à l'hôpital - TOUJOURS récupérer depuis gestion_user
            if (feignAssistant.getHopitalId() != null) {
                try {
                    Hopital hopital = getHopitalFromGestionUser(feignAssistant.getHopitalId());
                    assistant.setHopital(hopital);
                    log.info("✅ Hôpital {} associé à l'assistant {}", 
                            feignAssistant.getHopitalId(), feignAssistant.getCodeAssistant());
                } catch (Exception e) {
                    log.error("❌ Erreur récupération hôpital {} pour assistant {}: {}", 
                            feignAssistant.getHopitalId(), feignAssistant.getCodeAssistant(), e.getMessage());
                    // Continuer sans hôpital - sera null
                    log.warn("⚠️ L'assistant {} sera créé sans association d'hôpital", feignAssistant.getCodeAssistant());
                }
            }
            
            return assistantSocialRepository.save(assistant);
        } catch (Exception e) {
            log.error("❌ Erreur synchronisation assistant par username {}: {}", username, e.getMessage());
            throw new RuntimeException("Assistant introuvable par username: " + username);
        }
    }
}