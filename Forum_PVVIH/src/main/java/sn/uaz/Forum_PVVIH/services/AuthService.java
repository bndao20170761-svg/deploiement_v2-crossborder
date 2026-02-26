package sn.uaz.Forum_PVVIH.services;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import sn.uaz.Forum_PVVIH.dtos.AuthResponseDto;
import sn.uaz.Forum_PVVIH.dtos.LoginRequestDto;
import sn.uaz.Forum_PVVIH.dtos.UserCreationDto;
import sn.uaz.Forum_PVVIH.dtos.UserDto;
import sn.uaz.Forum_PVVIH.entities.User;
import sn.uaz.Forum_PVVIH.repositories.UserRepository;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthResponseDto authenticate(LoginRequestDto loginRequest) {
        // Essayer de trouver l'utilisateur par username d'abord, puis par email
        User user = userRepository.findByUsernameAndActiveTrue(loginRequest.getUsername())
                .orElseGet(() -> userRepository.findByEmailAndActiveTrue(loginRequest.getUsername())
                        .orElse(null));

        if (user == null) {
            throw new RuntimeException("Utilisateur non trouvé ou compte inactif");
        }

        // Vérifier le mot de passe
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new RuntimeException("Mot de passe incorrect");
        }

        // TODO: Générer le vrai token JWT
        String token = "jwt-token-" + user.getId();

        return AuthResponseDto.builder()
                .token(token)
                .user(convertToDto(user))
                .message("Authentification réussie")
                .build();
    }

    public AuthResponseDto register(UserCreationDto userDto) {
        // Vérifier que l'utilisateur n'existe pas déjà
        if (userRepository.findByUsername(userDto.getUsername()).isPresent()) {
            throw new RuntimeException("Nom d'utilisateur déjà pris");
        }

        if (userDto.getEmail() != null && userRepository.findByEmail(userDto.getEmail()).isPresent()) {
            throw new RuntimeException("Email déjà utilisé");
        }

        // Encoder le mot de passe
        String encodedPassword = passwordEncoder.encode(userDto.getPassword());

        // Créer le nouvel utilisateur avec des valeurs par défaut
        User newUser = new User();
        newUser.setUsername(userDto.getUsername());
        newUser.setPassword(encodedPassword);
        newUser.setNom(userDto.getNom());
        newUser.setPrenom(userDto.getPrenom());
        newUser.setNationalite(userDto.getNationalite());
        newUser.setEmail(userDto.getEmail());
        newUser.setProfil("USER");
        newUser.setActive(true);

        User savedUser = userRepository.save(newUser);

        // TODO: Générer le vrai token JWT
        String token = "jwt-token-" + savedUser.getId();

        return AuthResponseDto.builder()
                .token(token)
                .user(convertToDto(savedUser))
                .message("Inscription réussie")
                .build();
    }

    private UserDto convertToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .profil(user.getProfil())
                .languePreferee("fr") // TODO: utiliser user.getLanguePreferee() quand disponible
                .build();
    }
}
