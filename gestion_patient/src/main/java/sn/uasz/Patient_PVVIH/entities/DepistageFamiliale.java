package sn.uasz.Patient_PVVIH.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class DepistageFamiliale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;

    private String type; // "Conjoint(e)/Partenaire", "Enfant < 15 ans", "CDI"

    private Integer age;

    private String sexe; // "M" ou "F"

    private String statut; // VIH : Positif, Négatif, Inconnu

    private String resultat; // Résultat test : Positif, Négatif

    private String soins; // Enrôlé en soins : Oui / Non / NA

    private String identifiant; // N° ID (j’évite `id` pour ne pas confondre avec la clé primaire)

    // Relation avec Page
    @ManyToOne
    @JoinColumn(name = "page_id")
    @JsonBackReference
    private Page page;
}
