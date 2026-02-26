package sn.uasz.User_API_PVVIH.services;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import sn.uasz.User_API_PVVIH.dtos.PatientDto;
import sn.uasz.User_API_PVVIH.entities.AssistantSocial;
import sn.uasz.User_API_PVVIH.entities.Doctor;
import sn.uasz.User_API_PVVIH.entities.Hopital;
import sn.uasz.User_API_PVVIH.entities.Patient;
import sn.uasz.User_API_PVVIH.entities.User;
import sn.uasz.User_API_PVVIH.mappers.AdminMapper;
import sn.uasz.User_API_PVVIH.repositories.AssistantSocialRepository;
import sn.uasz.User_API_PVVIH.repositories.DoctorRepository;
import sn.uasz.User_API_PVVIH.repositories.PatientRepository;
import sn.uasz.User_API_PVVIH.repositories.UserRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@Slf4j
public class PatientService {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AdminMapper adminMapper;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AssistantSocialRepository assistant;

    public PatientService(PatientRepository patientRepository, DoctorRepository doctorRepository,  AdminMapper adminMapper, UserRepository userRepository, PasswordEncoder passwordEncoder, AssistantSocialRepository assistant) {
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.adminMapper = adminMapper;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.assistant = assistant;
    }

    public List<PatientDto> getAll() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        // Récupérer l'utilisateur courant
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur authentifié introuvable"));

        Optional<Doctor> doctorOpt = doctorRepository.findByUtilisateur_Username(username);
        Optional<AssistantSocial> assistantOpt = assistant.findByUtilisateur_Username(username);

        List<Patient> patients = new ArrayList<>();

        if (doctorOpt.isPresent()) {
            // DOCTOR: voir uniquement ses propres patients
            Doctor doctor = doctorOpt.get();
            patients = patientRepository.findByDoctorCreate_CodeDoctor(doctor.getCodeDoctor());
            System.out.println("✅ Doctor " + doctor.getCodeDoctor() + " récupère " + patients.size() + " patients");
        }
        else if("ADMIN".equalsIgnoreCase(currentUser.getProfil())){
            // ADMIN: voir tous les patients
            patients = patientRepository.findAll();
            System.out.println("✅ Admin récupère " + patients.size() + " patients");
        } 
        else if (assistantOpt.isPresent()) {
            // ASSISTANT SOCIAL: voir les patients créés par les doctors de son hôpital
            AssistantSocial social = assistantOpt.get();
            Hopital assistantHopital = social.getHopital();
            
            if (assistantHopital == null) {
                throw new RuntimeException("L'assistant social n'est associé à aucun hôpital");
            }
            
            patients = patientRepository.findAll().stream()
                    .filter(p -> p.getDoctorCreate() != null
                            && p.getDoctorCreate().getHopital() != null
                            && p.getDoctorCreate().getHopital().getId().equals(assistantHopital.getId()))
                    .toList();
            
            System.out.println("✅ Assistant social de l'hôpital " + assistantHopital.getNom() + 
                             " récupère " + patients.size() + " patients");
        } 
        else {
            throw new RuntimeException("Utilisateur non reconnu comme médecin, assistant social ou admin");
        }

        return patients.stream()
                .map(adminMapper::patientToDto)
                .collect(Collectors.toList());
    }

    public PatientDto getPatientByCode(String codePatient) {
        Patient patient = patientRepository.findById(codePatient)
                .orElseThrow(() -> new RuntimeException("Patient non trouvé avec codePatient: " + codePatient));
        return adminMapper.patientToDto(patient);
    }

    private String generateAlphaNumericCode(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder code = new StringBuilder();
        Random random = new Random();
        for (int i = 0; i < length; i++) {
            code.append(chars.charAt(random.nextInt(chars.length())));
        }
        return code.toString();
    }

    @Transactional
    public PatientDto create(PatientDto dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        // Vérifier le rôle depuis les authorities du JWT au lieu de la base de données
        boolean isDoctor = authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_DOCTOR"));
        
        if (!isDoctor) {
            throw new RuntimeException("Seuls les médecins peuvent créer des patients");
        }

        // Récupérer ou créer l'utilisateur si nécessaire
        User currentUser = userRepository.findByUsername(currentUsername).orElse(null);
        if (currentUser == null) {
            // Créer un utilisateur minimal si inexistant (pour les appels inter-services)
            currentUser = User.builder()
                    .username(currentUsername)
                    .profil("DOCTOR")
                    .active(true)
                    .password(passwordEncoder.encode("temp"))
                    .dateCreation(LocalDateTime.now())
                    .build();
            currentUser = userRepository.save(currentUser);
        }

        Patient patient = adminMapper.dtoToPatient(dto);

        // Attribution du médecin créateur
        if (dto.getDoctorCreateCode() != null) {
            doctorRepository.findByCodeDoctor(dto.getDoctorCreateCode())
                    .ifPresent(patient::setDoctorCreate);
        } else {
            // Chercher le docteur par username
            Optional<Doctor> doctorOpt = doctorRepository.findByUtilisateur_Username(currentUser.getUsername());
            if (doctorOpt.isPresent()) {
                patient.setDoctorCreate(doctorOpt.get());
            } else {
                // Créer un docteur minimal si inexistant (pour les appels inter-services)
                log.warn("⚠️ Docteur introuvable pour username {}. Création automatique...", currentUser.getUsername());
                Doctor doctor = new Doctor();
                doctor.setCodeDoctor("DOC_" + generateAlphaNumericCode(6));
                doctor.setEmail(currentUser.getUsername().contains("@") ? currentUser.getUsername() : "");
                doctor.setTelephone("");
                doctor.setFonction("Médecin");
                doctor.setPseudo(doctor.getCodeDoctor());
                doctor.setLieuExercice("Non spécifié");
                doctor.setUtilisateur(currentUser);
                // Note: L'hôpital sera null - à définir plus tard si nécessaire
                doctor = doctorRepository.save(doctor);
                patient.setDoctorCreate(doctor);
                log.info("✅ Docteur {} créé automatiquement", doctor.getCodeDoctor());
            }
        }

        // Gestion du username patient
        String patientUsername = dto.getUsername();
        if (patientUsername == null || patientUsername.isBlank()) {
            if (dto.getNomUtilisateur() != null && dto.getPrenomUtilisateur() != null) {
                patientUsername = (dto.getNomUtilisateur() + dto.getPrenomUtilisateur())
                        .replaceAll("\\s+", "")
                        .toLowerCase();
            } else if (dto.getTelephone() != null && !dto.getTelephone().isBlank()) {
                // Générer un username basé sur le téléphone
                patientUsername = "PATIENT_" + dto.getTelephone().replaceAll("[^0-9]", "");
            } else {
                // Générer un username aléatoire
                patientUsername = "PATIENT_" + generateAlphaNumericCode(8);
            }
        }

        // Création utilisateur patient si inexistant
        User patientUser = userRepository.findByUsername(patientUsername).orElse(null);
        if (patientUser == null) {
            // Générer un mot de passe par défaut si non fourni
            String password = dto.getPassword();
            if (password == null || password.isBlank()) {
                password = "Patient@" + generateAlphaNumericCode(6);
            }
            
            patientUser = User.builder()
                    .username(patientUsername)
                    .nom(dto.getNomUtilisateur())
                    .prenom(dto.getPrenomUtilisateur())
                    .nationalite(dto.getNationalite())
                    .profil("PATIENT")
                    .active(true)
                    .password(passwordEncoder.encode(password))
                    .dateCreation(LocalDateTime.now())
                    .build();
            patientUser = userRepository.save(patientUser);
        }
        patient.setUtilisateur(patientUser);

        // Génération code patient unique
        String codePatient;
        do {
            codePatient = generateAlphaNumericCode(8);
        } while (patientRepository.existsByCodePatient(codePatient));
        patient.setCodePatient(codePatient);

        // Génération pseudo unique
        String pseudo;
        do {
            pseudo = generateAlphaNumericCode(6);
        } while (patientRepository.existsByPseudo(pseudo));
        patient.setPseudo(pseudo);

        Patient savedPatient = patientRepository.save(patient);

        System.out.println("Patient user id: " +
                (patient.getUtilisateur() != null ? patient.getUtilisateur().getId() : "null"));

        return adminMapper.patientToDto(savedPatient);
    }

    @Transactional
    public PatientDto update(String codePatient, PatientDto dto) {
        Patient existing = patientRepository.findById(codePatient)
                .orElseThrow(() -> new RuntimeException("Patient non trouvé avec codePatient: " + codePatient));

        // Met à jour les champs simples
        existing.setAdressePermanent(dto.getAdressePermanent());
        existing.setAdresseTemporaire(dto.getAdresseTemporaire());
        existing.setAge(dto.getAge());
        existing.setDateNaissance(dto.getDateNaissance());
        existing.setProfession(dto.getProfession());
        existing.setPseudo(dto.getPseudo());
        existing.setSexe(dto.getSexe());
        existing.setStatutMatrimoniale(dto.getStatutMatrimoniale());
        existing.setTelephone(dto.getTelephone());

        // Met à jour le doctorCreate si fourni
        if (dto.getDoctorCreateCode() != null) {
            doctorRepository.findByCodeDoctor(dto.getDoctorCreateCode())
                    .ifPresent(existing::setDoctorCreate);
        }

        // Mise à jour ou création de l'utilisateur lié
        String patientUsername = dto.getUsername();
        if (patientUsername == null || patientUsername.isBlank()) {
            if (dto.getNomUtilisateur() != null && dto.getPrenomUtilisateur() != null) {
                patientUsername = (dto.getNomUtilisateur() + dto.getPrenomUtilisateur())
                        .replaceAll("\\s+", "")
                        .toLowerCase();
            } else {
                throw new RuntimeException("Le patient doit être lié à un utilisateur avec un username ou nom/prénom.");
            }
        }

        User patientUser = userRepository.findByUsername(patientUsername).orElse(null);

        if (patientUser == null) {
            // Pour les appels inter-services, générer un password par défaut si absent
            String password = dto.getPassword();
            if (password == null || password.isBlank()) {
                password = "INTER_SERVICE_" + System.currentTimeMillis(); // Password temporaire
            }
            
            patientUser = User.builder()
                    .username(patientUsername)
                    .nom(dto.getNomUtilisateur())
                    .prenom(dto.getPrenomUtilisateur())
                    .nationalite(dto.getNationalite())
                    .profil("PATIENT")
                    .active(true)
                    .password(passwordEncoder.encode(password))
                    .dateCreation(LocalDateTime.now())
                    .build();
            patientUser = userRepository.save(patientUser);
        } else {
            patientUser.setNom(dto.getNomUtilisateur());
            patientUser.setPrenom(dto.getPrenomUtilisateur());
            patientUser.setNationalite(dto.getNationalite());
            if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
                patientUser.setPassword(passwordEncoder.encode(dto.getPassword()));
            }
            userRepository.save(patientUser);
        }

        existing.setUtilisateur(patientUser);

        Patient saved = patientRepository.save(existing);
        return adminMapper.patientToDto(saved);
    }

    @Transactional
    public void delete(String codePatient) {
        Patient patient = patientRepository.findById(codePatient)
                .orElseThrow(() -> new RuntimeException("Patient non trouvé avec codePatient: " + codePatient));

        // Pour éviter les problèmes de contraintes, on supprime seulement le patient
        // L'utilisateur associé reste en base pour éviter les problèmes de référence
        patientRepository.delete(patient);
        
        // TODO: Implémenter une logique plus sophistiquée pour la gestion des utilisateurs orphelins
    }
}