package sn.uasz.referencement_PVVIH.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import sn.uasz.referencement_PVVIH.entities.StadeOMS;

import java.util.List;

public interface StadeOMSRepository extends JpaRepository<StadeOMS, Long> {
    List<StadeOMS> findByReferenceDossierId(Long referenceDossierId);
    void deleteByReferenceDossierId(Long referenceDossierId);
}
