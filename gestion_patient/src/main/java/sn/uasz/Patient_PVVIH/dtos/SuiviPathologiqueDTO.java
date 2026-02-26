package sn.uasz.Patient_PVVIH.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SuiviPathologiqueDTO {
    private Long id;
    private String date;
    private String taille;
    private String poids;
    private String imc;
    private String ta;
    private String temperature;
    private String pouls;
    private String rechercheTB;
    private String resultatTB;
    private String tpt;
    private String autresPathologies;
    private String cotrimoxazole;
    private Long pageId;
}
