package sn.uaz.Forum_PVVIH.entities;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "sections")
public class Section {

    @Id
    private String id;

    @NotBlank(message = "Le code de section est obligatoire")
    @Field("code")
    private String code;

    @NotBlank(message = "Le nom français est obligatoire")
    @Field("nom_fr")
    private String nomFr;

    @NotBlank(message = "Le nom anglais est obligatoire")
    @Field("nom_en")
    private String nomEn;

    @NotBlank(message = "Le nom portugais est obligatoire")
    @Field("nom_pt")
    private String nomPt;

    @Field("description_fr")
    private String descriptionFr;

    @Field("description_en")
    private String descriptionEn;

    @Field("description_pt")
    private String descriptionPt;

    @Field("icone")
    private String icone;

    @Builder.Default
    @Field("ordre")
    private Integer ordre = 0;

    @Builder.Default
    @Field("date_creation")
    private LocalDateTime dateCreation = LocalDateTime.now();
}