package sn.uasz.referencement_PVVIH.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "protocole1")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Protocole1 {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String protocole1ereLigne;
    private LocalDate dateProtocole1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reference_dossier_id")
    @JsonIgnore
    private ReferenceDossier referenceDossier;

}
