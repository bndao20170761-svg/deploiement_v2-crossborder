package sn.uasz.referencement_PVVIH.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.uasz.referencement_PVVIH.entities.RenseignementProfil;

@Repository
public interface RenseignementProfilRepository extends JpaRepository<RenseignementProfil, Long> {
}
