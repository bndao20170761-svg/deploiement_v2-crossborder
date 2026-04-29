package sn.uasz.referencement_PVVIH.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reference_dossier_id")
    @JsonIgnore
    private ReferenceDossier referenceDossier;

}
