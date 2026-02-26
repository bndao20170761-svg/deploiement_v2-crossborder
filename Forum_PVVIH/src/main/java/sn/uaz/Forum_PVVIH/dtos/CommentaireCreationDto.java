package sn.uaz.Forum_PVVIH.dtos;

import lombok.*;
import jakarta.validation.constraints.NotBlank;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentaireCreationDto {
    
    @NotBlank(message = "Le contenu du commentaire est obligatoire")
    private String contenu;
    
    private String langue;
    
    private String parentId; // Pour les réponses à un commentaire
}