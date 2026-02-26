package sn.uaz.Forum_PVVIH.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import sn.uaz.Forum_PVVIH.entities.User;

@Service
@RequiredArgsConstructor
public class UserService {

    // TODO: Injecter les vraies dépendances quand elles seront créées
    // private final UserRepository userRepository;

    public User getCurrentUser() {
        // TODO: Récupérer l'utilisateur actuel depuis le contexte de sécurité
        // Mock temporaire pour permettre la compilation
        User user = new User();
        user.setId("1");
        user.setUsername("currentUser");
        user.setNom("Utilisateur");
        user.setPrenom("Actuel");
        user.setProfil("USER");
        user.setActive(true);
        return user;
    }

    public User updateUser(User user) {
        // TODO: Implémenter la vraie logique de mise à jour
        // Utiliser les setters disponibles
        return user;
    }
}
