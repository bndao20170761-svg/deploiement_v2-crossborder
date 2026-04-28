package sn.uasz.referencement_PVVIH.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")

@Entity
@Table(name = "stade_oms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StadeOMS {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Boolean stade1;
    private Boolean stade2;
    private Boolean stade3;
    private Boolean stade4;

    @ManyToOne
    @JoinColumn(name = "reference_dossier_id")
    @JsonBackReference
    private ReferenceDossier referenceDossier;
}
