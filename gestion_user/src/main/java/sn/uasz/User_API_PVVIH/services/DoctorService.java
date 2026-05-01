package sn.uasz.User_API_PVVIH.services;

import jakarta.transaction.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import sn.uasz.User_API_PVVIH.dtos.DoctorDto;
import sn.uasz.User_API_PVVIH.entities.Doctor;
import sn.uasz.User_API_PVVIH.entities.Hopital;
import sn.uasz.User_API_PVVIH.entities.User;
import sn.uasz.User_API_PVVIH.entities.AssistantSocial;
import sn.uasz.User_API_PVVIH.mappers.AdminMapper;
import sn.uasz.User_API_PVVIH.repositories.DoctorRepository;
import sn.uasz.User_API_PVVIH.repositories.HopitalRepository;
import sn.uasz.User_API_PVVIH.repositories.UserRepository;
import sn.uasz.User_API_PVVIH.repositories.AssistantSocialRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final AdminMapper adminMapper;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final HopitalRepository hopitalRepository;
    private final AssistantSocialRepository assistantSocialRepository;

    public DoctorService(DoctorRepository doctorRepository, AdminMapper adminMapper,
                         UserRepository userRepository, PasswordEncoder passwordEncoder,
                         HopitalRepository hopitalRepository, AssistantSocialRepository assistantSocialRepository) {
        this.doctorRepository = doctorRepository;
        this.adminMapper = adminMapper;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.hopitalRepository = hopitalRepository;
        this.assistantSocialRepository = assistantSocialRepository;
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

    public List<DoctorDto> getAllDoctors() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur authentifié introuvable"));

        String profil = currentUser.getProfil();
        if (!"ADMIN".equalsIgnoreCase(profil) && !"DOCTOR".equalsIgnoreCase(profil) && !"ASSISTANT".equalsIgnoreCase(profil)) {
            throw new RuntimeException("Seuls les administrateurs et les médecins peuvent consulter la liste des médecins");
        }

        return doctorRepository.findAll().stream()
                .map(adminMapper::doctorToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public DoctorDto creerDoctor(DoctorDto dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Utilisateur authentifié introuvable"));

        if (!"ADMIN".equalsIgnoreCase(currentUser.getProfil())) {
            throw new RuntimeException("Seuls les administrateurs peuvent créer des médecins");
        }

        if (dto.getHopitalId() == null) {
            throw new RuntimeException("L'hôpital est obligatoire pour créer un médecin");
        }

        Doctor doctor = adminMapper.dtoToDoctor(dto);

        Hopital hopital = hopitalRepository.findById(dto.getHopitalId())
                .orElseThrow(() -> new RuntimeException("Hôpital non trouvé avec ID: " + dto.getHopitalId()));
        doctor.setHopital(hopital);

        User doctorUser;
        if (dto.getUtilisateurId() != null) {
            doctorUser = userRepository.findById(dto.getUtilisateurId())
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec ID: " + dto.getUtilisateurId()));
        } else {
            String username = dto.getEmail();
            if (username == null || username.trim().isEmpty()) {
                throw new RuntimeException("L'email est obligatoire pour créer un compte doctor");
            }

            if (userRepository.existsByUsername(username)) {
                throw new RuntimeException("Un utilisateur avec cet email existe déjà: " + username);
            }

            doctorUser = User.builder()
                    .username(username)
                    .nom(dto.getNomUtilisateur() != null ? dto.getNomUtilisateur() : "Docteur")
                    .prenom(dto.getPrenomUtilisateur() != null ? dto.getPrenomUtilisateur() : "Médecin")
                    .profil("DOCTOR")
                    .active(true)
                    .password(passwordEncoder.encode(dto.getPassword() != null ? dto.getPassword() : "password123"))
                    .dateCreation(LocalDateTime.now())
                    .build();

            doctorUser = userRepository.save(doctorUser);
        }

        doctor.setUtilisateur(doctorUser);

        String codeDoctor;
        do {
            codeDoctor = "DOC" + generateAlphaNumericCode(6);
        } while (existsByCodeDoctor(codeDoctor));
        doctor.setCodeDoctor(codeDoctor);

        String pseudo;
        do {
            pseudo = "DR" + generateAlphaNumericCode(6);
        } while (doctorRepository.existsByPseudo(pseudo));
        doctor.setPseudo(pseudo);

        Doctor savedDoctor = doctorRepository.save(doctor);

        return adminMapper.doctorToDto(savedDoctor);
    }

    @Transactional
    public DoctorDto modifierDoctor(String codeDoctor, DoctorDto dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Utilisateur authentifié introuvable"));

        if (!"ADMIN".equalsIgnoreCase(currentUser.getProfil())) {
            throw new RuntimeException("Seuls les administrateurs peuvent modifier des médecins");
        }

        Doctor existingDoctor = doctorRepository.findByCodeDoctor(codeDoctor)
                .orElseThrow(() -> new RuntimeException("Médecin non trouvé avec code: " + codeDoctor));

        existingDoctor.setEmail(dto.getEmail());
        existingDoctor.setFonction(dto.getFonction());
        existingDoctor.setLieuExercice(dto.getLieuExercice());
        existingDoctor.setTelephone(dto.getTelephone());

        if (dto.getHopitalId() != null) {
            Hopital hopital = hopitalRepository.findById(dto.getHopitalId())
                    .orElseThrow(() -> new RuntimeException("Hôpital non trouvé avec ID: " + dto.getHopitalId()));
            existingDoctor.setHopital(hopital);
        }

        User doctorUser = existingDoctor.getUtilisateur();
        if (doctorUser != null) {
            doctorUser.setNom(dto.getNomUtilisateur());
            doctorUser.setPrenom(dto.getPrenomUtilisateur());
            doctorUser.setNationalite(dto.getNationaliteUtilisateur());

            if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
                doctorUser.setPassword(passwordEncoder.encode(dto.getPassword()));
            }

            userRepository.save(doctorUser);
        }

        Doctor updatedDoctor = doctorRepository.save(existingDoctor);
        return adminMapper.doctorToDto(updatedDoctor);
    }

    @Transactional
    public void supprimerDoctor(String codeDoctor) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Utilisateur authentifié introuvable"));

        if (!"ADMIN".equalsIgnoreCase(currentUser.getProfil())) {
            throw new RuntimeException("Seuls les administrateurs peuvent supprimer des médecins");
        }

        Doctor doctor = doctorRepository.findByCodeDoctor(codeDoctor)
                .orElseThrow(() -> new RuntimeException("Médecin non trouvé avec code: " + codeDoctor));

        User user = doctor.getUtilisateur();

        boolean hasPatients = doctorRepository.countPatientsByDoctor(codeDoctor) > 0;
        if (hasPatients) {
            throw new RuntimeException("Impossible de supprimer le médecin : des patients lui sont associés");
        }

        doctorRepository.delete(doctor);

        if (user != null) {
            boolean isReferencedElsewhere = doctorRepository.existsByUtilisateurAndCodeDoctorNot(user, codeDoctor);
            if (!isReferencedElsewhere) {
                userRepository.delete(user);
            }
        }
    }

    public DoctorDto getDoctorByCode(String codeDoctor) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur authentifié introuvable"));

        if (!"ADMIN".equalsIgnoreCase(currentUser.getProfil())) {
            throw new RuntimeException("Seuls les administrateurs peuvent consulter les détails d'un médecin");
        }

        Doctor doctor = doctorRepository.findByCodeDoctor(codeDoctor)
                .orElseThrow(() -> new RuntimeException("Médecin non trouvé avec code: " + codeDoctor));

        return adminMapper.doctorToDto(doctor);
    }

    public boolean existsByCodeDoctor(String codeDoctor) {
        return doctorRepository.existsByCodeDoctor(codeDoctor);
    }

    public long countDoctors() {
        return doctorRepository.count();
    }

    public List<DoctorDto> getDoctorsByHospital(Long hospitalId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur authentifié introuvable"));

        if (!"ADMIN".equalsIgnoreCase(currentUser.getProfil())) {
            throw new RuntimeException("Seuls les administrateurs peuvent consulter cette liste");
        }

        return doctorRepository.findByHopitalId(hospitalId).stream()
                .map(adminMapper::doctorToDto)
                .collect(Collectors.toList());
    }

    public List<Hopital> getHopitauxActifs() {
        return hopitalRepository.findByActiveTrue();
    }

    /**
     * Récupère l'hôpital du médecin actuellement authentifié
     * @return l'hôpital du médecin ou null si non trouvé
     */
    public Hopital getHopitalCurrentDoctor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        String username = authentication.getName();

        // Cas 1: L'utilisateur est un médecin
        Optional<Doctor> doctorOpt = doctorRepository.findByUtilisateur_Username(username);
        if (doctorOpt.isPresent()) {
            Doctor doctor = doctorOpt.get();
            return doctor.getHopital();
        }

        // Cas 2: L'utilisateur est un assistant
        try {
            // Récupérer l'assistant via le service approprié
            // Note: Vous devrez peut-être injecter AssistantSocialService ici
            // Pour l'instant, je vais utiliser une approche directe
            Optional<AssistantSocial> assistantOpt = assistantSocialRepository.findByUtilisateur_Username(username);
            if (assistantOpt.isPresent()) {
                AssistantSocial assistant = assistantOpt.get();
                // Retourner l'hôpital de l'assistant
                return assistant.getHopital();
            }
        } catch (Exception e) {
            // Si la recherche d'assistant échoue, logger l'erreur mais ne pas bloquer
            System.err.println("Erreur lors de la recherche de l'assistant: " + e.getMessage());
        }

        return null;
    }
}
