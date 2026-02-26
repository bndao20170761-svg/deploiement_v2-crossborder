package sn.uasz.User_API_PVVIH.services;

import jakarta.transaction.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import sn.uasz.User_API_PVVIH.dtos.MembreDto;
import sn.uasz.User_API_PVVIH.entities.Association;
import sn.uasz.User_API_PVVIH.entities.Membre;
import sn.uasz.User_API_PVVIH.entities.User;
import sn.uasz.User_API_PVVIH.mappers.AdminMapper;
import sn.uasz.User_API_PVVIH.repositories.AssociationRepository;
import sn.uasz.User_API_PVVIH.repositories.MembreRepository;
import sn.uasz.User_API_PVVIH.repositories.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class MembreService {

    private final MembreRepository membreRepository;
    private final AssociationRepository associationRepository;
    private final AdminMapper adminMapper;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public MembreService(MembreRepository membreRepository,
                        AssociationRepository associationRepository,
                        AdminMapper adminMapper,
                        UserRepository userRepository,
                        PasswordEncoder passwordEncoder) {
        this.membreRepository = membreRepository;
        this.associationRepository = associationRepository;
        this.adminMapper = adminMapper;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<MembreDto> getAllMembres() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur authentifié introuvable"));

        if (!"ADMIN".equalsIgnoreCase(currentUser.getProfil()) ) {
            throw new RuntimeException("Seuls les administrateurs peuvent consulter la liste des membres");
        }

        List<Membre> membres = membreRepository.findAllWithAssociationsAndUsers();
        System.out.println("Nombre de membres trouvés: " + membres.size()); // Debug

        return membres.stream()
                .map(adminMapper::membreToDto)
                .peek(dto -> System.out.println("Membre DTO: " + dto)) // Debug
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
    public MembreDto creerMembre(MembreDto dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Utilisateur authentifié introuvable"));

        // Vérifier le privilège ADMIN
        if (!"ADMIN".equalsIgnoreCase(currentUser.getProfil())) {
            throw new RuntimeException("Seuls les administrateurs peuvent créer des membres");
        }

        // Vérifier que l'association est fournie
        if (dto.getAssociationCode() == null || dto.getAssociationCode().isBlank()) {
            throw new RuntimeException("L'association est obligatoire pour créer un membre");
        }

        Membre membre = adminMapper.dtoToMembre(dto);

        // Gestion de l'association
        Association association = associationRepository.findByCodeAssociation(dto.getAssociationCode())
                .orElseThrow(() -> new RuntimeException("Association non trouvée avec code: " + dto.getAssociationCode()));
        membre.setAssociation(association);

        // Gestion de l'utilisateur - recherche par ID ou création
        User membreUser;
        if (dto.getUtilisateurId() != null) {
            // Utiliser l'utilisateur existant
            membreUser = userRepository.findById(dto.getUtilisateurId())
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec ID: " + dto.getUtilisateurId()));
        } else {
            // Créer un nouvel utilisateur
            String username;
            do {
                username = "MEMBRE_" + generateAlphaNumericCode(6);
            } while (userRepository.existsByUsername(username));

            membreUser = User.builder()
                    .username(dto.getEmailUser() != null ? dto.getEmailUser() : "membre.temp@pvvih.sn")
                    .nom(dto.getNomUtilisateur() != null ? dto.getNomUtilisateur() : "Membre")
                    .prenom(dto.getPrenomUtilisateur() != null ? dto.getPrenomUtilisateur() : "Association")
                    .profil("MEMBRE")
                    .active(true)
                    .password(passwordEncoder.encode(dto.getPassword() != null ? dto.getPassword() : "passe123"))
                    .dateCreation(LocalDateTime.now())
                    .build();


            membreUser = userRepository.save(membreUser);
        }

        membre.setUtilisateur(membreUser);

        // Génération automatique du code membre
        String codeMembre;
        do {
            codeMembre = "MEM" + generateAlphaNumericCode(6);
        } while (membreRepository.existsByCode(codeMembre));
        membre.setCode(codeMembre);

        // Génération automatique du pseudo
        String pseudoMembre;
        do {
            pseudoMembre = "MBR" + generateAlphaNumericCode(6);
        } while (membreRepository.existsByPseudo(pseudoMembre));
        membre.setPseudo(pseudoMembre);

        Membre savedMembre = membreRepository.save(membre);

        return adminMapper.membreToDto(savedMembre);
    }

    @Transactional
    public MembreDto modifierMembre(Long id, MembreDto dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Utilisateur authentifié introuvable"));

        // Vérifier le privilège ADMIN
        if (!"ADMIN".equalsIgnoreCase(currentUser.getProfil())) {
            throw new RuntimeException("Seuls les administrateurs peuvent modifier des membres");
        }

        Membre existingMembre = membreRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Membre non trouvé avec ID: " + id));

        // Mettre à jour l'association si fournie
        if (dto.getAssociationCode() != null && !dto.getAssociationCode().isBlank()) {
            Association association = associationRepository.findByCodeAssociation(dto.getAssociationCode())
                    .orElseThrow(() -> new RuntimeException("Association non trouvée avec code: " + dto.getAssociationCode()));
            existingMembre.setAssociation(association);
        }

        // Mettre à jour l'utilisateur associé si fourni
        if (dto.getUtilisateurId() != null) {
            User user = userRepository.findById(dto.getUtilisateurId())
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec ID: : " + dto.getUtilisateurId()));
            existingMembre.setUtilisateur(user);
        }

        Membre updatedMembre = membreRepository.save(existingMembre);
        return adminMapper.membreToDto(updatedMembre);
    }

    @Transactional
    public void supprimerMembre(Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Utilisateur authentifié introuvable"));

        // Vérifier le privilège ADMIN
        if (!"ADMIN".equalsIgnoreCase(currentUser.getProfil())) {
            throw new RuntimeException("Seuls les administrateurs peuvent supprimer des membres");
        }

        Membre membre = membreRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Membre non trouvé avec ID: " + id));

        User user = membre.getUtilisateur();

        // Supprimer le membre
        membreRepository.delete(membre);

        // Supprimer l'utilisateur associé s'il n'est pas utilisé ailleurs
        if (user != null) {
            // Vérifier si l'utilisateur est référencé ailleurs
            boolean isReferencedElsewhere = membreRepository.existsByUtilisateur(user);
            if (!isReferencedElsewhere) {
                userRepository.delete(user);
            }
        }
    }

    public MembreDto getMembreById(Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur authentifié introuvable"));

        if (!"ADMIN".equalsIgnoreCase(currentUser.getProfil())) {
            throw new RuntimeException("Seuls les administrateurs peuvent consulter les détails d'un membre");
        }

        Membre membre = membreRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Membre non trouvé avec ID: " + id));

        return adminMapper.membreToDto(membre);
    }

    public boolean existsByCode(String code) {
        return membreRepository.existsByCode(code);
    }

    public boolean existsByPseudo(String pseudo) {
        return membreRepository.existsByPseudo(pseudo);
    }

    public long countMembres() {
        return membreRepository.count();
    }

    // Méthode pour trouver les membres par association
    public List<MembreDto> getMembresByAssociation(String associationCode) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur authentifié introuvable"));

        if (!"ADMIN".equalsIgnoreCase(currentUser.getProfil())) {
            throw new RuntimeException("Seuls les administrateurs peuvent consulter cette liste");
        }

        return membreRepository.findByAssociationCodeAssociation(associationCode).stream()
                .map(adminMapper::membreToDto)
                .collect(Collectors.toList());
    }

    // Méthode pour trouver les membres par utilisateur
    public List<MembreDto> getMembresByUtilisateur(Long utilisateurId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur authentifié introuvable"));

        if (!"ADMIN".equalsIgnoreCase(currentUser.getProfil())) {
            throw new RuntimeException("Seuls les administrateurs peuvent consulter cette liste");
        }

        return membreRepository.findByUtilisateurId(utilisateurId).stream()
                .map(adminMapper::membreToDto)
                .collect(Collectors.toList());
    }
}