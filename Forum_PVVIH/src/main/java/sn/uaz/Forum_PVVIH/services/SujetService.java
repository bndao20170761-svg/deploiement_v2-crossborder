// SujetService.java
package sn.uaz.Forum_PVVIH.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import sn.uaz.Forum_PVVIH.dtos.SujetCreationDto;
import sn.uaz.Forum_PVVIH.dtos.SujetResponseDto;
import sn.uaz.Forum_PVVIH.dtos.SectionDto;
import sn.uaz.Forum_PVVIH.entities.*;
import sn.uaz.Forum_PVVIH.repositories.CommentaireRepository;
import sn.uaz.Forum_PVVIH.repositories.SujetRepository;
import sn.uaz.Forum_PVVIH.repositories.SectionRepository;
import sn.uaz.Forum_PVVIH.repositories.UserRepository;
import sn.uaz.Forum_PVVIH.clients.UserServiceClient;
import sn.uaz.Forum_PVVIH.security.JwtAuthTokenFilter;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SujetService {

    private final SujetRepository sujetRepository;
    private final SectionRepository sectionRepository;
    private final UserRepository userRepository;
    private final UserServiceClient userServiceClient;
private  final CommentaireRepository commentaireRepository;

    public List<SujetResponseDto> getAllSujets(int page, int size) {
        try {
            log.info("🔍 getAllSujets appelé avec page={}, size={}", page, size);
            
            Pageable pageable = PageRequest.of(page, size, Sort.by("dateCreation").descending());
            Page<Sujet> sujetsPage = sujetRepository.findAll(pageable);
            
            log.info("📊 Nombre total de sujets trouvés: {}", sujetsPage.getTotalElements());
            log.info("📄 Nombre de sujets dans la page: {}", sujetsPage.getContent().size());

            List<SujetResponseDto> result = sujetsPage.getContent().stream()
                    .map(this::convertToDtoPublic)
                    .collect(Collectors.toList());
            
            log.info("✅ Conversion terminée, {} DTOs créés", result.size());
            return result;
        } catch (Exception e) {
            log.error("❌ Erreur dans getAllSujets: {}", e.getMessage(), e);
            throw e;
        }
    }

    public SujetResponseDto getSujetById(String id) {
        Sujet sujet = sujetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sujet non trouvé avec l'id: " + id));

        // Incrémenter le nombre de vues
        sujet.setNombreVus(sujet.getNombreVus() + 1);
        sujetRepository.save(sujet);

        return convertToDto(sujet);
    }

    // Nouvelle méthode pour lire un sujet (publique, sans authentification)
    public SujetResponseDto lireSujet(String id) {
        log.info("📖 Lecture du sujet: {}", id);
        
        Sujet sujet = sujetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sujet non trouvé avec l'id: " + id));

        // Si le statut est false, l'activer (passer à true)
        if (!sujet.getStatut()) {
            log.info("🔄 Activation du sujet: {} (statut false -> true)", id);
            sujet.setStatut(true);
            sujet.setDateModification(LocalDateTime.now());
        }

        // Incrémenter le nombre de vues
        int ancienNombreVus = sujet.getNombreVus();
        sujet.setNombreVus(ancienNombreVus + 1);
        sujet.setDateModification(LocalDateTime.now());
        
        Sujet sujetMisAJour = sujetRepository.save(sujet);
        
        // Activer automatiquement tous les commentaires désactivés de ce sujet
        activerCommentairesDesactifs(sujet.getId());
        
        log.info("✅ Sujet lu: {} - Vues: {} -> {}", id, ancienNombreVus, sujetMisAJour.getNombreVus());
        
        return convertToDtoPublic(sujetMisAJour);
    }

    // Méthode privée pour activer tous les commentaires désactivés d'un sujet
    private void activerCommentairesDesactifs(String sujetId) {
        try {
            // Récupérer tous les commentaires désactivés de ce sujet
            List<Commentaire> commentairesDesactifs = commentaireRepository.findAll().stream()
                    .filter(commentaire -> 
                        "DESACTIF".equals(commentaire.getStatut()) &&
                        commentaire.getSujet().getId().equals(sujetId)
                    )
                    .collect(Collectors.toList());

            if (!commentairesDesactifs.isEmpty()) {
                // Activer tous les commentaires désactivés
                for (Commentaire commentaire : commentairesDesactifs) {
                    commentaire.setStatut("ACTIF");
                    commentaire.setDateModification(LocalDateTime.now());
                }
                commentaireRepository.saveAll(commentairesDesactifs);

                // Mettre à jour le compteur de commentaires désactivés du sujet
                Sujet sujet = sujetRepository.findById(sujetId).orElse(null);
                if (sujet != null) {
                    sujet.setNombreCommentairesDesactif(0);
                    sujet.setDateModification(LocalDateTime.now());
                    sujetRepository.save(sujet);
                }

                log.info("✅ {} commentaires désactivés activés pour le sujet: {}", 
                        commentairesDesactifs.size(), sujetId);
            }
        } catch (Exception e) {
            log.error("❌ Erreur lors de l'activation des commentaires désactivés: {}", e.getMessage());
        }
    }

    public SujetResponseDto createSujet(SujetCreationDto sujetDto) {
        try {
            // Récupérer l'utilisateur connecté depuis le contexte de sécurité
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            
            // Récupérer le token JWT pour l'appel au microservice gestion_user
            String jwtToken = JwtAuthTokenFilter.CURRENT_TOKEN.get();
            if (jwtToken == null) {
                throw new RuntimeException("Token JWT non disponible");
            }
            
            // Appeler le microservice gestion_user pour récupérer les informations de l'utilisateur
            UserServiceClient.UserInfoResponse userInfo = userServiceClient.getUserByUsername(username, jwtToken);
            
            // Créer un objet UserInfo avec les informations du microservice
            UserInfo auteur = UserInfo.builder()
                    .id(userInfo.getId().toString())
                    .username(userInfo.getUsername())
                    .email(userInfo.getEmail())
                    .nom(userInfo.getNom())
                    .prenom(userInfo.getPrenom())
                    .profil("USER") // Valeur par défaut
                    .build();

        // Récupérer la section
        Section section = sectionRepository.findById(sujetDto.getSectionId())
                .orElseThrow(() -> new RuntimeException("Section non trouvée avec l'id: " + sujetDto.getSectionId()));

        // Déterminer la langue
        String langueFinale = determinerLangue(sujetDto, auteur);

        // Créer le sujet avec les informations complètes de l'auteur
        Sujet nouveauSujet = Sujet.builder()
                .titreOriginal(sujetDto.getTitre())
                .contenuOriginal(sujetDto.getContenu())
                .langueOriginale(langueFinale)
                .auteur(auteur) // L'auteur contient déjà toutes les informations
                .section(section)
                .type(sujetDto.getType() != null ? sujetDto.getType() : "DISCUSSION")
                .statut(false) // Initialiser à false (inactif)
                .nombreVus(0)
                .nombreCommentaires(0)
                .traductionAuto(true)
                .qualiteTraduction("BONNE")
                .dateCreation(LocalDateTime.now())
                .dateModification(LocalDateTime.now())
                .build();

            Sujet sujetSauvegarde = sujetRepository.save(nouveauSujet);
            return convertToDto(sujetSauvegarde);
        } finally {
            // Nettoyer le token du ThreadLocal après utilisation
            JwtAuthTokenFilter.CURRENT_TOKEN.remove();
        }
    }

    public SujetResponseDto updateSujet(String id, SujetCreationDto sujetDto) {
        try {
            // Récupérer l'utilisateur connecté
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            
            // Récupérer le token JWT pour l'appel au microservice gestion_user
            String jwtToken = JwtAuthTokenFilter.CURRENT_TOKEN.get();
            if (jwtToken == null) {
                throw new RuntimeException("Token JWT non disponible");
            }
            
            // Appeler le microservice gestion_user pour récupérer les informations de l'utilisateur
            UserServiceClient.UserInfoResponse userInfo = userServiceClient.getUserByUsername(username, jwtToken);

            // Récupérer le sujet existant
            Sujet sujetExistant = sujetRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Sujet non trouvé avec l'id: " + id));

            // Vérifier que l'utilisateur est l'auteur du sujet (comparer par username)
            User auteurResolu = resolveAuteurForPublic(sujetExistant.getAuteur());
            if (auteurResolu == null || !auteurResolu.getUsername().equals(username)) {
                throw new RuntimeException("Vous n'êtes pas autorisé à modifier ce sujet");
            }

            // Récupérer la section si elle change
            Section section = sujetExistant.getSection();
            if (sujetDto.getSectionId() != null && !sujetDto.getSectionId().equals(section.getId())) {
                section = sectionRepository.findById(sujetDto.getSectionId())
                        .orElseThrow(() -> new RuntimeException("Section non trouvée"));
            }

            // Mettre à jour le sujet
            sujetExistant.setTitreOriginal(sujetDto.getTitre());
            sujetExistant.setContenuOriginal(sujetDto.getContenu());
            sujetExistant.setSection(section);
            sujetExistant.setType(sujetDto.getType() != null ? sujetDto.getType() : sujetExistant.getType());
            sujetExistant.setDateModification(LocalDateTime.now());

            Sujet sujetMisAJour = sujetRepository.save(sujetExistant);
            return convertToDto(sujetMisAJour);
        } finally {
            // Nettoyer le token du ThreadLocal après utilisation
            JwtAuthTokenFilter.CURRENT_TOKEN.remove();
        }
    }

    public void deleteSujet(String id) {
        try {
            // Récupérer l'utilisateur connecté
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            
            // Récupérer le token JWT pour l'appel au microservice gestion_user
            String jwtToken = JwtAuthTokenFilter.CURRENT_TOKEN.get();
            if (jwtToken == null) {
                throw new RuntimeException("Token JWT non disponible");
            }
            
            // Appeler le microservice gestion_user pour récupérer les informations de l'utilisateur
            UserServiceClient.UserInfoResponse userInfo = userServiceClient.getUserByUsername(username, jwtToken);

            // Récupérer le sujet
            Sujet sujet = sujetRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Sujet non trouvé avec l'id: " + id));

            // Vérifier que l'utilisateur est l'auteur du sujet (comparer par username)
            User auteurResolu = resolveAuteurForPublic(sujet.getAuteur());
            if (auteurResolu == null || !auteurResolu.getUsername().equals(username)) {
                throw new RuntimeException("Vous n'êtes pas autorisé à supprimer ce sujet");
            }

            sujetRepository.delete(sujet);
        } finally {
            // Nettoyer le token du ThreadLocal après utilisation
            JwtAuthTokenFilter.CURRENT_TOKEN.remove();
        }
    }

    // Nouvelle méthode pour modifier un sujet par ID utilisateur
    public SujetResponseDto updateSujetByUserId(Long userId, SujetCreationDto sujetDto) {
        try {
            // Récupérer le token JWT pour l'appel au microservice gestion_user
            String jwtToken = JwtAuthTokenFilter.CURRENT_TOKEN.get();
            if (jwtToken == null) {
                throw new RuntimeException("Token JWT non disponible");
            }
            
            // Appeler le microservice gestion_user pour récupérer les informations de l'utilisateur
            UserServiceClient.UserInfoResponse userInfo = userServiceClient.getUserById(userId, jwtToken);
            
            // Créer un objet UserInfo avec les informations du microservice
            UserInfo auteur = UserInfo.builder()
                    .id(userInfo.getId().toString())
                    .username(userInfo.getUsername())
                    .email(userInfo.getEmail())
                    .nom(userInfo.getNom())
                    .prenom(userInfo.getPrenom())
                    .profil("USER")
                    .build();

            // Trouver le sujet de cet utilisateur (le plus récent ou le seul)
            // Note: Comme auteur est maintenant Object, on doit chercher différemment
            List<Sujet> sujetsUtilisateur = sujetRepository.findAll().stream()
                    .filter(sujet -> {
                        User auteurSujet = resolveAuteurForPublic(sujet.getAuteur());
                        return auteurSujet != null && auteurSujet.getId().equals(auteur.getId());
                    })
                    .collect(Collectors.toList());
            
            if (sujetsUtilisateur.isEmpty()) {
                throw new RuntimeException("Aucun sujet trouvé pour l'utilisateur avec l'ID: " + userId);
            }
            
            // Prendre le sujet le plus récent
            Sujet sujetAModifier = sujetsUtilisateur.stream()
                    .max(Comparator.comparing(Sujet::getDateCreation))
                    .orElseThrow(() -> new RuntimeException("Aucun sujet trouvé pour l'utilisateur"));

            // Récupérer la section si elle change
            Section section = sujetAModifier.getSection();
            if (sujetDto.getSectionId() != null && !sujetDto.getSectionId().equals(section.getId())) {
                section = sectionRepository.findById(sujetDto.getSectionId())
                        .orElseThrow(() -> new RuntimeException("Section non trouvée"));
            }

            // Mettre à jour le sujet
            sujetAModifier.setTitreOriginal(sujetDto.getTitre());
            sujetAModifier.setContenuOriginal(sujetDto.getContenu());
            sujetAModifier.setSection(section);
            sujetAModifier.setType(sujetDto.getType() != null ? sujetDto.getType() : sujetAModifier.getType());
            sujetAModifier.setDateModification(LocalDateTime.now());

            Sujet sujetMisAJour = sujetRepository.save(sujetAModifier);
            return convertToDto(sujetMisAJour);
        } finally {
            // Nettoyer le token du ThreadLocal après utilisation
            JwtAuthTokenFilter.CURRENT_TOKEN.remove();
        }
    }

    // Méthodes supplémentaires utiles
    public List<SujetResponseDto> getSujetsBySection(String sectionId) {
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new RuntimeException("Section non trouvée"));

        return sujetRepository.findBySection(section).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<SujetResponseDto> getSujetsByAuteur(String auteurId) {
        try {
            // Récupérer le token JWT pour l'appel au microservice gestion_user
            String jwtToken = JwtAuthTokenFilter.CURRENT_TOKEN.get();
            if (jwtToken == null) {
                throw new RuntimeException("Token JWT non disponible");
            }
            
            // Appeler le microservice gestion_user pour récupérer les informations de l'utilisateur
            // Le paramètre auteurId peut être soit un ID soit un username
            UserServiceClient.UserInfoResponse userInfo;
            
            // Vérifier si auteurId est un nombre (ID) ou une chaîne (username)
            if (auteurId.matches("\\d+")) {
                // C'est un ID numérique
                Long userId = Long.parseLong(auteurId);
                userInfo = userServiceClient.getUserById(userId, jwtToken);
            } else {
                // C'est un username
                userInfo = userServiceClient.getUserByUsername(auteurId, jwtToken);
            }
            
            // Créer un objet UserInfo avec les informations du microservice
            UserInfo auteur = UserInfo.builder()
                    .id(userInfo.getId().toString())
                    .username(userInfo.getUsername())
                    .email(userInfo.getEmail())
                    .nom(userInfo.getNom())
                    .prenom(userInfo.getPrenom())
                    .profil("USER")
                    .build();

            // Chercher les sujets par auteur (utiliser l'ID car c'est ce qui est stocké dans MongoDB)
            // Note: Comme auteur est maintenant Object, on doit chercher différemment
            return sujetRepository.findAll().stream()
                    .filter(sujet -> {
                        User auteurSujet = resolveAuteurForPublic(sujet.getAuteur());
                        return auteurSujet != null && auteurSujet.getId().equals(auteur.getId());
                    })
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
        } finally {
            // Nettoyer le token du ThreadLocal après utilisation
            JwtAuthTokenFilter.CURRENT_TOKEN.remove();
        }
    }

    public List<SujetResponseDto> getSujetsRecents(int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by("dateCreation").descending());
        Page<Sujet> sujetsPage = sujetRepository.findAll(pageable);

        return sujetsPage.getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // Récupérer toutes les sections pour l'autocomplétion
    public List<SectionDto> getAllSections() {
        return sectionRepository.findAllByOrderByOrdreAsc()
                .stream()
                .map(this::convertSectionToDto)
                .collect(Collectors.toList());
    }
    
    // Méthodes pour gérer le statut des sujets
    public SujetResponseDto activerSujet(String id) {
        Sujet sujet = sujetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sujet non trouvé avec l'id: " + id));
        
        sujet.setStatut(true);
        sujet.setDateModification(LocalDateTime.now());
        Sujet sujetMisAJour = sujetRepository.save(sujet);
        
        return convertToDto(sujetMisAJour);
    }
    
    public SujetResponseDto desactiverSujet(String id) {
        Sujet sujet = sujetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sujet non trouvé avec l'id: " + id));
        
        sujet.setStatut(false);
        sujet.setDateModification(LocalDateTime.now());
        Sujet sujetMisAJour = sujetRepository.save(sujet);
        
        return convertToDto(sujetMisAJour);
    }
    
    public List<SujetResponseDto> getSujetsActifs(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("dateCreation").descending());
        List<Sujet> sujetsActifs = sujetRepository.findByStatut(true);
        
        return sujetsActifs.stream()
                .map(this::convertToDtoPublic)
                .collect(Collectors.toList());
    }
    
    public List<SujetResponseDto> getSujetsInactifs(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("dateCreation").descending());
        List<Sujet> sujetsInactifs = sujetRepository.findByStatut(false);
        
        return sujetsInactifs.stream()
                .map(this::convertToDtoPublic)
                .collect(Collectors.toList());
    }

    // Méthode privée pour déterminer la langue
    private String determinerLangue(SujetCreationDto sujetDto, UserInfo auteur) {
        // 1. Priorité à la langue explicitement choisie
        if (sujetDto.getLangue() != null && !sujetDto.getLangue().trim().isEmpty()) {
            return sujetDto.getLangue();
        }

        // 2. Sinon utiliser la préférence utilisateur (pas disponible dans UserInfo, utiliser fr par défaut)
        // Note: UserInfo ne contient pas languePreferee, on utilise fr par défaut

        // 3. Fallback vers le français
        return "fr";
    }

    // Conversion Entity → DTO (version publique, sans authentification)
    private SujetResponseDto convertToDtoPublic(Sujet sujet) {
        try {
            log.debug("🔄 Conversion du sujet: {}", sujet.getId());
            
            // Gérer l'auteur selon son type (UserInfo, DBRef, ou User)
            User auteurPublic = resolveAuteurForPublic(sujet.getAuteur());
            log.debug("👤 Auteur converti: {}", auteurPublic != null ? auteurPublic.getNom() : "null");
            
            SujetResponseDto dto = SujetResponseDto.builder()
                    .id(sujet.getId())
                    .titreOriginal(sujet.getTitreOriginal())
                    .contenuOriginal(sujet.getContenuOriginal())
                    .langueOriginale(sujet.getLangueOriginale())
                    .auteur(auteurPublic)
                    .section(sujet.getSection())
                    .type(sujet.getType())
                    .statut(sujet.getStatut()) // Utilise la méthode getStatut() qui gère la conversion
                    .nombreVus(sujet.getNombreVus())
                    .nombreCommentaires(sujet.getNombreCommentaires())
                    .dateCreation(sujet.getDateCreation())
                    .dateModification(sujet.getDateModification())
                    .build();
            
            log.debug("✅ DTO créé avec succès pour le sujet: {}", sujet.getId());
            return dto;
        } catch (Exception e) {
            log.error("❌ Erreur lors de la conversion du sujet {}: {}", sujet.getId(), e.getMessage(), e);
            throw e;
        }
    }
    
    // Méthode pour résoudre l'auteur pour l'affichage public
    private User resolveAuteurForPublic(Object auteur) {
        if (auteur == null) {
            return null;
        }
        
        // Si c'est déjà un UserInfo, le convertir
        if (auteur instanceof UserInfo) {
            return convertUserInfoToUser((UserInfo) auteur);
        }
        
        // Si c'est déjà un User, le retourner
        if (auteur instanceof User) {
            return (User) auteur;
        }
        
        // Si c'est une LinkedHashMap (données MongoDB), extraire les informations
        if (auteur instanceof java.util.Map) {
            @SuppressWarnings("unchecked")
            java.util.Map<String, Object> auteurMap = (java.util.Map<String, Object>) auteur;
            
            User user = new User();
            user.setId(String.valueOf(auteurMap.getOrDefault("id", "unknown")));
            user.setUsername(String.valueOf(auteurMap.getOrDefault("username", "Utilisateur")));
            user.setNom(String.valueOf(auteurMap.getOrDefault("nom", "Inconnu")));
            user.setPrenom(String.valueOf(auteurMap.getOrDefault("prenom", "Utilisateur")));
            user.setEmail(String.valueOf(auteurMap.getOrDefault("email", "")));
            user.setProfil(String.valueOf(auteurMap.getOrDefault("profil", "USER")));
            
            log.debug("✅ Auteur LinkedHashMap converti: {} {}", user.getPrenom(), user.getNom());
            return user;
        }
        
        // Si c'est une DBRef ou autre, créer un utilisateur minimal
        log.warn("⚠️ Auteur de type inattendu: {}, création d'un utilisateur minimal", auteur.getClass().getSimpleName());
        
        User userMinimal = new User();
        userMinimal.setId("unknown");
        userMinimal.setUsername("Utilisateur");
        userMinimal.setNom("Inconnu");
        userMinimal.setPrenom("Utilisateur");
        return userMinimal;
    }
    
    // Méthode pour convertir UserInfo en User
    private User convertUserInfoToUser(UserInfo userInfo) {
        if (userInfo == null) {
            return null;
        }
        
        User user = new User();
        user.setId(userInfo.getId());
        user.setUsername(userInfo.getUsername());
        user.setEmail(userInfo.getEmail());
        user.setNom(userInfo.getNom());
        user.setPrenom(userInfo.getPrenom());
        user.setProfil(userInfo.getProfil());
        return user;
    }

    // Conversion Entity → DTO (version authentifiée, avec résolution des DBRef)
    private SujetResponseDto convertToDto(Sujet sujet) {
        // Gérer l'auteur selon son type (UserInfo, DBRef, ou User)
        User auteurResolu = resolveAuteurForPublic(sujet.getAuteur());
        
        // Résoudre la section si c'est une DBRef
        Section sectionResolue = resolveSection(sujet.getSection());
        
        return SujetResponseDto.builder()
                .id(sujet.getId())
                .titreOriginal(sujet.getTitreOriginal())
                .contenuOriginal(sujet.getContenuOriginal())
                .langueOriginale(sujet.getLangueOriginale())
                .auteur(auteurResolu)
                .section(sectionResolue)
                .type(sujet.getType())
                .statut(sujet.getStatut()) // Utilise la méthode getStatut() qui gère la conversion
                .nombreVus(sujet.getNombreVus())
                .nombreCommentaires(sujet.getNombreCommentaires())
                .dateCreation(sujet.getDateCreation())
                .dateModification(sujet.getDateModification())
                .build();
    }
    
    // Méthode pour résoudre l'utilisateur depuis une DBRef
    private User resolveUser(User auteur) {
        if (auteur == null) {
            return null;
        }
        
        // Si l'auteur a déjà des données complètes, le retourner tel quel
        if (auteur.getNom() != null && auteur.getPrenom() != null) {
            return auteur;
        }
        
        // Sinon, essayer de récupérer les données depuis gestion_user
        try {
            String jwtToken = JwtAuthTokenFilter.CURRENT_TOKEN.get();
            if (jwtToken != null && auteur.getId() != null) {
                // Essayer d'abord par ID
                if (auteur.getId().matches("\\d+")) {
                    Long userId = Long.parseLong(auteur.getId());
                    UserServiceClient.UserInfoResponse userInfo = userServiceClient.getUserById(userId, jwtToken);
                    
                    User userResolu = new User();
                    userResolu.setId(userInfo.getId().toString());
                    userResolu.setUsername(userInfo.getUsername());
                    userResolu.setEmail(userInfo.getEmail());
                    userResolu.setNom(userInfo.getNom());
                    userResolu.setPrenom(userInfo.getPrenom());
                    return userResolu;
                } else {
                    // Essayer par username
                    UserServiceClient.UserInfoResponse userInfo = userServiceClient.getUserByUsername(auteur.getUsername(), jwtToken);
                    
                    User userResolu = new User();
                    userResolu.setId(userInfo.getId().toString());
                    userResolu.setUsername(userInfo.getUsername());
                    userResolu.setEmail(userInfo.getEmail());
                    userResolu.setNom(userInfo.getNom());
                    userResolu.setPrenom(userInfo.getPrenom());
                    return userResolu;
                }
            }
        } catch (Exception e) {
            log.warn("Impossible de résoudre l'utilisateur {}: {}", auteur.getId(), e.getMessage());
        }
        
        // Fallback : retourner l'auteur tel quel
        return auteur;
    }
    
    // Méthode pour résoudre la section depuis une DBRef
    private Section resolveSection(Section section) {
        if (section == null) {
            return null;
        }
        
        // Si la section a déjà des données complètes, la retourner telle quelle
        if (section.getNomFr() != null || section.getNomEn() != null) {
            return section;
        }
        
        // Sinon, essayer de récupérer depuis la base de données
        try {
            if (section.getId() != null) {
                return sectionRepository.findById(section.getId()).orElse(section);
            }
        } catch (Exception e) {
            log.warn("Impossible de résoudre la section {}: {}", section.getId(), e.getMessage());
        }
        
        // Fallback : retourner la section telle quelle
        return section;
    }
    
    // Conversion Section Entity → SectionDto
    private SectionDto convertSectionToDto(Section section) {
        return SectionDto.builder()
                .id(section.getId())
                .code(section.getCode())
                .nomFr(section.getNomFr())
                .nomEn(section.getNomEn())
                .nomPt(section.getNomPt())
                .descriptionFr(section.getDescriptionFr())
                .descriptionEn(section.getDescriptionEn())
                .descriptionPt(section.getDescriptionPt())
                .icone(section.getIcone())
                .ordre(section.getOrdre())
                .dateCreation(section.getDateCreation())
                .build();
    }
}