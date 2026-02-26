package sn.uaz.Forum_PVVIH.entities;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "commentaires")
public class Commentaire {

    @Id
    private String id;

    @DBRef
    @Field("sujet")
    private Sujet sujet;

    @Field("auteur")
    private Object auteur; // Peut être UserInfo, DBRef, ou User pour compatibilité

    @DBRef
    @Field("parent")
    private Commentaire parent; // Pour les réponses

    @NotBlank(message = "Le contenu du commentaire est obligatoire")
    @Field("contenu_original")
    private String contenuOriginal;

    @Field("langue_originale")
    private String langueOriginale;

    @Builder.Default
    @Field("statut")
    private String statut = "DESACTIF"; // DESACTIF, ACTIF, INACTIF, SIGNALE

    @Builder.Default
    @Field("date_creation")
    private LocalDateTime dateCreation = LocalDateTime.now();

    @Builder.Default
    @Field("date_modification")
    private LocalDateTime dateModification = LocalDateTime.now();
}