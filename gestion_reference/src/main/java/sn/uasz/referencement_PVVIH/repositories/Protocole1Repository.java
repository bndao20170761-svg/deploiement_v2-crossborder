package sn.uasz.referencement_PVVIH.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.uasz.referencement_PVVIH.entities.Protocole1;

import java.util.List;

@Repository
public interface Protocole1Repository extends JpaRepository<Protocole1, Long> {
    List<Protocole1> findByReferenceDossierId(Long referenceDossierId);
    void deleteByReferenceDossierId(Long referenceDossierId);
}
