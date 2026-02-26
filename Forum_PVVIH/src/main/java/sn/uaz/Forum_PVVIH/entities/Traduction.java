package sn.uaz.Forum_PVVIH.entities;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "traductions")
public class Traduction {

    @Id
    private String id;

    @DBRef
    @Field("sujet")
    private Sujet sujet;

    @Field("langue_cible")
    private String langueCible; // fr, en, pt

    @Field("titre_traduit")
    private String titreTraduit;

    @Field("contenu_traduit")
    private String contenuTraduit;

    @Builder.Default
    @Field("source_traduction")
    private String sourceTraduction = "API"; // API, HUMAIN

    @DBRef
    @Field("traducteur")
    private User traducteur; // Pour les corrections humaines

    @Builder.Default
    @Field("score_confiance")
    private Integer scoreConfiance = 90; // 0-100

    @Builder.Default
    @Field("date_traduction")
    private LocalDateTime dateTraduction = LocalDateTime.now();
}