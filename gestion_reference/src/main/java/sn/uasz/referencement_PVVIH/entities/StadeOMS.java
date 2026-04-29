package sn.uasz.referencement_PVVIH.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reference_dossier_id")
    @JsonIgnore
    private ReferenceDossier referenceDossier;

}
