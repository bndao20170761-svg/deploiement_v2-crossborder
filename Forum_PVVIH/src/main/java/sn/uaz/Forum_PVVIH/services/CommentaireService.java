package sn.uaz.Forum_PVVIH.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import sn.uaz.Forum_PVVIH.dtos.CommentaireCreationDto;
import sn.uaz.Forum_PVVIH.dtos.CommentaireResponseDto;
import sn.uaz.Forum_PVVIH.dtos.SujetInfo;
import sn.uaz.Forum_PVVIH.entities.Commentaire;
import sn.uaz.Forum_PVVIH.entities.Sujet;
import sn.uaz.Forum_PVVIH.entities.User;
import sn.uaz.Forum_PVVIH.entities.UserInfo;
import sn.uaz.Forum_PVVIH.repositories.CommentaireRepository;
import sn.uaz.Forum_PVVIH.repositories.SujetRepository;
import sn.uaz.Forum_PVVIH.clients.UserServiceClient;
import sn.uaz.Forum_PVVIH.security.JwtAuthTokenFilter;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CommentaireService {

    private final CommentaireRepository commentaireRepository;
    private final SujetRepository sujetRepository;
    private final UserServiceClient userServiceClient;

    // Créer un nouveau commentaire
    public CommentaireResponseDto createCommentaire(String sujetId, CommentaireCreationDto commentaireDto) {
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
            
            // Créer un objet UserInfo avec les informations du microservice
            UserInfo auteur = UserInfo.builder()
                    .id(userInfo.getId().toString())
                    .username(userInfo.getUsername())
                    .email(userInfo.getEmail())
                    .nom(userInfo.getNom())
                    .prenom(userInfo.getPrenom())
                    .profil("USER")
                    .build();

            // Récupérer le sujet
            Sujet sujet = sujetRepository.findById(sujetId)
                    .orElseThrow(() -> new RuntimeException("Sujet non trouvé avec l'id: " + sujetId));

            // Créer le commentaire
            Commentaire nouveauCommentaire = Commentaire.builder()
                    .contenuOriginal(commentaireDto.getContenu())
                    .langueOriginale(commentaireDto.getLangue() != null ? commentaireDto.getLangue() : "fr")
                    .sujet(sujet)
                    .auteur(auteur) // Stocker UserInfo directement
                    .statut("DESACTIF")
                    .dateCreation(LocalDateTime.now())
                    .dateModification(LocalDateTime.now())
                    .build();

            // Si c'est une réponse à un commentaire parent
            if (commentaireDto.getParentId() != null && !commentaireDto.getParentId().isEmpty()) {
                Commentaire parent = commentaireRepository.findById(commentaireDto.getParentId())
                        .orElseThrow(() -> new RuntimeException("Commentaire parent non trouvé"));
                nouveauCommentaire.setParent(parent);
            }

            // Sauvegarder le commentaire
            Commentaire commentaireSauvegarde = commentaireRepository.save(nouveauCommentaire);

            // Incrémenter le nombre de commentaires du sujet
            sujet.setNombreCommentaires(sujet.getNombreCommentaires() + 1);
            
            // Incrémenter le nombre de commentaires désactivés (notifications)
            sujet.setNombreCommentairesDesactif(sujet.getNombreCommentairesDesactif() + 1);
            
            sujet.setDateModification(LocalDateTime.now());
            sujetRepository.save(sujet);

            log.info("✅ Commentaire créé: {} pour le sujet: {} par: {}", 
                    commentaireSauvegarde.getId(), sujetId, auteur.getUsername());

            return convertToDto(commentaireSauvegarde);
        } finally {
            // Nettoyer le token du ThreadLocal après utilisation
            JwtAuthTokenFilter.CURRENT_TOKEN.remove();
        }
    }

    // Récupérer les commentaires d'un sujet
    public List<CommentaireResponseDto> getCommentairesBySujet(String sujetId, int page, int size) {
        Sujet sujet = sujetRepository.findById(sujetId)
                .orElseThrow(() -> new RuntimeException("Sujet non trouvé avec l'id: " + sujetId));

        Pageable pageable = PageRequest.of(page, size, Sort.by("dateCreation").ascending());
        Page<Commentaire> commentairesPage = commentaireRepository.findBySujetOrderByDateCreationAsc(sujet, pageable);

        return commentairesPage.getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // Récupérer tous les commentaires d'un sujet (sans pagination)
    public List<CommentaireResponseDto> getAllCommentairesBySujet(String sujetId) {
        Sujet sujet = sujetRepository.findById(sujetId)
                .orElseThrow(() -> new RuntimeException("Sujet non trouvé avec l'id: " + sujetId));

        List<Commentaire> commentaires = commentaireRepository.findBySujetOrderByDateCreationAsc(sujet);

        return commentaires.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // Supprimer un commentaire
    public void deleteCommentaire(String commentaireId) {
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
            
            // Créer un objet UserInfo pour la comparaison
            UserInfo auteur = UserInfo.builder()
                    .id(userInfo.getId().toString())
                    .username(userInfo.getUsername())
                    .build();

            // Récupérer le commentaire
            Commentaire commentaire = commentaireRepository.findById(commentaireId)
                    .orElseThrow(() -> new RuntimeException("Commentaire non trouvé avec l'id: " + commentaireId));

            // Vérifier que l'utilisateur est l'auteur du commentaire
            if (commentaire.getAuteur() instanceof UserInfo) {
                UserInfo auteurCommentaire = (UserInfo) commentaire.getAuteur();
                if (!auteurCommentaire.getId().equals(auteur.getId())) {
                    throw new RuntimeException("Vous n'êtes pas autorisé à supprimer ce commentaire");
                }
            } else {
                throw new RuntimeException("Format d'auteur non supporté");
            }

            // Décrémenter le nombre de commentaires du sujet
            Sujet sujet = commentaire.getSujet();
            sujet.setNombreCommentaires(Math.max(0, sujet.getNombreCommentaires() - 1));
            sujet.setDateModification(LocalDateTime.now());
            sujetRepository.save(sujet);

            // Supprimer le commentaire
            commentaireRepository.delete(commentaire);

            log.info("✅ Commentaire supprimé: {} du sujet: {}", commentaireId, sujet.getId());
        } finally {
            // Nettoyer le token du ThreadLocal après utilisation
            JwtAuthTokenFilter.CURRENT_TOKEN.remove();
        }
    }

    // Récupérer les notifications (commentaires désactivés) pour un utilisateur
    public List<CommentaireResponseDto> getNotificationsByUser(String userId) {
        try {
            // Récupérer le token JWT pour l'appel au microservice gestion_user
            String jwtToken = JwtAuthTokenFilter.CURRENT_TOKEN.get();
            UserServiceClient.UserInfoResponse userInfo;
            
            if (jwtToken != null) {
                // Appeler le microservice gestion_user pour récupérer les informations de l'utilisateur
                userInfo = userServiceClient.getUserById(Long.parseLong(userId), jwtToken);
            } else {
                // Fallback : créer un utilisateur minimal pour les appels publics
                userInfo = new UserServiceClient.UserInfoResponse();
                userInfo.setId(Long.parseLong(userId));
                userInfo.setUsername("user" + userId);
                userInfo.setNom("Utilisateur");
                userInfo.setPrenom("Inconnu");
                userInfo.setEmail("user" + userId + "@example.com");
            }
            
            // Créer un objet UserInfo pour la comparaison
            UserInfo auteur = UserInfo.builder()
                    .id(userInfo.getId().toString())
                    .username(userInfo.getUsername())
                    .build();

            // Récupérer tous les sujets de cet utilisateur
            List<Sujet> sujetsUtilisateur = sujetRepository.findAll().stream()
                    .filter(sujet -> {
                        User auteurSujet = resolveAuteurForPublic(sujet.getAuteur());
                        return auteurSujet != null && auteurSujet.getId().equals(auteur.getId());
                    })
                    .collect(Collectors.toList());

            // Récupérer tous les commentaires désactivés de ces sujets
            List<Commentaire> commentairesDesactifs = commentaireRepository.findAll().stream()
                    .filter(commentaire -> 
                        "DESACTIF".equals(commentaire.getStatut()) &&
                        sujetsUtilisateur.contains(commentaire.getSujet())
                    )
                    .sorted(Comparator.comparing(Commentaire::getDateCreation).reversed())
                    .collect(Collectors.toList());

            return commentairesDesactifs.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
        } finally {
            // Nettoyer le token du ThreadLocal après utilisation
            JwtAuthTokenFilter.CURRENT_TOKEN.remove();
        }
    }

    // Activer un commentaire (quand l'utilisateur lit son sujet)
    public CommentaireResponseDto activerCommentaire(String commentaireId) {
        Commentaire commentaire = commentaireRepository.findById(commentaireId)
                .orElseThrow(() -> new RuntimeException("Commentaire non trouvé avec l'id: " + commentaireId));

        // Changer le statut à ACTIF
        commentaire.setStatut("ACTIF");
        commentaire.setDateModification(LocalDateTime.now());
        Commentaire commentaireMisAJour = commentaireRepository.save(commentaire);

        // Décrémenter le nombre de commentaires désactivés du sujet
        Sujet sujet = commentaire.getSujet();
        sujet.setNombreCommentairesDesactif(Math.max(0, sujet.getNombreCommentairesDesactif() - 1));
        sujet.setDateModification(LocalDateTime.now());
        sujetRepository.save(sujet);

        log.info("✅ Commentaire activé: {} du sujet: {}", commentaireId, sujet.getId());

        return convertToDto(commentaireMisAJour);
    }

    // Récupérer le nombre total de notifications pour un utilisateur
    public int getNombreNotificationsByUser(String userId) {
        try {
            // Récupérer le token JWT pour l'appel au microservice gestion_user
            String jwtToken = JwtAuthTokenFilter.CURRENT_TOKEN.get();
            UserServiceClient.UserInfoResponse userInfo;
            
            if (jwtToken != null) {
                // Appeler le microservice gestion_user pour récupérer les informations de l'utilisateur
                userInfo = userServiceClient.getUserById(Long.parseLong(userId), jwtToken);
            } else {
                // Fallback : créer un utilisateur minimal pour les appels publics
                userInfo = new UserServiceClient.UserInfoResponse();
                userInfo.setId(Long.parseLong(userId));
                userInfo.setUsername("user" + userId);
                userInfo.setNom("Utilisateur");
                userInfo.setPrenom("Inconnu");
                userInfo.setEmail("user" + userId + "@example.com");
            }
            
            // Créer un objet UserInfo pour la comparaison
            UserInfo auteur = UserInfo.builder()
                    .id(userInfo.getId().toString())
                    .username(userInfo.getUsername())
                    .build();

            // Récupérer tous les sujets de cet utilisateur
            List<Sujet> sujetsUtilisateur = sujetRepository.findAll().stream()
                    .filter(sujet -> {
                        User auteurSujet = resolveAuteurForPublic(sujet.getAuteur());
                        return auteurSujet != null && auteurSujet.getId().equals(auteur.getId());
                    })
                    .collect(Collectors.toList());

            // Compter les commentaires désactivés de ces sujets
            return (int) commentaireRepository.findAll().stream()
                    .filter(commentaire -> 
                        "DESACTIF".equals(commentaire.getStatut()) &&
                        sujetsUtilisateur.contains(commentaire.getSujet())
                    )
                    .count();
        } finally {
            // Nettoyer le token du ThreadLocal après utilisation
            JwtAuthTokenFilter.CURRENT_TOKEN.remove();
        }
    }

    // Conversion Entity → DTO
    private CommentaireResponseDto convertToDto(Commentaire commentaire) {
        // Gérer l'auteur selon son type
        User auteurResolu = resolveAuteurForPublic(commentaire.getAuteur());
        
        // Créer les informations du sujet
        SujetInfo sujetInfo = null;
        if (commentaire.getSujet() != null) {
            sujetInfo = SujetInfo.builder()
                    .id(commentaire.getSujet().getId())
                    .titreOriginal(commentaire.getSujet().getTitreOriginal())
                    .langueOriginale(commentaire.getSujet().getLangueOriginale())
                    .build();
        }
        
        return CommentaireResponseDto.builder()
                .id(commentaire.getId())
                .contenuOriginal(commentaire.getContenuOriginal())
                .langueOriginale(commentaire.getLangueOriginale())
                .auteur(auteurResolu)
                .statut(commentaire.getStatut())
                .dateCreation(commentaire.getDateCreation())
                .dateModification(commentaire.getDateModification())
                .parentId(commentaire.getParent() != null ? commentaire.getParent().getId() : null)
                .sujet(sujetInfo)
                .build();
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
            
            return user;
        }
        
        // Fallback : créer un utilisateur minimal
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
}