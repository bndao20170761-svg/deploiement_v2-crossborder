package sn.uasz.referencement_PVVIH.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import sn.uasz.referencement_PVVIH.entities.Doctor;
import sn.uasz.referencement_PVVIH.entities.Hopital;
import sn.uasz.referencement_PVVIH.entities.User;

import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, String> {
    Optional<Doctor> findByCodeDoctor(String codeDoctor);
    Optional<Doctor> findByHopital(Hopital hopital);

    Optional<Doctor>  findByUtilisateur_Username(String username);
    boolean existsByUtilisateur(User utilisateur);
    Optional<Doctor> findByUtilisateur(User utilisateur);

    void deleteByUtilisateur(User utilisateur);

}