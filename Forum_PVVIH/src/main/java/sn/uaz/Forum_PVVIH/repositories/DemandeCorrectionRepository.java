package sn.uaz.Forum_PVVIH.repositories;

import sn.uaz.Forum_PVVIH.entities.DemandeCorrection;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface DemandeCorrectionRepository extends MongoRepository<DemandeCorrection, String> {
    List<DemandeCorrection> findBySujetId(String sujetId);
    List<DemandeCorrection> findByUtilisateurId(String utilisateurId);
    List<DemandeCorrection> findByTraducteurId(String traducteurId);
    List<DemandeCorrection> findByStatut(String statut);
}
