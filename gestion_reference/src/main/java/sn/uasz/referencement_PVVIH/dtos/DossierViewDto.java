package sn.uasz.referencement_PVVIH.dtos;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class DossierViewDto {
    private String codeDossier;
    private String codePatient;
    private String nomComplet;
    private String doctorCreateNom;
    private String identificationBiom; // Base64
    private LocalDateTime dateCreation;

    // Pages du dossier
    private List<PageDTO> pages;
}
