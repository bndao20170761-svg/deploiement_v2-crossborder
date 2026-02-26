package sn.uasz.referencement_PVVIH.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.uasz.referencement_PVVIH.entities.ProtocoleTherap;

@Repository
public interface ProtocoleTherapRepository extends JpaRepository<ProtocoleTherap, Long> {
}
