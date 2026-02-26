package sn.uasz.referencement_PVVIH.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.uasz.referencement_PVVIH.entities.RenseignementStade;

@Repository
public interface RenseignementStadeRepository extends JpaRepository<RenseignementStade, Long> {
}
