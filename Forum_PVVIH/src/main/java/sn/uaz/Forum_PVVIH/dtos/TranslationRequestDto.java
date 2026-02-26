package sn.uaz.Forum_PVVIH.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TranslationRequestDto {
    
    @NotBlank(message = "Le texte à traduire est obligatoire")
    private String text;
    
    @NotBlank(message = "La langue source est obligatoire")
    @Pattern(regexp = "^(fr|en|pt)$", message = "La langue source doit être fr, en ou pt")
    private String sourceLanguage;
    
    @NotBlank(message = "La langue cible est obligatoire")
    @Pattern(regexp = "^(fr|en|pt)$", message = "La langue cible doit être fr, en ou pt")
    private String targetLanguage;
    
    private String sujetId;
    private String commentaireId;
    private String userId;
    private boolean autoApprove = false;
}












