package sn.uasz.User_API_PVVIH.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import sn.uasz.User_API_PVVIH.config.CustomUserDetails;
import sn.uasz.User_API_PVVIH.entities.User;
import sn.uasz.User_API_PVVIH.repositories.UserRepository;

import java.util.Optional;

@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003", "http://gateway-pvvih:8080"})
@RestController
public class UserController {

    private final UserRepository userRepository;

    @Autowired
    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/api/user/me")
    public CurrentUserResponse getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null; // ou exception 401
        }

        Object principal = authentication.getPrincipal();
        String username = null;

        if (principal instanceof CustomUserDetails) {
            username = ((CustomUserDetails) principal).getUsername();
        } else if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else if (principal instanceof String) {
            username = (String) principal;
        }

        if (username == null) {
            return null;
        }

        // Recherche en base par username (recommandé, car nom/prenom peuvent ne pas être uniques)
        Optional<User> userOpt = userRepository.findByUsername(username);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            return new CurrentUserResponse(user.getProfil(),user.getPrenom(), user.getNom(), user.getUsername());
        } else {
            // Sinon retourne minimal avec username
            return new CurrentUserResponse("", "","", username);
        }
    }

    @GetMapping("/api/users/username/{username}")
    public UserInfoResponse getUserByUsername(@PathVariable String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            return new UserInfoResponse(
                user.getId(),
                user.getUsername(),
                user.getUsername(), // Utiliser username comme email si pas de champ email
                user.getNom(),
                user.getPrenom()
            );
        } else {
            throw new RuntimeException("Utilisateur non trouvé avec le nom d'utilisateur: " + username);
        }
    }

    @GetMapping("/api/users/id/{id}")
    public UserInfoResponse getUserById(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            return new UserInfoResponse(
                user.getId(),
                user.getUsername(),
                user.getUsername(), // Utiliser username comme email si pas de champ email
                user.getNom(),
                user.getPrenom()
            );
        } else {
            throw new RuntimeException("Utilisateur non trouvé avec l'ID: " + id);
        }
    }

    // Classe pour la réponse de l'utilisateur
    public static class UserInfoResponse {
        private Long id;
        private String username;
        private String email;
        private String nom;
        private String prenom;

        public UserInfoResponse(Long id, String username, String email, String nom, String prenom) {
            this.id = id;
            this.username = username;
            this.email = email;
            this.nom = nom;
            this.prenom = prenom;
        }

        // Getters
        public Long getId() { return id; }
        public String getUsername() { return username; }
        public String getEmail() { return email; }
        public String getNom() { return nom; }
        public String getPrenom() { return prenom; }
    }

    // Classe pour la réponse de l'utilisateur actuel
    public static class CurrentUserResponse {
        private String profil;
        private String prenom;
        private String nom;
        private String username;

        public CurrentUserResponse(String profil, String prenom, String nom, String username) {
            this.profil = profil;
            this.prenom = prenom;
            this.nom = nom;
            this.username = username;
        }

        // Getters
        public String getProfil() { return profil; }
        public String getPrenom() { return prenom; }
        public String getNom() { return nom; }
        public String getUsername() { return username; }
    }
}