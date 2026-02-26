// SujetCreationDto.java
package sn.uaz.Forum_PVVIH.dtos;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class SujetCreationDto {
    
    @NotBlank(message = "Le titre est obligatoire")
    private String titre;
    
    @NotBlank(message = "Le contenu est obligatoire")
    private String contenu;
    
    private String langue; // Optionnel: "fr", "en", "pt"
    
    @NotBlank(message = "La section est obligatoire")
    private String sectionId;
    
    private String type = "DISCUSSION"; // DISCUSSION, QUESTION, INFO
}