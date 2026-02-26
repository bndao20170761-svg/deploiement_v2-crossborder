package sn.uasz.Patient_PVVIH.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import sn.uasz.Patient_PVVIH.config.CustomUserDetails;
import sn.uasz.Patient_PVVIH.entities.User;
import sn.uasz.Patient_PVVIH.repositories.UserRepository;

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
            return new CurrentUserResponse(user.getPrenom(), user.getNom(), user.getUsername());
        } else {
            // Sinon retourne minimal avec username
            return new CurrentUserResponse("", "", username);
        }
    }}