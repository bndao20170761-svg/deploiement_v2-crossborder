package sn.uaz.Forum_PVVIH.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import sn.uaz.Forum_PVVIH.entities.Translation;

import java.util.List;
import java.util.Optional;

public interface TranslationRepository extends MongoRepository<Translation, String> {
    
    // Trouver une traduction par texte original et langues
    Optional<Translation> findByOriginalTextAndSourceLanguageAndTargetLanguage(
            String originalText, String sourceLanguage, String targetLanguage);
    
    // Trouver les traductions d'un sujet
    List<Translation> findBySujetIdAndTargetLanguage(String sujetId, String targetLanguage);
    
    // Trouver les traductions d'un commentaire
    List<Translation> findByCommentaireIdAndTargetLanguage(String commentaireId, String targetLanguage);
    
    // Trouver les traductions approuvées
    List<Translation> findByIsApprovedTrueAndTargetLanguage(String targetLanguage);
    
    // Trouver les traductions d'un utilisateur
    List<Translation> findByUserId(String userId);
    
    // Supprimer les traductions d'un sujet
    void deleteBySujetId(String sujetId);
    
    // Supprimer les traductions d'un commentaire
    void deleteByCommentaireId(String commentaireId);
}












