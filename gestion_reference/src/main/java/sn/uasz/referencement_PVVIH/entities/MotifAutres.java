package sn.uasz.referencement_PVVIH.entities;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
@Entity
@Table(name = "motif_autres")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MotifAutres {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "autres_motif", nullable = false)
    private String autresMotif = "";

    @OneToMany(mappedBy = "motifAutre", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    @Builder.Default
    private List<Motif> motifs = new ArrayList<>();



}
