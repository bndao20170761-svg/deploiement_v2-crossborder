package sn.uasz.Patient_PVVIH.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import sn.uasz.Patient_PVVIH.config.BooleanDeserializer;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class SuiviARV {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JsonBackReference
    private Page page;

    private LocalDate dateVisite;
    private String situationArv;
    private String changementLignePreciser;
    private String protocole;
    private String substitutionMotif;
    private String substitutionPrecision;
    private String stadeCliniqueOms;

    @JsonDeserialize(using = BooleanDeserializer.class)
    private Boolean observanceCorrecte; // true / false
    private String evaluationNutritionnelle;
    private String classification;
    private String modeleSoinsNumero;

    private LocalDate prochainRdv;
}
