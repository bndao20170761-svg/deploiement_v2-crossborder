package sn.uasz.Patient_PVVIH.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class SuiviPathologique {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String date;              // Date de suivi
    private String taille;            // Taille en cm
    private String poids;             // Poids en kg
    private String imc;               // IMC / PB / Z-score
    private String ta;                // Tension artérielle
    private String temperature;       // Température °C
    private String pouls;             // Pouls bat/min
    private String rechercheTB;       // 0=Oui,1=Non
    private String resultatTB;        // 0=Non présumé,1=Suspect,2=Confirmée
    private String tpt;               // 0=Non,1=Début,2=En cours,3=Fin
    private String autresPathologies; // Autres pathologies
    private String cotrimoxazole;     // 0=Oui,1=Non

    // --- Relation avec Page ---
    @ManyToOne
    @JoinColumn(name = "page_id")
    @JsonBackReference
    private Page page;
}
