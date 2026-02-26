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
import sn.uasz.User_API_PVVIH.mappers.AdminMapper;
import sn.uasz.User_API_PVVIH.repositories.DoctorRepository;
import sn.uasz.User_API_PVVIH.repositories.HopitalRepository;
import sn.uasz.User_API_PVVIH.repositories.UserRepository;

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

    public DoctorService(DoctorRepository doctorRepository, AdminMapper adminMapper,
                         UserRepository userRepository, PasswordEncoder passwordEncoder,
                         HopitalRepository hopitalRepository) {
        this.doctorRepository = doctorRepository;
        this.adminMapper = adminMapper;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.hopitalRepository = hopitalRepository;
    }


    public List<DoctorDto> getAllDoctors() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        // Récupérer l'utilisateur authentifié
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur authentifié introuvable"));

        // Autoriser ADMIN et DOCTOR
        String profil = currentUser.getProfil(); // adapter le nom du getter si nécessaire
        if (!"ADMIN".equalsIgnoreCase(profil) && !"DOCTOR".equalsIgnoreCase(profil) && !"ASSISTANT".equalsIgnoreCase(profil)) {
            throw new RuntimeException("Seuls les administrateurs et les médecins peuvent consulter la liste des médecins");
        }

        return doctorRepository.findAll().stream()
                .map(adminMapper::doctorToDto)
                .collect(Collectors.toList());
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
    public DoctorDto creerDoctor(DoctorDto dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Utilisateur authentifié introuvable"));

        // Vérifier le privilège ADMIN
        if (!"ADMIN".equalsIgnoreCase(currentUser.getProfil())) {
            throw new RuntimeException("Seuls les administrateurs peuvent créer des médecins");
        }

        // Vérifier que l'hôpital est fourni
        if (dto.getHopitalId() == null) {
            throw new RuntimeException("L'hôpital est obligatoire pour créer un médecin");
        }

        Doctor doctor = adminMapper.dtoToDoctor(dto);

        // Gestion de l'hôpital
        Hopital hopital = hopitalRepository.findById(dto.getHopitalId())
                .orElseThrow(() -> new RuntimeException("Hôpital non trouvé avec ID: " + dto.getHopitalId()));
        doctor.setHopital(hopital);

        // Gestion de l'utilisateur - recherche par ID ou création
        User doctorUser;
        if (dto.getUtilisateurId() != null) {
            // Utiliser l'utilisateur existant
            doctorUser = userRepository.findById(dto.getUtilisateurId())
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec ID: " + dto.getUtilisateurId()));
        } else {
            // Créer un nouvel utilisateur
            String username;
            do {
                username = "DOCTOR_" + generateAlphaNumericCode(6);
            } while (userRepository.existsByUsername(username));

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

        // Génération automatique du code doctor
        String codeDoctor;
        do {
            codeDoctor = "DOC" + generateAlphaNumericCode(6);
        } while (doctorRepository.existsByCodeDoctor(codeDoctor));
        doctor.setCodeDoctor(codeDoctor);

        // Génération automatique du pseudo
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

        // Vérifier le privilège ADMIN
        if (!"ADMIN".equalsIgnoreCase(currentUser.getProfil())) {
            throw new RuntimeException("Seuls les administrateurs peuvent modifier des médecins");
        }

        Doctor existingDoctor = doctorRepository.findByCodeDoctor(codeDoctor)
                .orElseThrow(() -> new RuntimeException("Médecin non trouvé avec code: " + codeDoctor));

        // Mettre à jour les champs du doctor
        existingDoctor.setEmail(dto.getEmail());
        existingDoctor.setFonction(dto.getFonction());
        existingDoctor.setLieuExercice(dto.getLieuExercice());
        existingDoctor.setTelephone(dto.getTelephone());

        // Mettre à jour l'hôpital si fourni
        if (dto.getHopitalId() != null) {
            Hopital hopital = hopitalRepository.findById(dto.getHopitalId())
                    .orElseThrow(() -> new RuntimeException("Hôpital non trouvé avec ID: " + dto.getHopitalId()));
            existingDoctor.setHopital(hopital);
        }

        // Mettre à jour l'utilisateur associé
        User doctorUser = existingDoctor.getUtilisateur();
        if (doctorUser != null) {
            doctorUser.setNom(dto.getNomUtilisateur());
            doctorUser.setPrenom(dto.getPrenomUtilisateur());
            doctorUser.setNationalite(dto.getNationaliteUtilisateur());

            // Mettre à jour le mot de passe si fourni
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

        // Vérifier le privilège ADMIN
        if (!"ADMIN".equalsIgnoreCase(currentUser.getProfil())) {
            throw new RuntimeException("Seuls les administrateurs peuvent supprimer des médecins");
        }

        Doctor doctor = doctorRepository.findByCodeDoctor(codeDoctor)
                .orElseThrow(() -> new RuntimeException("Médecin non trouvé avec code: " + codeDoctor));

        User user = doctor.getUtilisateur();

        // Vérifier si le médecin a des patients associés
        boolean hasPatients = doctorRepository.countPatientsByDoctor(codeDoctor) > 0;
        if (hasPatients) {
            throw new RuntimeException("Impossible de supprimer le médecin : des patients lui sont associés");
        }

        // Supprimer le médecin
        doctorRepository.delete(doctor);

        // Supprimer l'utilisateur associé s'il n'est pas utilisé ailleurs
        if (user != null) {
            // Vérifier si l'utilisateur est référencé ailleurs
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

    // Méthode pour trouver les médecins par hôpital
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

    // Méthode pour récupérer tous les hôpitaux actifs
    public List<Hopital> getHopitauxActifs() {
        return hopitalRepository.findByActiveTrue();
    }
}