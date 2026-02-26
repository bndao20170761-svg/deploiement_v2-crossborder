package sn.uasz.Patient_PVVIH.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class Suivi_Immunovirologique {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String datePrelevement;
    private String dateResultat;
    private String resultatCV;     // Charge virale

    private String dateCD4;
    private String resultatCD4;
    private String cd4Categorie;   // >=200 ou <200

    // --- Relation avec Page ---
    @ManyToOne
    @JoinColumn(name = "page_id")
    @JsonBackReference
    private Page page;
}
