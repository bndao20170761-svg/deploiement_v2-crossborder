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
public class SuiviImmunovirologiqueDTO {
    private Long id;
    private LocalDate dateSuivi;
    private String resultat;
    private String traitement;
    private String commentaire;
    private String dossierCode;
}
