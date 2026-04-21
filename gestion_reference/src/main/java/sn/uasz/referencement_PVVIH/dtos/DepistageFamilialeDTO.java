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
public class DepistageFamilialeDTO {
    private Long id;
    private LocalDate dateDepistage;
    private String typeDepistage;
    private String resultat;
    private String commentaire;
    private String dossierCode;
}
