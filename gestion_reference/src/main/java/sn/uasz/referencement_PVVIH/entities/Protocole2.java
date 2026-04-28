package sn.uasz.referencement_PVVIH.entities;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")


@Entity
@Table(name = "protocole2")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Protocole2 {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String protocole2emeLigne;
    private LocalDate dateProtocole2;

    @ManyToOne
    @JoinColumn(name = "reference_dossier_id")
    @JsonBackReference
    private ReferenceDossier referenceDossier;
    
    // Garder l'ancienne relation pour compatibilité
    @ManyToOne
    @JoinColumn(name = "renseignementClinique_id")
    @JsonBackReference
    private RenseignementClinique renseignementClinique;
}
