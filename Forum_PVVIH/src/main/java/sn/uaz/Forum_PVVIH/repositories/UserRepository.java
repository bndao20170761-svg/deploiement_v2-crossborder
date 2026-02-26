package sn.uaz.Forum_PVVIH.repositories;

import sn.uaz.Forum_PVVIH.entities.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByUsernameAndActiveTrue(String username);
    Optional<User> findByEmailAndActiveTrue(String email);
    List<User> findByProfilAndActiveTrue(String profil);







    // Si tu veux vraiment chercher par nom et prenom (attention aux doublons):
    Optional<User> findByNom(String nom);
    Optional<User> findByPrenom(String prenom);
}