// Dans AssistantSocialRepository.java
package sn.uasz.User_API_PVVIH.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import sn.uasz.User_API_PVVIH.entities.AssistantSocial;
import sn.uasz.User_API_PVVIH.entities.User;

import java.util.Optional;

public interface AssistantSocialRepository extends JpaRepository<AssistantSocial, String> {

    Optional<AssistantSocial> findByCodeAssistant(String codeAssistant);

    boolean existsByCodeAssistant(String codeAssistant);

    boolean existsByPseudo(String pseudo);

    @Query("SELECT COUNT(a) > 0 FROM AssistantSocial a WHERE a.utilisateur = :user AND a.codeAssistant != :codeAssistant")
    boolean existsByUtilisateurAndCodeAssistantNot(@Param("user") User user, @Param("codeAssistant") String codeAssistant);

    Optional<AssistantSocial> findByUtilisateur_Username(String username);

    long count();
}