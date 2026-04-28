package sn.uasz.referencement_PVVIH.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.uasz.referencement_PVVIH.entities.ProtocoleTherap;

import java.util.List;

@Repository
public interface ProtocoleTherapRepository extends JpaRepository<ProtocoleTherap, Long> {
    List<ProtocoleTherap> findByReferenceDossierId(Long referenceDossierId);
    void deleteByReferenceDossierId(Long referenceDossierId);
}
