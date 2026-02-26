package sn.uaz.Forum_PVVIH.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import sn.uaz.Forum_PVVIH.entities.Commentaire;
import sn.uaz.Forum_PVVIH.entities.Sujet;
import sn.uaz.Forum_PVVIH.entities.User;

import java.util.List;
import java.util.Optional;

public interface CommentaireRepository extends MongoRepository<Commentaire, String> {

    // Trouver tous les commentaires d'un sujet
    Page<Commentaire> findBySujetOrderByDateCreationAsc(Sujet sujet, Pageable pageable);
    
    // Trouver tous les commentaires d'un sujet (sans pagination)
    List<Commentaire> findBySujetOrderByDateCreationAsc(Sujet sujet);
    
    // Trouver les commentaires d'un auteur
    List<Commentaire> findByAuteurOrderByDateCreationDesc(User auteur);
    
    // Trouver les commentaires parents (sans parent)
    List<Commentaire> findBySujetAndParentIsNullOrderByDateCreationAsc(Sujet sujet);
    
    // Trouver les réponses à un commentaire
    List<Commentaire> findByParentOrderByDateCreationAsc(Commentaire parent);
    
    // Compter les commentaires d'un sujet
    long countBySujet(Sujet sujet);
    
    // Trouver un commentaire par ID avec vérification de l'auteur
    Optional<Commentaire> findByIdAndAuteur(String id, User auteur);
}