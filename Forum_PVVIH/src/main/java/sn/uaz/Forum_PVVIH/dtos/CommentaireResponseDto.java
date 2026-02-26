package sn.uaz.Forum_PVVIH.dtos;

import lombok.*;
import sn.uaz.Forum_PVVIH.entities.User;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentaireResponseDto {
    
    private String id;
    private String contenuOriginal;
    private String langueOriginale;
    private User auteur;
    private String statut;
    private LocalDateTime dateCreation;
    private LocalDateTime dateModification;
    private String parentId; // ID du commentaire parent pour les réponses
    private SujetInfo sujet; // Informations du sujet pour les notifications
}