package sn.uasz.Patient_PVVIH.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SuiviImmunovirologiqueDTO {
    private Long id;
    private String datePrelevement;
    private String dateResultat;
    private String resultatCV;
    private String dateCD4;
    private String resultatCD4;
    private String cd4Categorie;
    private Long pageId;
}
