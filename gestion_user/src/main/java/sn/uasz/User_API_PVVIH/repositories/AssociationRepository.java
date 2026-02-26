package sn.uasz.User_API_PVVIH.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import sn.uasz.User_API_PVVIH.entities.Association;
import sn.uasz.User_API_PVVIH.entities.User;

import java.util.List;
import java.util.Optional;

public interface AssociationRepository extends JpaRepository<Association, String> {

    Optional<Association> findByCodeAssociation(String codeAssociation);

    boolean existsByCodeAssociation(String codeAssociation);

    boolean existsByPseudo(String pseudo);

    boolean existsByUtilisateur(User utilisateur);

    boolean existsByUtilisateurAndCodeAssociationNot(User utilisateur, String codeAssociation);

    List<Association> findByVille(String ville);

    List<Association> findByPays(String pays);

    @Query("SELECT COUNT(m) FROM Membre m WHERE m.association.codeAssociation = :codeAssociation")
    long countMembersByAssociation(@Param("codeAssociation") String codeAssociation);
}