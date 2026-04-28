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

    @ManyToOne
    @JoinColumn(name = "reference_dossier_id")
    @JsonBackReference
    private ReferenceDossier referenceDossier;
}
