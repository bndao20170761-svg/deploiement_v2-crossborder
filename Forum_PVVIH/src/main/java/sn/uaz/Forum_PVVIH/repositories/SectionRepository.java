package sn.uaz.Forum_PVVIH.repositories;

import sn.uaz.Forum_PVVIH.entities.Section;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;
// SectionRepository.java

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import sn.uaz.Forum_PVVIH.entities.Section;
import java.util.List;
import java.util.Optional;

public interface SectionRepository extends MongoRepository<Section, String> {

    Optional<Section> findByCode(String code);

    List<Section> findAllByOrderByOrdreAsc();

    @Query("{ 'ordre': { $gte: ?0 } }")
    List<Section> findByOrdreGreaterThanEqual(Integer ordre);

    boolean existsByCode(String code);
}