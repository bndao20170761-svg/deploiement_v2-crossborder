package sn.uaz.Forum_PVVIH.entities;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    private String id;

    @NotBlank(message = "Le nom d'utilisateur est obligatoire")
    @Field("username")
    private String username;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Field("password")
    private String password;

    @NotBlank(message = "Le nom est obligatoire")
    @Field("nom")
    private String nom;

    @NotBlank(message = "Le prénom est obligatoire")
    @Field("prenom")
    private String prenom;

    @Field("nationalite")
    private String nationalite;

    @Builder.Default
    @Field("email")
    private String email = "user@uaz.sn";

    @Builder.Default
    @Field("langue_preferee")
    private String languePreferee = "fr";

    @Builder.Default
    @Field("profil")
    private String profil = "USER"; // MEMBRE, USER, DOCTOR, ASSISTANT, ADMIN

    @Builder.Default
    @Field("active")
    private boolean active = true;

    @Builder.Default
    @Field("date_creation")
    private LocalDateTime dateCreation = LocalDateTime.now();

    @Field("date_dernier_acces")
    private LocalDateTime dateDernierAcces;
    // Pour les traducteurs
    @Field("telephone")
    private String telephone;

    @Field("specialite")
    private String specialite; // MEDICAL, GENERAL

    @Builder.Default
    @Field("score")
    private Integer score = 100;

    @Builder.Default
    @Field("nombre_traductions")
    private Integer nombreTraductions = 0;

    @Builder.Default
    @Field("disponible")
    private boolean disponible = true;

    // Nouveaux attributs
    @Field("sexe")
    private String sexe;

    @Field("statut_matrimoniale")
    private String statutMatrimoniale;
}