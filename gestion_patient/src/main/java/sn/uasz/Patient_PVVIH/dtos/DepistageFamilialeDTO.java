package sn.uasz.Patient_PVVIH.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepistageFamilialeDTO {
    private Long id;
    private String nom;
    private String type;
    private Integer age;
    private String sexe;
    private String statut;
    private String resultat;
    private String soins;
    private String identifiant;
    private Long pageId;
}
