package sn.uasz.Patient_PVVIH.dtos;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DossierDTO {
    private String codeDossier;
    private String codePatient;
    private String doctorCode;
    private String codificationNationale;
    private String numeroNotification;

    // ✅ CHANGEMENT: identificationBiom devient le template d'iris
    private String identificationBiom; // Template iris encodé

    // ✅ Image brute de l'iris pour l'extraction (non stockée en base)
    private String irisImageBase64;
    private String biometricStatus;

    private List<PageDTO> pages;
}