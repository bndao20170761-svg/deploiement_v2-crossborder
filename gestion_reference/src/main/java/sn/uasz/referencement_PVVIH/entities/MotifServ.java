package sn.uasz.referencement_PVVIH.entities;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
@Entity
@Table(name = "motif_serv")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MotifServ {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Boolean arv;
    private Boolean bilan;
    private Boolean io;
    private Boolean ptme;
    private Boolean suivi;





    @OneToMany(mappedBy = "motifServ", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    @Builder.Default
    private List<Motif> motifs = new ArrayList<>();

}
