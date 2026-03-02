package sn.uasz.referencement_PVVIH.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import sn.uasz.referencement_PVVIH.dtos.*;
import sn.uasz.referencement_PVVIH.entities.User;
import sn.uasz.referencement_PVVIH.repositories.UserRepository;
import sn.uasz.referencement_PVVIH.security.JwtUtils;

import java.time.LocalDateTime;
import java.util.*;

/**
 * ⚠️ CE CONTROLLER NE DOIT PAS EXISTER DANS GESTION_REFERENCE
 * 
 * L'authentification est gérée par le service gestion_user.
 * Ce service doit UNIQUEMENT valider les JWT reçus, pas gérer l'authentification.
 * 
 * Pour l'authentification, les clients doivent appeler :
 * - POST /api/auth/login via gestion_user
 * - POST /api/auth/register via gestion_user
 * 
 * Ce controller est désactivé pour éviter les conflits de base de données.
 */
@CrossOrigin(origins = {"http://localhost:3001", "http://localhost:3002", "http://localhost:3003", "http://gateway-pvvih:8080"})
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    /**
     * ⚠️ ENDPOINT DÉSACTIVÉ
     * Utilisez gestion_user pour l'authentification
     */
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        return ResponseEntity.status(501).body(Map.of(
            "error", "Authentication not available in this service",
            "message", "Please use gestion_user service for authentication",
            "endpoint", "POST /api/auth/login on gestion_user"
        ));
    }

    /**
     * ⚠️ ENDPOINT DÉSACTIVÉ
     * Utilisez gestion_user pour l'enregistrement
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerUsers(@RequestBody Object payload) {
        return ResponseEntity.status(501).body(Map.of(
            "error", "Registration not available in this service",
            "message", "Please use gestion_user service for registration",
            "endpoint", "POST /api/auth/register on gestion_user"
        ));
    }

    /**
     * ⚠️ ENDPOINT DÉSACTIVÉ
     * Utilisez gestion_user pour la réinitialisation
     */
    @PostMapping("/reset-password-request")
    public ResponseEntity<?> resetPasswordRequest(@RequestParam String username) {
        return ResponseEntity.status(501).body(Map.of(
            "error", "Password reset not available in this service",
            "message", "Please use gestion_user service for password reset",
            "endpoint", "POST /api/auth/reset-password-request on gestion_user"
        ));
    }

    /**
     * ⚠️ ENDPOINT DÉSACTIVÉ
     * Utilisez gestion_user pour la réinitialisation
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest resetRequest) {
        return ResponseEntity.status(501).body(Map.of(
            "error", "Password reset not available in this service",
            "message", "Please use gestion_user service for password reset",
            "endpoint", "POST /api/auth/reset-password on gestion_user"
        ));
    }
}
