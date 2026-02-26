package sn.uasz.User_API_PVVIH.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import sn.uasz.User_API_PVVIH.entities.Patient;
import sn.uasz.User_API_PVVIH.entities.User;

import java.util.List;
import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, String> {
    List<Patient> findByDoctorCreate_CodeDoctor(String codeDoctor);
    boolean existsByCodePatient(String codePatient);
    boolean existsByPseudo(String pseudo);
    Optional<Patient> findByCodePatient(String codePatient);






    // Requêtes dérivées utilisées dans PatientService et ReferenceService


    List<Patient> findByDoctorCreate_Utilisateur_Username(String username);





    Optional<Patient> findById(String id);

    // Exemple si besoin : recherche par utilisateur lié
    Optional<Patient> findByUtilisateur(User utilisateur);

}
