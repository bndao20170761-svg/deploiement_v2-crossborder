package sn.uasz.User_API_PVVIH.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import sn.uasz.User_API_PVVIH.entities.Membre;
import sn.uasz.User_API_PVVIH.entities.User;

import java.util.List;
import java.util.Optional;

public interface MembreRepository extends JpaRepository<Membre, Long> {

    // Trouver un membre par son code
    Optional<Membre> findByCode(String code);

    // Vérifier si un code existe déjà
    boolean existsByCode(String code);

    // Vérifier si un pseudo existe déjà
    boolean existsByPseudo(String pseudo);

    // Vérifier si un utilisateur est déjà associé à un membre
    boolean existsByUtilisateur(User utilisateur);

    // Trouver tous les membres d'une association par son code
    List<Membre> findByAssociationCodeAssociation(String codeAssociation);

    // Trouver tous les membres d'un utilisateur par son ID
    List<Membre> findByUtilisateurId(Long utilisateurId);

    // Trouver un membre par le username de l'utilisateur
    @Query("SELECT m FROM Membre m WHERE m.utilisateur.username = :username")
    Optional<Membre> findByUtilisateurUsername(@Param("username") String username);

    // Compter le nombre de membres par association
    @Query("SELECT COUNT(m) FROM Membre m WHERE m.association.codeAssociation = :codeAssociation")
    long countByAssociationCode(@Param("codeAssociation") String codeAssociation);

    // Trouver les membres avec pagination et tri
    @Query("SELECT m FROM Membre m ORDER BY m.utilisateur.nom, m.utilisateur.prenom")
    List<Membre> findAllOrderByNomPrenom();

    // Rechercher des membres par nom ou prénom
    @Query("SELECT m FROM Membre m WHERE LOWER(m.utilisateur.nom) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(m.utilisateur.prenom) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Membre> searchByNomOrPrenom(@Param("searchTerm") String searchTerm);

    // Trouver les membres actifs
    @Query("SELECT m FROM Membre m WHERE m.utilisateur.active = true")
    List<Membre> findActiveMembres();

    // Trouver les membres par profil utilisateur
    @Query("SELECT m FROM Membre m WHERE m.utilisateur.profil = :profil")
    List<Membre> findByUtilisateurProfil(@Param("profil") String profil);

    // Ajoutez cette méthode avec une jointure
    @Query("SELECT m FROM Membre m LEFT JOIN FETCH m.utilisateur LEFT JOIN FETCH m.association")
    List<Membre> findAllWithAssociationsAndUsers();

    // ... autres méthodes
}