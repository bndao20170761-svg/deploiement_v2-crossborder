package sn.uasz.Patient_PVVIH.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class Bilan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String date;

    private String hb;            // Hémoglobine
    private String vgm;           // Volume globulaire moyen
    private String ccmh;          // Concentration corpusculaire moyenne Hb
    private String gb;            // Globules blancs
    private String neutrophiles;
    private String lymphocytes;
    private String plaquettes;

    private String alat;          // ALAT
    private String asat;          // ASAT
    private String glycemie;      // Glycémie
    private String creat;         // Créatinine

    private String aghbs;         // Ag HBs
    private String tb_lam;        // TB LAM
    private String ag_crypto;     // Antigène Cryptocoque
    private String genexpert;     // GeneXpert

    private String proteinurie;   // Protéinurie
    private String chol_total;    // Cholestérol total
    private String hdl;           // HDL
    private String ldl;           // LDL
    private String triglycerides; // Triglycérides

    private String depistage_col; // Dépistage cancer col
    private String syphilis;      // Syphilis

    // --- Relation avec Page ---
    @ManyToOne
    @JoinColumn(name = "page_id")
    @JsonBackReference
    private Page page;
}
