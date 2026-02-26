// java
package sn.uasz.referencement_PVVIH.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.uasz.referencement_PVVIH.entities.Patient;
import sn.uasz.referencement_PVVIH.entities.User;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, String> {

    // Requêtes dérivées utilisées dans PatientService et ReferenceService
    List<Patient> findByDoctorCreate_CodeDoctor(String codeDoctor);

    List<Patient> findByDoctorCreate_Utilisateur_Username(String username);

    Optional<Patient> findByCodePatient(String codePatient);

    boolean existsByCodePatient(String codePatient);

    boolean existsByPseudo(String pseudo);

    Optional<Patient> findById(String id);

    // Exemple si besoin : recherche par utilisateur lié
    Optional<Patient> findByUtilisateur(User utilisateur);
}
