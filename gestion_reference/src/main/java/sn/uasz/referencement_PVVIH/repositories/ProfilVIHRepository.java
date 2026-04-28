package sn.uasz.referencement_PVVIH.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import sn.uasz.referencement_PVVIH.entities.ProfilVIH;

import java.util.List;

public interface ProfilVIHRepository extends JpaRepository<ProfilVIH, Long> {
    List<ProfilVIH> findByReferenceDossierId(Long referenceDossierId);
    void deleteByReferenceDossierId(Long referenceDossierId);
}
