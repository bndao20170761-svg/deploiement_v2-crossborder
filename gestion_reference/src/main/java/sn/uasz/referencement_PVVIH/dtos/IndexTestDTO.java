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
public class IndexTestDTO {
    private Long id;
    private String typeTest;
    private LocalDate dateTest;
    private String resultat;
    private String valeur;
    private String commentaire;
    private String dossierCode;
}
