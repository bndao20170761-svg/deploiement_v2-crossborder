package sn.uasz.referencement_PVVIH.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import sn.uasz.referencement_PVVIH.entities.User;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);




    // Si tu veux vraiment chercher par nom et prenom (attention aux doublons):
    Optional<User> findByNom(String nom);
    Optional<User> findByPrenom(String prenom);
}
