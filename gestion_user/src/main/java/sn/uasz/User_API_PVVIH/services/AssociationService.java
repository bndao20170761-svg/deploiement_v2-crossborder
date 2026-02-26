package sn.uasz.User_API_PVVIH.services;

import jakarta.transaction.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import sn.uasz.User_API_PVVIH.dtos.AssociationDto;
import sn.uasz.User_API_PVVIH.entities.Association;
import sn.uasz.User_API_PVVIH.entities.User;
import sn.uasz.User_API_PVVIH.mappers.AdminMapper;
import sn.uasz.User_API_PVVIH.repositories.AssociationRepository;
import sn.uasz.User_API_PVVIH.repositories.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class AssociationService {

    private final AssociationRepository associationRepository;
    private final AdminMapper adminMapper;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AssociationService(AssociationRepository associationRepository, 
                             AdminMapper adminMapper,
                             UserRepository userRepository, 
                             PasswordEncoder passwordEncoder) {
        this.associationRepository = associationRepository;
        this.adminMapper = adminMapper;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<AssociationDto> getAllAssociations() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        // Vérifier si l'utilisateur est ADMIN
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur authentifié introuvable"));

        if (!"ADMIN".equalsIgnoreCase(currentUser.getProfil())) {
            throw new RuntimeException("Seuls les administrateurs peuvent consulter la liste des associations");
        }

        return associationRepository.findAll().stream()
                .map(adminMapper::associationToDto)
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
    public AssociationDto creerAssociation(AssociationDto dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Utilisateur authentifié introuvable"));

        // Vérifier le privilège ADMIN
        if (!"ADMIN".equalsIgnoreCase(currentUser.getProfil())) {
            throw new RuntimeException("Seuls les administrateurs peuvent créer des associations");
        }

        // Vérifier que le codeAssociation est fourni
        if (dto.getCodeAssociation() == null || dto.getCodeAssociation().isBlank()) {
            throw new RuntimeException("Le code association est obligatoire");
        }

        // Vérifier si le codeAssociation existe déjà
        if (associationRepository.existsByCodeAssociation(dto.getCodeAssociation())) {
            throw new RuntimeException("Une association avec ce code existe déjà: " + dto.getCodeAssociation());
        }

        Association association = adminMapper.dtoToAssociation(dto);

        // Gestion de l'utilisateur - recherche par email
        if (dto.getEmailUser() == null || dto.getEmailUser().isBlank()) {
            throw new RuntimeException("L'email est obligatoire pour créer une association");
        }

        // Rechercher l'utilisateur par email (username)
        Optional<User> existingUser = userRepository.findByUsername(dto.getEmailUser());
        User associationUser;

        if (existingUser.isPresent()) {
            // Utilisateur existe déjà, on l'utilise
            associationUser = existingUser.get();
            
            // Vérifier que l'utilisateur n'est pas déjà associé à une autre association
            if (associationRepository.existsByUtilisateur(associationUser)) {
                throw new RuntimeException("Cet utilisateur est déjà associé à une autre association");
            }
        } else {
            // Créer un nouvel utilisateur
            associationUser = User.builder()
                    .username(dto.getEmail())
                    .nom("Association") // Valeur par défaut
                    .prenom(dto.getPseudo()) // Utiliser le pseudo comme prénom
                    .profil("ASSOCIATION")
                    .active(true)
                    .password(passwordEncoder.encode("password123")) // Mot de passe par défaut
                    .dateCreation(LocalDateTime.now())
                    .build();

            associationUser = userRepository.save(associationUser);
        }

        association.setUtilisateur(associationUser);

        // Utiliser le codeAssociation fourni dans le DTO
        association.setCodeAssociation(dto.getCodeAssociation());

        // Génération pseudo unique si non fourni
        if (association.getPseudo() == null || association.getPseudo().isBlank()) {
            String pseudo;
            do {
                pseudo = "ASSO" + generateAlphaNumericCode(4);
            } while (associationRepository.existsByPseudo(pseudo));
            association.setPseudo(pseudo);
        }

        Association savedAssociation = associationRepository.save(association);

        return adminMapper.associationToDto(savedAssociation);
    }

    @Transactional
    public AssociationDto modifierAssociation(String codeAssociation, AssociationDto dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Utilisateur authentifié introuvable"));

        // Vérifier le privilège ADMIN
        if (!"ADMIN".equalsIgnoreCase(currentUser.getProfil())) {
            throw new RuntimeException("Seuls les administrateurs peuvent modifier des associations");
        }

        Association existingAssociation = associationRepository.findByCodeAssociation(codeAssociation)
                .orElseThrow(() -> new RuntimeException("Association non trouvée avec code: " + codeAssociation));

        // Mettre à jour les champs de l'association
        existingAssociation.setEmail(dto.getEmail());
        existingAssociation.setPays(dto.getPays());
        existingAssociation.setPseudo(dto.getPseudo());
        existingAssociation.setQuartier(dto.getQuartier());
        existingAssociation.setTelephone(dto.getTelephone());
        existingAssociation.setVille(dto.getVille());

        // Mettre à jour l'utilisateur associé si l'email a changé
        if (!existingAssociation.getEmail().equals(dto.getEmail())) {
            Optional<User> newUser = userRepository.findByUsername(dto.getEmail());
            
            if (newUser.isPresent()) {
                // Vérifier que le nouvel utilisateur n'est pas déjà associé à une autre association
                if (associationRepository.existsByUtilisateurAndCodeAssociationNot(newUser.get(), codeAssociation)) {
                    throw new RuntimeException("Le nouvel utilisateur est déjà associé à une autre association");
                }
                existingAssociation.setUtilisateur(newUser.get());
            } else {
                // Créer un nouvel utilisateur
                User newAssociationUser = User.builder()
                        .username(dto.getEmail())
                        .nom("Association")
                        .prenom(dto.getPseudo())
                        .profil("ASSOCIATION")
                        .active(true)
                        .password(passwordEncoder.encode("password123"))
                        .dateCreation(LocalDateTime.now())
                        .build();
                
                User savedUser = userRepository.save(newAssociationUser);
                existingAssociation.setUtilisateur(savedUser);
            }
        }

        Association updatedAssociation = associationRepository.save(existingAssociation);
        return adminMapper.associationToDto(updatedAssociation);
    }

    @Transactional
    public void supprimerAssociation(String codeAssociation) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Utilisateur authentifié introuvable"));

        // Vérifier le privilège ADMIN
        if (!"ADMIN".equalsIgnoreCase(currentUser.getProfil())) {
            throw new RuntimeException("Seuls les administrateurs peuvent supprimer des associations");
        }

        Association association = associationRepository.findByCodeAssociation(codeAssociation)
                .orElseThrow(() -> new RuntimeException("Association non trouvée avec code: " + codeAssociation));

        User user = association.getUtilisateur();

        // Vérifier si l'association a des membres associés
        boolean hasMembers = associationRepository.countMembersByAssociation(codeAssociation) > 0;
        if (hasMembers) {
            throw new RuntimeException("Impossible de supprimer l'association : des membres y sont associés");
        }

        // Supprimer l'association
        associationRepository.delete(association);

        // Supprimer l'utilisateur associé s'il n'est pas utilisé ailleurs
        if (user != null) {
            // Vérifier si l'utilisateur est référencé ailleurs
            boolean isReferencedElsewhere = associationRepository.existsByUtilisateurAndCodeAssociationNot(user, codeAssociation);
            if (!isReferencedElsewhere) {
                userRepository.delete(user);
            }
        }
    }

    public AssociationDto getAssociationByCode(String codeAssociation) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur authentifié introuvable"));

        if (!"ADMIN".equalsIgnoreCase(currentUser.getProfil())) {
            throw new RuntimeException("Seuls les administrateurs peuvent consulter les détails d'une association");
        }

        Association association = associationRepository.findByCodeAssociation(codeAssociation)
                .orElseThrow(() -> new RuntimeException("Association non trouvée avec code: " + codeAssociation));

        return adminMapper.associationToDto(association);
    }

    public boolean existsByCodeAssociation(String codeAssociation) {
        return associationRepository.existsByCodeAssociation(codeAssociation);
    }

    public long countAssociations() {
        return associationRepository.count();
    }

    // Méthode pour trouver les associations par ville
    public List<AssociationDto> getAssociationsByCity(String ville) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur authentifié introuvable"));

        if (!"ADMIN".equalsIgnoreCase(currentUser.getProfil())) {
            throw new RuntimeException("Seuls les administrateurs peuvent consulter cette liste");
        }

        return associationRepository.findByVille(ville).stream()
                .map(adminMapper::associationToDto)
                .collect(Collectors.toList());
    }

    // Méthode pour trouver les associations par pays
    public List<AssociationDto> getAssociationsByCountry(String pays) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur authentifié introuvable"));

        if (!"ADMIN".equalsIgnoreCase(currentUser.getProfil())) {
            throw new RuntimeException("Seuls les administrateurs peuvent consulter cette liste");
        }

        return associationRepository.findByPays(pays).stream()
                .map(adminMapper::associationToDto)
                .collect(Collectors.toList());
    }
}