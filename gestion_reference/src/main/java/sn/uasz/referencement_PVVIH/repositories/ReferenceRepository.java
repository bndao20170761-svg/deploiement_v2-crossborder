package sn.uasz.referencement_PVVIH.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import sn.uasz.referencement_PVVIH.entities.Doctor;
import sn.uasz.referencement_PVVIH.entities.Reference;

import java.util.List;

public interface ReferenceRepository   extends JpaRepository<Reference, Long> {
    // Rechercher toutes les références dont le medecinAuteur a un codeDoctor donné
    List<Reference> findByMedecinAuteur_CodeDoctor(String codeDoctor);
    List<Reference> findByValidationFalse();

    // Rechercher toutes les références dont le medecin (destinataire) a un codeDoctor donné
    List<Reference> findByMedecin_CodeDoctor(String codeDoctor);

    // Rechercher toutes les références par code assistant social
    List<Reference> findByAssistantSocial_CodeAssistant(String codeAssistant);

    // Rechercher toutes les références par code patient
    List<Reference> findByPatient_CodePatient(String codePatient);


}

