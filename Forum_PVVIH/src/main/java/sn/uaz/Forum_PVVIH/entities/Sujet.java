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
@Document(collection = "sujets")
public class Sujet {

    @Id
    private String id;

    @NotBlank(message = "Le titre est obligatoire")
    @Field("titre_original")
    private String titreOriginal;

    @NotBlank(message = "Le contenu est obligatoire")
    @Field("contenu_original")
    private String contenuOriginal;

    @NotBlank(message = "La langue originale est obligatoire")
    @Field("langue_originale")
    private String langueOriginale; // fr, en, pt

    @Field("auteur")
    private Object auteur; // Peut être UserInfo, DBRef, ou User pour compatibilité

    @DBRef
    @Field("section")
    private Section section;

    @Builder.Default
    @Field("type")
    private String type = "DISCUSSION"; // DISCUSSION, QUESTION, INFO

    @Field("statut")
    private Object statut; // Peut être boolean ou String pour compatibilité
    
    // Getters et setters pour le statut avec conversion automatique
    public boolean getStatut() {
        if (statut == null) {
            return false; // Valeur par défaut
        }
        if (statut instanceof Boolean) {
            return (Boolean) statut;
        }
        if (statut instanceof String) {
            return "ACTIF".equals(statut);
        }
        return false;
    }
    
    public void setStatut(boolean statut) {
        this.statut = statut;
    }
    
    public void setStatutString(String statut) {
        this.statut = statut;
    }

    @Builder.Default
    @Field("nombre_vus")
    private Integer nombreVus = 0;

    @Builder.Default
    @Field("nombre_commentaires")
    private Integer nombreCommentaires = 0;

    @Builder.Default
    @Field("nombre_commentaires_desactif")
    private Integer nombreCommentairesDesactif = 0;

    @Builder.Default
    @Field("traduction_auto")
    private boolean traductionAuto = true;

    @Builder.Default
    @Field("qualite_traduction")
    private String qualiteTraduction = "BONNE"; // BONNE, MOYENNE, FAIBLE

    @Field("date_derniere_traduction")
    private LocalDateTime dateDerniereTraduction;

    @Builder.Default
    @Field("date_creation")
    private LocalDateTime dateCreation = LocalDateTime.now();

    @Builder.Default
    @Field("date_modification")
    private LocalDateTime dateModification = LocalDateTime.now();
}