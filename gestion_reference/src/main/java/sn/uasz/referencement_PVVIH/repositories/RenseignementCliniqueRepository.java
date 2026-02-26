package sn.uasz.referencement_PVVIH.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.uasz.referencement_PVVIH.entities.RenseignementClinique;

@Repository
public interface RenseignementCliniqueRepository extends JpaRepository<RenseignementClinique, Long> {
}
