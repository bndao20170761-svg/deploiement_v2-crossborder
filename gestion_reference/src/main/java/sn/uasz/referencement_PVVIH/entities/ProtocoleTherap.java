package sn.uasz.referencement_PVVIH.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "protocole_therap")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProtocoleTherap {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String therapie;
    private LocalDate dateTherapie;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reference_dossier_id")
    @JsonIgnore
    private ReferenceDossier referenceDossier;

}
