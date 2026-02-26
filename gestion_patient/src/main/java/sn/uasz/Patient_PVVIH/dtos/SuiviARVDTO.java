package sn.uasz.Patient_PVVIH.dtos;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import sn.uasz.Patient_PVVIH.config.BooleanDeserializer;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SuiviARVDTO {
    private Long id;
    private Long pageId;

    private LocalDate dateVisite;
    private String situationArv;
    private String changementLignePreciser;
    private String protocole;
    private String substitutionMotif;
    private String substitutionPrecision;
    private String stadeCliniqueOms;
    @JsonDeserialize(using = BooleanDeserializer.class)
    private Boolean observanceCorrecte;
    private String evaluationNutritionnelle;
    private String classification;
    private String modeleSoinsNumero;
    private LocalDate prochainRdv;
}
