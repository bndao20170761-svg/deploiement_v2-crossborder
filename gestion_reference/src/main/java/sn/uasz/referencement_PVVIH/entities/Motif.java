package sn.uasz.referencement_PVVIH.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;
@Entity
@Table(name = "motif")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Motif {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Boolean changementAdresse;
    private Boolean services;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "motif_autre_id")
    @JsonManagedReference
    private MotifAutres motifAutre;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "motif_changement_id")
    @JsonManagedReference
    private MotifChangement motifChangement;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "motif_serv_id")
    @JsonManagedReference
    private MotifServ motifServ;

    @ManyToOne
    @JoinColumn(name = "reference_id")
    @JsonBackReference
    private Reference reference;

}
