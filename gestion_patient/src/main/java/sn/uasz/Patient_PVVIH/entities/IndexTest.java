package sn.uasz.Patient_PVVIH.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IndexTest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;
    private String type;
    private Integer age;
    private String sexe;
    private String statut;
    private String resultat;
    private String soins;
    private String identifiant;

    @ManyToOne
    @JoinColumn(name = "page_id")
    @JsonBackReference
    private Page page;
}
