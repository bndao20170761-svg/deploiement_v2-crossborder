package com.enda.crossborder.repository;

import com.enda.crossborder.entity.DossierPatient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DossierPatientRepository extends JpaRepository<DossierPatient, Long> {

    /**
     * Trouver un dossier patient par son code
     */
    Optional<DossierPatient> findByCodeDossier(String codeDossier);

    /**
     * Vérifier si un dossier patient existe par son code
     */
    boolean existsByCodeDossier(String codeDossier);

    /**
     * Rechercher des dossiers patients par nom complet (insensible à la casse)
     */
    List<DossierPatient> findByNomCompletContainingIgnoreCase(String nomComplet);

    /**
     * Rechercher des dossiers patients par code patient
     */
    List<DossierPatient> findByCodePatient(String codePatient);

    /**
     * Rechercher des dossiers patients par nom de médecin créateur
     */
    List<DossierPatient> findByDoctorCreateNomContainingIgnoreCase(String doctorCreateNom);

    /**
     * Compter les dossiers patients par code patient
     */
    long countByCodePatient(String codePatient);

    /**
     * Rechercher des dossiers patients avec des critères multiples
     */
    @Query("SELECT d FROM DossierPatient d WHERE " +
           "(:nomComplet IS NULL OR LOWER(d.nomComplet) LIKE LOWER(CONCAT('%', :nomComplet, '%'))) AND " +
           "(:codePatient IS NULL OR d.codePatient = :codePatient) AND " +
           "(:doctorCreateNom IS NULL OR LOWER(d.doctorCreateNom) LIKE LOWER(CONCAT('%', :doctorCreateNom, '%')))")
    List<DossierPatient> findByMultipleCriteria(
            @Param("nomComplet") String nomComplet,
            @Param("codePatient") String codePatient,
            @Param("doctorCreateNom") String doctorCreateNom
    );

    /**
     * Rechercher des dossiers patients par statut VIH du père
     */
    List<DossierPatient> findByPereStatutVih(String pereStatutVih);

    /**
     * Rechercher des dossiers patients par statut VIH de la mère
     */
    List<DossierPatient> findByMereStatutVih(String mereStatutVih);

    /**
     * Rechercher des dossiers patients par stade OMS
     */
    List<DossierPatient> findByStadeOms(String stadeOms);

    /**
     * Rechercher des dossiers patients par protocole ARV actuel
     */
    List<DossierPatient> findByProtocoleActuelArv(String protocoleActuelArv);

    /**
     * Rechercher des dossiers patients créés entre deux dates
     */
    @Query("SELECT d FROM DossierPatient d WHERE d.createdAt BETWEEN :startDate AND :endDate")
    List<DossierPatient> findByCreatedAtBetween(
            @Param("startDate") java.time.LocalDate startDate,
            @Param("endDate") java.time.LocalDate endDate
    );

    /**
     * Rechercher des dossiers patients avec suivi ARV
     */
    @Query("SELECT DISTINCT d FROM DossierPatient d JOIN d.suiviARVs")
    List<DossierPatient> findWithSuiviARV();

    /**
     * Rechercher des dossiers patients avec PTME
     */
    @Query("SELECT DISTINCT d FROM DossierPatient d JOIN d.ptmes")
    List<DossierPatient> findWithPTME();

    /**
     * Rechercher des dossiers patients avec dépistage familial
     */
    @Query("SELECT DISTINCT d FROM DossierPatient d JOIN d.depistageFamiliales")
    List<DossierPatient> findWithDepistageFamilial();
}
