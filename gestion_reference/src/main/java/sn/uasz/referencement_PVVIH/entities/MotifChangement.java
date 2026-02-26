package sn.uasz.referencement_PVVIH.entities;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
@Entity
@Table(name = "motif_changement")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class MotifChangement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Boolean permanent;
    private Boolean temporaire;


    @OneToMany(mappedBy = "motifChangement", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    @Builder.Default
    private List<Motif> motifs = new ArrayList<>();

}
