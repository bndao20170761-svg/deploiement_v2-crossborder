package sn.uasz.User_API_PVVIH.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import sn.uasz.User_API_PVVIH.dtos.*;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import sn.uasz.User_API_PVVIH.entities.User;
import sn.uasz.User_API_PVVIH.repositories.UserRepository;
import sn.uasz.User_API_PVVIH.security.JwtUtils;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Stockage temporaire tokens récupération mot de passe (en vrai mettre en base)
    private final Map<String, String> resetTokens = new HashMap<>();

    public AuthController(AuthenticationManager authenticationManager, JwtUtils jwtUtils,
                          UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            // Accepter username ou email (frontend peut envoyer l'un ou l'autre), et trim pour éviter espaces
            String loginId = loginRequest.getUsername() != null ? loginRequest.getUsername().trim() : null;
            if (loginId == null || loginId.isBlank()) {
                loginId = loginRequest.getEmail() != null ? loginRequest.getEmail().trim() : null;
            }
            if (loginId == null || loginId.isBlank()) {
                return ResponseEntity.status(401).body(Map.of("error", "Nom d'utilisateur requis"));
            }
            String rawPassword = loginRequest.getPassword() != null ? loginRequest.getPassword().trim() : null;
            if (rawPassword == null || rawPassword.isBlank()) {
                return ResponseEntity.status(401).body(Map.of("error", "Mot de passe requis"));
            }
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginId, rawPassword));
            SecurityContextHolder.getContext().setAuthentication(authentication);

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String jwt = jwtUtils.generateJwtToken(userDetails);
            // Retourner à la fois "token" et "accessToken" pour compatibilité frontend
            return ResponseEntity.ok(Map.of("token", jwt, "accessToken", jwt));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body(Map.of("error", "Identifiants incorrects"));
        } catch (DisabledException e) {
            return ResponseEntity.status(401).body(Map.of("error", "Compte désactivé"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUsers(@RequestBody Object payload) {
        List<RegisterRequest> registerRequests = new ArrayList<>();

        if (payload instanceof List<?>) {
            // Si le JSON est un tableau
            registerRequests = ((List<?>) payload).stream()
                    .map(obj -> new ObjectMapper().convertValue(obj, RegisterRequest.class))
                    .toList();
        } else {
            // Si le JSON est un objet unique
            RegisterRequest singleRequest = new ObjectMapper().convertValue(payload, RegisterRequest.class);
            registerRequests.add(singleRequest);
        }

        List<String> messages = new ArrayList<>();
        for (RegisterRequest request : registerRequests) {
            if (userRepository.findByUsername(request.getUsername()).isPresent()) {
                messages.add("Erreur: " + request.getUsername() + " déjà pris !");
                continue;
            }

            User user = User.builder()
                    .username(request.getUsername())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .nom(request.getNom())
                    .prenom(request.getPrenom())
                    .nationalite(request.getNationalite())
                    .dateCreation(LocalDateTime.now()) // Date ouverture compte
                    .active(true)                       // Compte activé directement
                    .profil("USER")
                    .build();

            userRepository.save(user);
            messages.add("Utilisateur " + request.getUsername() + " enregistré avec succès !");
        }

        // Retourner le format attendu par le frontend
        if (registerRequests.size() == 1 && !messages.get(0).startsWith("Erreur")) {
            // Succès - retourner un objet avec token et user
            RegisterRequest request = registerRequests.get(0);

            // Créer un UserDetails temporaire pour générer le token
            UserDetails springUser = org.springframework.security.core.userdetails.User.builder()
                    .username(request.getUsername())
                    .password(request.getPassword()) // Le mot de passe sera encodé par Spring Security
                    .authorities("USER")
                    .build();

            String jwt = jwtUtils.generateJwtToken(springUser);

            return ResponseEntity.ok(Map.of(
                "token", jwt,
                "user", Map.of(
                    "username", request.getUsername(),
                    "nom", request.getNom(),
                    "prenom", request.getPrenom(),
                    "profil", "USER"
                ),
                "success", true,
                "message", messages.get(0)
            ));
        } else {
            // Erreur ou inscription multiple - retourner la liste de messages
            return ResponseEntity.ok(messages);
        }
    }

    /**
     * Réinitialise le mot de passe d'un utilisateur (utile si le mot de passe en base
     * n'est pas encodé en BCrypt). À désactiver ou protéger en production.
     * Utiliser "username" OU "userId" (id numérique) pour identifier l'utilisateur.
     */
    @PostMapping("/force-reset-password")
    public ResponseEntity<?> forceResetPassword(@RequestBody Map<String, Object> body) {
        String newPassword = body.get("newPassword") != null ? body.get("newPassword").toString().trim() : null;
        if (newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "newPassword requis"));
        }
        Optional<User> userOpt = Optional.empty();

        // Recherche par userId (id) en priorité
        Object userIdObj = body.get("userId");
        if (userIdObj != null) {
            Long userId = userIdObj instanceof Number ? ((Number) userIdObj).longValue() : Long.parseLong(userIdObj.toString());
            userOpt = userRepository.findById(userId);
        }
        // Sinon recherche par username
        if (userOpt.isEmpty()) {
            String username = body.get("username") != null ? body.get("username").toString().trim() : null;
            if (username == null || username.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "username ou userId requis"));
            }
            userOpt = userRepository.findByUsername(username);
        }

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Utilisateur non trouvé. Vérifiez que vous utilisez la base user_db."));
        }
        User user = userOpt.get();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Mot de passe mis à jour. Vous pouvez maintenant vous connecter."));
    }

    // DEMANDE DE RÉINITIALISATION MOT DE PASSE
    @PostMapping("/reset-password-request")
    public ResponseEntity<?> resetPasswordRequest(@RequestParam String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Utilisateur non trouvé !");
        }
        // Générer token simple (UUID)
        String token = UUID.randomUUID().toString();
        resetTokens.put(token, username);

        // TODO: envoyer ce token par email (à intégrer selon ta techno mail)
        System.out.println("Token de réinitialisation pour " + username + ": " + token);

        return ResponseEntity.ok("Un email de réinitialisation a été envoyé.");
    }

    // RÉINITIALISATION MOT DE PASSE
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest resetRequest) {
        String username = resetTokens.get(resetRequest.getToken());
        if (username == null) {
            return ResponseEntity.badRequest().body("Token invalide ou expiré.");
        }

        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Utilisateur non trouvé.");
        }

        User user = userOpt.get();
        user.setPassword(passwordEncoder.encode(resetRequest.getNewPassword()));
        userRepository.save(user);
        resetTokens.remove(resetRequest.getToken());
        return ResponseEntity.ok("Mot de passe réinitialisé avec succès.");
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Non authentifié");
        }

        String username = authentication.getName();
        Optional<User> userOpt = userRepository.findByUsername(username);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Utilisateur non trouvé");
        }

        User user = userOpt.get();
        
        // Créer une Map qui gère les valeurs null
        Map<String, Object> userData = new HashMap<>();
        userData.put("id", user.getId());
        userData.put("username", user.getUsername());
        userData.put("nom", user.getNom() != null ? user.getNom() : "");
        userData.put("prenom", user.getPrenom() != null ? user.getPrenom() : "");
        userData.put("profil", user.getProfil() != null ? user.getProfil() : "");
        userData.put("nationalite", user.getNationalite() != null ? user.getNationalite() : "");
        userData.put("active", user.getActive() != null ? user.getActive() : false);
        userData.put("dateCreation", user.getDateCreation());
        userData.put("dateDernierAcces", user.getDateDernierAcces());
        
        return ResponseEntity.ok(userData);
    }
}
