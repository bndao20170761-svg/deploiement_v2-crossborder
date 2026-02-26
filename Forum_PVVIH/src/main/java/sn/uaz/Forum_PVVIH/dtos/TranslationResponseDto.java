package sn.uaz.Forum_PVVIH.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TranslationResponseDto {
    
    private String id;
    private String originalText;
    private String translatedText;
    private String sourceLanguage;
    private String targetLanguage;
    private String translationProvider;
    private Double confidenceScore;
    private String sujetId;
    private String commentaireId;
    private String userId;
    private LocalDateTime dateCreation;
    private LocalDateTime dateModification;
    private boolean isApproved;
    private String approvedBy;
    private LocalDateTime approvalDate;
}












