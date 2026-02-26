package sn.uasz.Patient_PVVIH.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class PriseEnChargeTb {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String date;   // Date de suivi TB
    private String debut;  // Date de début traitement
    private String fin;    // Date de fin traitement
    private String issu;   // Issue du traitement (Guéri, Échec, Abandon, etc.)

    // --- Relation avec Page ---
    @ManyToOne
    @JoinColumn(name = "page_id")
    @JsonBackReference
    private Page page;
}
