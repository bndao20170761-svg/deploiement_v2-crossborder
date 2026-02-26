// SujetResponseDto.java
package sn.uaz.Forum_PVVIH.dtos;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import sn.uaz.Forum_PVVIH.entities.User;
import sn.uaz.Forum_PVVIH.entities.Section;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SujetResponseDto {
    private String id;
    private String titreOriginal;
    private String contenuOriginal;
    private String langueOriginale;
    private User auteur;
    private Section section;
    private String type;
    private boolean statut;
    private Integer nombreVus;
    private Integer nombreCommentaires;
    private LocalDateTime dateCreation;
    private LocalDateTime dateModification;
}