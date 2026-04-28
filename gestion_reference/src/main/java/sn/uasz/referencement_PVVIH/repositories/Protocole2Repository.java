package sn.uasz.referencement_PVVIH.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.uasz.referencement_PVVIH.entities.Protocole2;

import java.util.List;

@Repository
public interface Protocole2Repository extends JpaRepository<Protocole2, Long> {
    List<Protocole2> findByReferenceDossierId(Long referenceDossierId);
    void deleteByReferenceDossierId(Long referenceDossierId);
}
