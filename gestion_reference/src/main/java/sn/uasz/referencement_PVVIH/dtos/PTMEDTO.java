package sn.uasz.referencement_PVVIH.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PTMEDTO {
    private Long id;
    private LocalDate datePTME;
    private String statut;
    private String traitement;
    private String commentaire;
    private String dossierCode;
}
