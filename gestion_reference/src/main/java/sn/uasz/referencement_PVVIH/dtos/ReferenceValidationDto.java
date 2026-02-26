package sn.uasz.referencement_PVVIH.dtos;

import lombok.Data;

@Data

public class ReferenceValidationDto {
    private Long id;
    private Boolean validation;
    private String medecinAuteurId;  // <-- changé en String
    private String medecinAuteurNom;
}

