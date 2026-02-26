package sn.uasz.referencement_PVVIH.repositories;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import sn.uasz.referencement_PVVIH.entities.AssistantSocial;
import org.springframework.data.jpa.repository.JpaRepository;
import sn.uasz.referencement_PVVIH.entities.Doctor;
import sn.uasz.referencement_PVVIH.entities.Hopital;
import sn.uasz.referencement_PVVIH.entities.User;

import java.util.Optional;

public interface AssistantSocialRepository extends JpaRepository<AssistantSocial, String> {

    Optional<AssistantSocial> findByUtilisateur_Username(String username);
    Optional<AssistantSocial> findByHopital(Hopital hopital);
    Optional<AssistantSocial> findByCodeAssistant(String codeAssistant);

    Optional<AssistantSocial> findByUtilisateur(@Param("user") User user);
}

