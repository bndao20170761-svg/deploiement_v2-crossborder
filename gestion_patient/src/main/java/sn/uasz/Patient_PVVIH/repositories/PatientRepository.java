package sn.uasz.Patient_PVVIH.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import sn.uasz.Patient_PVVIH.entities.Patient;

import java.util.List;
import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, String> {
    List<Patient> findByDoctorCreate_CodeDoctor(String codeDoctor);
    boolean existsByCodePatient(String codePatient);
    boolean existsByPseudo(String pseudo);
    Optional<Patient> findByCodePatient(String codePatient);

    // ⚡ AJOUTEZ CETTE MÉTHODE - Charge le patient AVEC son dossier
    @Query("SELECT p FROM Patient p LEFT JOIN FETCH p.dossier WHERE p.codePatient = :codePatient")
    Optional<Patient> findByCodePatientWithDossier(@Param("codePatient") String codePatient);

    // ⚡ Optionnel: Méthode pour vérifier l'existence d'un dossier
    @Query("SELECT CASE WHEN COUNT(d) > 0 THEN true ELSE false END FROM Dossier d WHERE d.patient.codePatient = :codePatient")
    boolean existsDossierByPatientCode(@Param("codePatient") String codePatient);
}