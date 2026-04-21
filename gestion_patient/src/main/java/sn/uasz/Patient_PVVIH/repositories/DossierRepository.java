package sn.uasz.Patient_PVVIH.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import sn.uasz.Patient_PVVIH.entities.Dossier;

import java.util.Optional;

public interface DossierRepository extends JpaRepository<Dossier, String> {
    Optional<Dossier> findByPatient_CodePatient(String codePatient);
    Optional<Dossier> findByCodeDossier(String codeDossier);
    
    // ✅ Nouvelle méthode pour chercher par code patient stocké
    Optional<Dossier> findByPatientCode(String patientCode);
}
