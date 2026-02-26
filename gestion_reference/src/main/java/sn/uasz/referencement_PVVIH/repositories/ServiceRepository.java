package sn.uasz.referencement_PVVIH.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import sn.uasz.referencement_PVVIH.entities.RenseignementStade;
import sn.uasz.referencement_PVVIH.entities.Service;

public interface ServiceRepository extends JpaRepository<Service, Long> {
}
