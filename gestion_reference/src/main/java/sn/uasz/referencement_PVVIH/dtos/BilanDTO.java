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
public class BilanDTO {
    private Long id;
    private String typeBilan;
    private LocalDate dateBilan;
    private String resultat;
    private String commentaire;
    private String dossierCode;
}
