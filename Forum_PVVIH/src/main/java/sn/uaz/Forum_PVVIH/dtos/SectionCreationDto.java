// SectionCreationDto.java
package sn.uaz.Forum_PVVIH.dtos;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class SectionCreationDto {
    
    @NotBlank(message = "Le code de section est obligatoire")
    private String code;
    
    @NotBlank(message = "Le nom français est obligatoire")
    private String nomFr;
    
    @NotBlank(message = "Le nom anglais est obligatoire")
    private String nomEn;
    
    @NotBlank(message = "Le nom portugais est obligatoire")
    private String nomPt;
    
    private String descriptionFr;
    private String descriptionEn;
    private String descriptionPt;
    
    private String icone;
    private Integer ordre;
}