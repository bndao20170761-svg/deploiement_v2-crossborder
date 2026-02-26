package sn.uasz.User_API_PVVIH.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import sn.uasz.User_API_PVVIH.entities.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);



    // Ajoutez cette méthode
    boolean existsByUsername(String username);


    // Si tu veux vraiment chercher par nom et prenom (attention aux doublons):
    Optional<User> findByNom(String nom);
    Optional<User> findByPrenom(String prenom);
}
