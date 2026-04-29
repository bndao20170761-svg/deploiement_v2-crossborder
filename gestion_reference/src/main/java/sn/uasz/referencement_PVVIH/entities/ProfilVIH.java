package sn.uasz.referencement_PVVIH.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "profil_vih")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfilVIH {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate dateConfirmation;
    private Boolean indetermine;
    private Boolean profil1;
    private Boolean profil12;
    private Boolean profil2;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reference_dossier_id")
    @JsonIgnore
    private ReferenceDossier referenceDossier;

}
