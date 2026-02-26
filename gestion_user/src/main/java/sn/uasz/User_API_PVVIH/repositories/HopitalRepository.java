package sn.uasz.User_API_PVVIH.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import sn.uasz.User_API_PVVIH.entities.Doctor;
import sn.uasz.User_API_PVVIH.entities.Hopital;

import java.util.List;
import java.util.Optional;

public interface HopitalRepository extends JpaRepository<Hopital, Long> {

    boolean existsByNomAndVille(String nom, String ville);

    boolean existsByNomAndVilleAndIdNot(String nom, String ville, Long id);

    List<Hopital> findByPays(String pays);

    List<Hopital> findByVille(String ville);

    @Query("SELECT COUNT(d) FROM Doctor d WHERE d.hopital.id = :hospitalId")
    long countDoctorsByHospital(@Param("hospitalId") Long hospitalId);

    @Query("SELECT COUNT(a) FROM AssistantSocial a WHERE a.hopital.id = :hospitalId")
    long countAssistantsByHospital(@Param("hospitalId") Long hospitalId);
    List<Hopital> findByActiveTrue();
    Optional<Hopital> findByNom(String nom);



    List<Hopital> findByVilleAndActiveTrue(String ville);
    List<Hopital> findByPaysAndActiveTrue(String pays);
    List<Hopital> findByVilleAndPaysAndActiveTrue(String ville, String pays);
    // Hôpitaux inactifs (ajout manquant → corrige ton erreur)
    List<Hopital> findByActiveFalse();
    // Dans HopitalRepository.java
    List<Hopital> findByCreatedByDoctor(Doctor doctor);
    // ✅ CORRECTION MultipleBagFetchException: On ne peut pas fetch deux List en même temps
    // Charger services
    @Query("SELECT DISTINCT h FROM Hopital h " +
            "LEFT JOIN FETCH h.services " +
            "WHERE h.id = :id")
    Optional<Hopital> findByIdWithServices(@Param("id") Long id);
    
    // ✅ Charger prestataires séparément
    @Query("SELECT h FROM Hopital h " +
            "LEFT JOIN FETCH h.prestataires " +
            "WHERE h.id = :id")
    Optional<Hopital> findByIdWithPrestataires(@Param("id") Long id);
    
    // ✅ Méthode combinée qui charge les deux séparément (ne pas utiliser directement)
    @Query("SELECT h FROM Hopital h WHERE h.id = :id")
    Optional<Hopital> findByIdBasic(@Param("id") Long id);

}