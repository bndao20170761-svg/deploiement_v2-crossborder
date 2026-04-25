package sn.uasz.referencement_PVVIH.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import sn.uasz.referencement_PVVIH.entities.ReferenceDossier;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReferenceDossierRepository extends JpaRepository<ReferenceDossier, Long> {
    
    Optional<ReferenceDossier> findByCodeReference(String codeReference);
    
    List<ReferenceDossier> findByCodePatient(String codePatient);
    
    List<ReferenceDossier> findByCodeHopital(String codeHopital);
    
    List<ReferenceDossier> findByCodeDocteur(String codeDocteur);
    
    List<ReferenceDossier> findByCodeDocteurAndStatutInOrderByDateCreationDesc(String codeDocteur, List<String> statuts);
    
    List<ReferenceDossier> findByCodeReferenceurOrderByDateCreationDesc(String codeReferenceur);
    
    List<ReferenceDossier> findByStatut(String statut);
    
    List<ReferenceDossier> findByTypeReference(String typeReference);
    
    @Query("SELECT r FROM ReferenceDossier r WHERE r.statut = :statut ORDER BY r.dateCreation DESC")
    List<ReferenceDossier> findByStatutOrderByDateCreationDesc(@Param("statut") String statut);
    
    @Query("SELECT r FROM ReferenceDossier r WHERE r.codeHopital = :codeHopital AND r.statut = :statut ORDER BY r.dateCreation DESC")
    List<ReferenceDossier> findByCodeHopitalAndStatutOrderByDateCreationDesc(@Param("codeHopital") String codeHopital, @Param("statut") String statut);
    
    @Query("SELECT r FROM ReferenceDossier r WHERE r.codePatient = :codePatient ORDER BY r.dateCreation DESC")
    List<ReferenceDossier> findByCodePatientOrderByDateCreationDesc(@Param("codePatient") String codePatient);
    
    boolean existsByCodeReference(String codeReference);
    
    void deleteByCodeReference(String codeReference);
}
