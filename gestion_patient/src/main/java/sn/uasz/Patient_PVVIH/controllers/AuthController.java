package sn.uasz.Patient_PVVIH.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import sn.uasz.Patient_PVVIH.dtos.*;
import sn.uasz.Patient_PVVIH.entities.User;
import sn.uasz.Patient_PVVIH.repositories.UserRepository;
import sn.uasz.Patient_PVVIH.security.JwtUtils;

import java.time.LocalDateTime;
import java.util.*;

@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003", "http://gateway-pvvih:8080"}, maxAge = 3600)

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
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(authentication);

        UserDetails userDetails = (UserDetails) authentication.getPrincipal(); // ✅ Caster
        String jwt = jwtUtils.generateJwtToken(userDetails);
        return ResponseEntity.ok(new LoginResponse(jwt));
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

        return ResponseEntity.ok(messages);
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
}
