// SectionDto.java
package sn.uaz.Forum_PVVIH.dtos;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SectionDto {
    private String id;
    private String code;
    private String nomFr;
    private String nomEn;
    private String nomPt;
    private String descriptionFr;
    private String descriptionEn;
    private String descriptionPt;
    private String icone;
    private Integer ordre;
    private LocalDateTime dateCreation;
    private Integer nombreSujets; // Optionnel: pour stats
}