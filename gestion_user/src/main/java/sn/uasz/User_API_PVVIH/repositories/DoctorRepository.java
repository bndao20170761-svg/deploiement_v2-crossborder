package sn.uasz.User_API_PVVIH.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import sn.uasz.User_API_PVVIH.entities.Doctor;
import sn.uasz.User_API_PVVIH.entities.Hopital;
import sn.uasz.User_API_PVVIH.entities.User;

import java.util.List;
import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, String> {
    Optional<Doctor> findByCodeDoctor(String codeDoctor);
    Optional<Doctor> findByHopital(Hopital hopital);

    Optional<Doctor>  findByUtilisateur_Username(String username);
    boolean existsByUtilisateur(User utilisateur);
    Optional<Doctor> findByUtilisateur(User utilisateur);
    boolean existsByCodeDoctor(String codeDoctor);
    boolean existsByPseudo(String pseudo);
    void deleteByUtilisateur(User utilisateur);

    // Méthode pour vérifier si un utilisateur est référencé ailleurs
    @Query("SELECT COUNT(d) > 0 FROM Doctor d WHERE d.utilisateur = :user AND d.codeDoctor != :codeDoctor")
    boolean existsByUtilisateurAndCodeDoctorNot(@Param("user") User user, @Param("codeDoctor") String codeDoctor);

    // Méthode pour compter les patients d'un médecin - CORRECTION ICI
    @Query("SELECT COUNT(p) FROM Patient p WHERE p.doctorCreate.codeDoctor = :codeDoctor")
    long countPatientsByDoctor(@Param("codeDoctor") String codeDoctor);

    // Méthode pour trouver un médecin par username utilisateur
// Dans DoctorRepository.java
    List<Doctor> findByHopitalId(Long hospitalId);
    long count();

    // Trouver un docteur par son utilisateur
    @Query("SELECT d FROM Doctor d WHERE d.utilisateur = :user")
    Optional<Doctor> findByUser(@Param("user") User user);

    // Trouver un docteur par l'ID de l'utilisateur
    @Query("SELECT d FROM Doctor d WHERE d.utilisateur.id = :userId")
    Optional<Doctor> findByUserId(@Param("userId") Long userId);
}