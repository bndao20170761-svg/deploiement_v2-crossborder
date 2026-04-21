package sn.uasz.referencement_PVVIH.dtos;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DossierDto {
    private String codeDossier;
    private String codePatient;
    private String nomComplet;
    private String doctorCreateNom;
    private String doctorCreateCode;
    private String identificationBiom;
    private String irisImageBase64;
    private LocalDateTime dateCreation;
    private LocalDateTime dateModification;
    private String biometricStatus;
    private String codification;
    private String notification;
}
