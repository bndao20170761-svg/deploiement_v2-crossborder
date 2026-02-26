package sn.uaz.Forum_PVVIH.entities;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "translations")
public class Translation {
    
    @Id
    private String id;
    
    @Field("original_text")
    private String originalText;
    
    @Field("translated_text")
    private String translatedText;
    
    @Field("source_language")
    private String sourceLanguage;
    
    @Field("target_language")
    private String targetLanguage;
    
    @Field("translation_provider")
    private String translationProvider; // GOOGLE, LIBRE, CACHED
    
    @Field("confidence_score")
    private Double confidenceScore;
    
    @Field("sujet_id")
    private String sujetId;
    
    @Field("commentaire_id")
    private String commentaireId;
    
    @Field("user_id")
    private String userId;
    
    @Builder.Default
    @Field("date_creation")
    private LocalDateTime dateCreation = LocalDateTime.now();
    
    @Field("date_modification")
    private LocalDateTime dateModification;
    
    @Builder.Default
    @Field("is_approved")
    private boolean isApproved = false;
    
    @Field("approved_by")
    private String approvedBy;
    
    @Field("approval_date")
    private LocalDateTime approvalDate;
}












