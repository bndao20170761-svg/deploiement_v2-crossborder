package sn.uasz.Patient_PVVIH.dtos;

import lombok.Data;
import org.springframework.data.domain.jaxb.SpringDataJaxb;

import java.util.List;
// package sn.uasz.Patient_PVVIH.dtos;

import lombok.Data;
import java.util.List;

@Data
public class DossierViewDto {
    private String codeDossier;
    private String codePatient;
    private String nomComplet;
    private String doctorCreateNom;
    private String identificationBiom; // Base64

    // ⚠️ Ici on utilise ton propre DTO et non celui de Spring
    private List<PageDTO> pages;
}
