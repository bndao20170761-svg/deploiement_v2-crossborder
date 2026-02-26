// SujetRepository.java
package sn.uaz.Forum_PVVIH.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import sn.uaz.Forum_PVVIH.entities.Sujet;
import sn.uaz.Forum_PVVIH.entities.Section;
import sn.uaz.Forum_PVVIH.entities.User;

import java.util.List;
import java.util.Optional;

public interface SujetRepository extends MongoRepository<Sujet, String> {

    Page<Sujet> findAll(Pageable pageable);

    List<Sujet> findBySection(Section section);

    List<Sujet> findByAuteur(User auteur);

    List<Sujet> findBySectionIdOrderByDateCreationDesc(String sectionId);

    List<Sujet> findByStatut(boolean statut);

    long countBySection(Section section);

    Optional<Sujet> findFirstBySectionOrderByDateCreationDesc(Section section);

    List<Sujet> findByType(String type);

    List<Sujet> findByLangueOriginale(String langue);

    // Méthodes supprimées car auteur est maintenant Object et ne peut pas être directement query
    // List<Sujet> findByAuteurId(String auteurId);
    // List<Sujet> findByAuteurUsername(String username);
}