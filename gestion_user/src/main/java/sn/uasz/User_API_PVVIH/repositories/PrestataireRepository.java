package sn.uasz.User_API_PVVIH.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.uasz.User_API_PVVIH.entities.Prestataire;

import java.util.List;
import java.util.Optional;

@Repository
public interface PrestataireRepository extends JpaRepository<Prestataire, Long> {

    // Méthode pour trouver les prestataires d'un hôpital
    List<Prestataire> findByHopitalId(Long hopitalId);
    
    // Méthode pour trouver un prestataire par nom et type (optionnel)
    Optional<Prestataire> findByNomAndType(String nom, Prestataire.TypePrestataire type);
}